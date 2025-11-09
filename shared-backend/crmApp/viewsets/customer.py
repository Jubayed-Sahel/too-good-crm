"""
Customer ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from crmApp.models import Customer, Call
from crmApp.serializers import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerListSerializer,
    CallSerializer,
)
from crmApp.services import RBACService
from crmApp.viewsets.mixins import (
    PermissionCheckMixin,
    OrganizationFilterMixin,
    CustomerActionsMixin,
    QueryFilterMixin,
)


class CustomerViewSet(
    viewsets.ModelViewSet,
    PermissionCheckMixin,
    OrganizationFilterMixin,
    CustomerActionsMixin,
    QueryFilterMixin,
):
    """
    ViewSet for Customer management.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action == 'create':
            return CustomerCreateSerializer
        return CustomerSerializer
    
    def perform_create(self, serializer):
        """Auto-set organization from user's current organization based on profile"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            organization = self.get_organization_from_request(self.request)
            
            if not organization:
                logger.error(f"No organization found for user {self.request.user.username}")
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'organization': 'Organization is required. Please ensure you have an active profile.'
                })
            
            # Check permission for creating customers
            try:
                self.check_permission(
                    self.request,
                    resource='customer',
                    action='create',
                    organization=organization
                )
            except Exception as e:
                logger.error(f"Permission check failed: {str(e)}")
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(f"You don't have permission to create customers: {str(e)}")
            
            logger.info(f"Creating customer for organization: {organization.id}, user: {self.request.user.username}")
            
            # Remove organization from validated_data if present (we'll set it ourselves)
            validated_data = serializer.validated_data
            validated_data.pop('organization', None)
            
            serializer.save(organization_id=organization.id)
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            raise
    
    def get_queryset(self):
        """Filter customers based on user's profile type"""
        queryset = Customer.objects.all()
        queryset = self.filter_by_organization(queryset, self.request)
        queryset = self.filter_customer_profile(queryset, self.request)
        queryset = self.apply_status_filter(queryset, self.request)
        queryset = self.apply_search_filter(queryset, self.request, ['name', 'email', 'company_name'])
        queryset = self.apply_assigned_to_filter(queryset, self.request)
        
        # Filter by customer type
        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
        
        return queryset.select_related('organization', 'assigned_to')
    
    def update(self, request, *args, **kwargs):
        """Override update to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'customer', 'update', instance=instance)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to check permissions"""
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'customer', 'delete', instance=instance)
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get customer statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'active': queryset.filter(status='active').count(),
            'inactive': queryset.filter(status='inactive').count(),
            'by_type': {
                'individual': queryset.filter(customer_type='individual').count(),
                'business': queryset.filter(customer_type='business').count(),
            }
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a customer - requires customer:update permission"""
        customer = self.get_object()
        self.check_permission(request, 'customer', 'update', instance=customer)
        
        customer.status = 'inactive'
        customer.save()
        
        return Response({
            'message': 'Customer deactivated successfully.',
            'customer': CustomerSerializer(customer).data
        })
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a customer - requires customer:update permission"""
        customer = self.get_object()
        self.check_permission(request, 'customer', 'update', instance=customer)
        
        customer.status = 'active'
        customer.save()
        
        return Response({
            'message': 'Customer activated successfully.',
            'customer': CustomerSerializer(customer).data
        })
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get customer notes"""
        customer = self.get_object()
        notes_data = self.get_customer_notes(customer)
        return Response(notes_data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to customer"""
        customer = self.get_object()
        note_text = request.data.get('note')
        
        if not note_text:
            return Response(
                {'error': 'Note text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permission
        self.check_customer_action_permission(request, customer)
        
        # Add note
        note = self.add_customer_note(customer, note_text, request.user)
        
        return Response({
            'id': note.id,
            'customer': note.customer_id,
            'user': note.created_by_id,
            'user_name': note.created_by.full_name,
            'note': note.description,
            'created_at': note.created_at
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get customer activities"""
        customer = self.get_object()
        activities_data = self.get_customer_activities(customer)
        return Response(activities_data)
    
    @action(detail=True, methods=['post'])
    def initiate_call(self, request, pk=None):
        """Initiate a VOIP call to customer via Twilio"""
        customer = self.get_object()
        
        # Check permission
        self.check_customer_action_permission(request, customer)
        
        # Initiate call
        success, call, error = self.initiate_customer_call(customer, request.user)
        
        if not success:
            if error.get('twilio_error_code'):
                return Response(error, status=status.HTTP_400_BAD_REQUEST)
            elif 'not configured' in error.get('error', '').lower():
                return Response(error, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            else:
                return Response(error, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Return call details
        return Response({
            'message': 'Call initiated successfully',
            'call': CallSerializer(call).data,
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def call_history(self, request, pk=None):
        """Get call history for customer"""
        customer = self.get_object()
        calls = Call.objects.filter(customer=customer).order_by('-created_at')
        return Response(CallSerializer(calls, many=True).data)

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
        
        # Get organization from request or use user's primary profile organization
        organization_id = self.request.data.get('organization')
        
        if not organization_id:
            # Fallback to user's primary profile organization
            primary_profile = self.request.user.user_profiles.filter(
                is_primary=True,
                status='active'
            ).first()
            
            if primary_profile:
                organization_id = primary_profile.organization_id
            else:
                # If no primary, get first active profile
                first_profile = self.request.user.user_profiles.filter(status='active').first()
                if first_profile:
                    organization_id = first_profile.organization_id
        
        logger.info(f"Creating customer for organization: {organization_id}, user: {self.request.user.username}")
        logger.info(f"Request data organization: {self.request.data.get('organization')}")
        
        serializer.save(organization_id=organization_id)
    
    def get_queryset(self):
        """Filter customers by user's organizations through user_profiles"""
        # Get organization IDs from user's active profiles
        user_orgs = self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
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
        user_orgs = request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
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

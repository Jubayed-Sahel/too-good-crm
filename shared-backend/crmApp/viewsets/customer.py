"""
Customer ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from crmApp.models import Customer
from crmApp.serializers import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerListSerializer,
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
        """
        Create customer with optional organization.
        Organization can come from:
        1. Explicitly provided in request data
        2. User's primary profile organization (fallback)
        3. None (for independent customers)
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Get organization from request (can be None/null for independent customers)
        organization_id = self.request.data.get('organization')
        
        # If not explicitly provided, try to use user's profile organization as default
        if organization_id is None:
            # Try to get from user's primary profile
            primary_profile = self.request.user.user_profiles.filter(
                is_primary=True,
                status='active'
            ).first()
            
            if primary_profile and primary_profile.organization_id:
                organization_id = primary_profile.organization_id
            else:
                # If no primary, get first active profile
                first_profile = self.request.user.user_profiles.filter(status='active').first()
                if first_profile and first_profile.organization_id:
                    organization_id = first_profile.organization_id
        
        logger.info(f"Creating customer - org: {organization_id}, user: {self.request.user.username}")
        
        # Save with organization_id (can be None)
        serializer.save(organization_id=organization_id)
    
    def get_queryset(self):
        """
        Filter customers by user's organizations through user_profiles.
        If user has no organization, show customers without organization.
        """
        # Get organization IDs from user's active profiles
        user_orgs = list(self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True))
        
        # Filter out None values
        user_orgs = [org_id for org_id in user_orgs if org_id is not None]
        
        if user_orgs:
            # User has organizations - show customers in those orgs OR customers with no org
            from django.db.models import Q
            queryset = Customer.objects.filter(
                Q(organization_id__in=user_orgs) | Q(organization_id__isnull=True)
            )
        else:
            # User has no organization - show only customers without organization
            queryset = Customer.objects.filter(organization_id__isnull=True)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            try:
                queryset = queryset.filter(organization_id=int(org_id))
            except (ValueError, TypeError):
                pass  # Invalid org_id, skip this filter
        
        # Only apply status filter for list action, not for retrieve/update/delete
        # This allows viewing/editing customers regardless of status
        # Note: action may be None when get_object() is called
        if getattr(self, 'action', None) == 'list':
            # Filter by status - default to active if not specified
            status_filter = self.request.query_params.get('status')
            if status_filter:
                if status_filter.lower() == 'all':
                    # Show all customers if explicitly requested
                    pass
                else:
                    queryset = queryset.filter(status=status_filter)
            else:
                # Default: only show active customers
                queryset = queryset.filter(status='active')
        
        # Filter by customer type
        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
        
        return queryset.select_related('organization', 'assigned_to')
    
    def get_object(self):
        """Override get_object to ensure we can retrieve customers regardless of status"""
        # Get the queryset without status filtering for retrieve/update/delete
        user_orgs = self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization if specified
        org_id = self.request.query_params.get('organization')
        if org_id:
            try:
                queryset = queryset.filter(organization_id=int(org_id))
            except (ValueError, TypeError):
                pass  # Invalid org_id, skip this filter
        
        # Don't apply status filter for get_object - allow viewing any customer
        queryset = queryset.select_related('organization', 'assigned_to')
        
        # Use the standard DRF get_object logic
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Convert lookup_value to int for pk/id lookups
        lookup_field = self.lookup_field
        if lookup_field in ('pk', 'id'):
            try:
                lookup_value = int(lookup_value)
            except (ValueError, TypeError):
                from rest_framework.exceptions import NotFound
                raise NotFound(f"Invalid customer ID: {lookup_value}")
        
        filter_kwargs = {lookup_field: lookup_value}
        
        try:
            obj = queryset.get(**filter_kwargs)
        except Customer.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound(f"Customer with ID {lookup_value} not found")
        
        # Check object-level permissions
        self.check_object_permissions(self.request, obj)
        return obj
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'customer', 'read', instance=instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
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


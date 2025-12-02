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


from crmApp.viewsets.mixins.audit_mixin import AuditLoggingMixin


class CustomerViewSet(
    AuditLoggingMixin,
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
        Create customer or link to existing customer.
        Multi-vendor support: If a customer with the same email exists,
        create a CustomerOrganization link instead of a duplicate customer.
        
        Organization comes from user's active profile via middleware.
        """
        import logging
        from crmApp.models import CustomerOrganization
        logger = logging.getLogger(__name__)
        
        # Set audit user for logging (from AuditLoggingMixin)
        self._set_audit_user()
        
        # Get organization from user's active profile using mixin method
        organization = self.get_organization_from_request(self.request)
        
        if not organization:
            logger.error(f"Cannot create customer - no organization context for user {self.request.user.username}")
            raise ValueError('Organization context is required. Please ensure you have an active profile with an organization.')
        
        organization_id = organization.id
        logger.info(f"Creating customer - org: {organization_id} ({organization.name}), user: {self.request.user.username}")
        
        # Check if customer with this email already exists (multi-vendor support)
        email = serializer.validated_data.get('email')
        if email:
            # Look for existing customer with same email
            existing_customer = Customer.objects.filter(email__iexact=email).first()
            
            if existing_customer:
                logger.info(f"Customer with email {email} exists (id={existing_customer.id}). Creating/updating CustomerOrganization link.")
                
                # Check if this customer is already linked to this vendor
                customer_org, created = CustomerOrganization.objects.get_or_create(
                    customer=existing_customer,
                    organization=organization,
                    defaults={
                        'relationship_status': 'active',
                        'vendor_notes': serializer.validated_data.get('notes', ''),
                    }
                )
                
                if not created:
                    # Already linked - update the relationship
                    logger.info(f"Customer already linked to organization. Updating relationship.")
                    if serializer.validated_data.get('notes'):
                        customer_org.vendor_notes = serializer.validated_data.get('notes')
                        customer_org.save()
                else:
                    logger.info(f"Created new CustomerOrganization link (id={customer_org.id})")
                
                # Return the existing customer (don't create duplicate)
                # Update the serializer instance to return existing customer data
                serializer.instance = existing_customer
                return existing_customer
        
        # No existing customer found - create new one
        customer = serializer.save(organization=organization)
        logger.info(f"Created new customer id={customer.id} for organization {organization.name}")
        return customer
    
    def get_queryset(self):
        """
        Filter customers by user's organizations.
        Shows customers that are linked to the vendor's organization(s) through:
        1. Primary organization (backward compatibility)
        2. Many-to-many relationship through CustomerOrganization
        """
        from django.db.models import Q
        
        # Get organization IDs from user's active profiles
        user_orgs = list(self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True))
        
        # Filter out None values
        user_orgs = [org_id for org_id in user_orgs if org_id is not None]
        
        if user_orgs:
            # Show customers that are linked to user's organization(s) either through:
            # - Primary organization (organization field)
            # - OR through many-to-many relationship (organizations field)
            queryset = Customer.objects.filter(
                Q(organization_id__in=user_orgs) |  # Primary organization
                Q(organizations__id__in=user_orgs) |  # Many-to-many
                Q(organization_id__isnull=True)  # No organization
            ).distinct()
        else:
            # User has no organization - show only customers without organization
            queryset = Customer.objects.filter(organization_id__isnull=True)
        
        # Filter by organization query parameter
        org_id = self.request.query_params.get('organization')
        if org_id:
            try:
                # Filter by BOTH primary organization AND many-to-many relationship
                queryset = queryset.filter(
                    Q(organization_id=int(org_id)) |  # Primary organization
                    Q(organizations__id=int(org_id))   # Many-to-many via CustomerOrganization
                ).distinct()
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
        
        return queryset.select_related('organization', 'assigned_to').prefetch_related(
            'customer_organizations',
            'customer_organizations__organization',
            'customer_organizations__assigned_employee'
        )
    
    def get_object(self):
        """Override get_object to ensure we can retrieve customers regardless of status"""
        from django.db.models import Q
        
        # Get the queryset without status filtering for retrieve/update/delete
        user_orgs = list(self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True))
        
        # Filter out None values
        user_orgs = [org_id for org_id in user_orgs if org_id is not None]
        
        if user_orgs:
            # Show customers linked to user's organizations via primary OR M2M
            queryset = Customer.objects.filter(
                Q(organization_id__in=user_orgs) |
                Q(organizations__id__in=user_orgs)
            ).distinct()
        else:
            queryset = Customer.objects.filter(organization_id__isnull=True)
        
        # Filter by organization if specified
        org_id = self.request.query_params.get('organization')
        if org_id:
            try:
                # Filter by BOTH primary organization AND many-to-many relationship
                queryset = queryset.filter(
                    Q(organization_id=int(org_id)) |
                    Q(organizations__id=int(org_id))
                ).distinct()
            except (ValueError, TypeError):
                pass  # Invalid org_id, skip this filter
        
        # Don't apply status filter for get_object - allow viewing any customer
        queryset = queryset.select_related('organization', 'assigned_to').prefetch_related(
            'customer_organizations',
            'customer_organizations__organization',
            'customer_organizations__assigned_employee'
        )
        
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
    
    @action(detail=True, methods=['post'])
    def add_vendor(self, request, pk=None):
        """
        Add this customer to another vendor organization.
        Creates a CustomerOrganization relationship.
        """
        from crmApp.models import CustomerOrganization, Organization
        from crmApp.serializers import CustomerOrganizationSerializer
        
        customer = self.get_object()
        organization_id = request.data.get('organization_id')
        
        if not organization_id:
            return Response(
                {'error': 'organization_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if organization exists
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if relationship already exists
        if CustomerOrganization.objects.filter(customer=customer, organization=organization).exists():
            return Response(
                {'error': 'Customer is already linked to this vendor'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the relationship
        customer_org = CustomerOrganization.objects.create(
            customer=customer,
            organization=organization,
            relationship_status=request.data.get('relationship_status', 'active'),
            assigned_employee_id=request.data.get('assigned_employee_id'),
            vendor_notes=request.data.get('vendor_notes', ''),
            vendor_customer_code=request.data.get('vendor_customer_code', ''),
            credit_limit=request.data.get('credit_limit'),
            payment_terms=request.data.get('payment_terms', '')
        )
        
        return Response(
            CustomerOrganizationSerializer(customer_org).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'])
    def remove_vendor(self, request, pk=None):
        """
        Remove this customer from a vendor organization.
        Deletes the CustomerOrganization relationship.
        """
        from crmApp.models import CustomerOrganization
        
        customer = self.get_object()
        organization_id = request.data.get('organization_id')
        
        if not organization_id:
            return Response(
                {'error': 'organization_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find and delete the relationship
        try:
            customer_org = CustomerOrganization.objects.get(
                customer=customer,
                organization_id=organization_id
            )
            customer_org.delete()
            
            return Response(
                {'message': 'Customer removed from vendor successfully'},
                status=status.HTTP_200_OK
            )
        except CustomerOrganization.DoesNotExist:
            return Response(
                {'error': 'Customer-vendor relationship not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def vendors(self, request, pk=None):
        """
        Get all vendors (organizations) this customer works with.
        """
        from crmApp.serializers import CustomerOrganizationSerializer
        
        customer = self.get_object()
        customer_orgs = customer.customer_organizations.all()
        
        return Response(
            CustomerOrganizationSerializer(customer_orgs, many=True).data
        )


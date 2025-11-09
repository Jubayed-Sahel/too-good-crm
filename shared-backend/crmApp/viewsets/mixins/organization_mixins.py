"""
Organization-related mixins for ViewSets.
"""

from crmApp.utils.profile_context import get_user_accessible_organizations


class OrganizationFilterMixin:
    """
    Mixin to filter querysets based on user's accessible organizations.
    """
    
    def get_accessible_organization_ids(self, user):
        """
        Get list of organization IDs accessible to the user.
        
        Args:
            user: User instance
            
        Returns:
            List of organization IDs
        """
        return get_user_accessible_organizations(user)
    
    def filter_by_organization(self, queryset, request):
        """
        Filter queryset by user's accessible organizations and query parameters.
        
        Args:
            queryset: Base queryset
            request: Request object
            
        Returns:
            Filtered queryset
        """
        # Filter by accessible organizations
        accessible_org_ids = self.get_accessible_organization_ids(request.user)
        
        if not accessible_org_ids:
            return queryset.model.objects.none()
        
        if hasattr(queryset.model, 'organization'):
            queryset = queryset.filter(organization_id__in=accessible_org_ids)
        
        # Filter by organization query parameter
        org_id = request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        return queryset
    
    def filter_customer_profile(self, queryset, request):
        """
        Apply special filtering for customer profiles.
        
        Args:
            queryset: Base queryset
            request: Request object
            
        Returns:
            Filtered queryset
        """
        if hasattr(request.user, 'active_profile') and request.user.active_profile:
            if request.user.active_profile.profile_type == 'customer':
                # Customers can only see their own records
                if hasattr(queryset.model, 'user'):
                    queryset = queryset.filter(user=request.user)
                elif hasattr(queryset.model, 'raised_by_customer'):
                    from crmApp.models import Customer
                    try:
                        customer = Customer.objects.get(
                            user=request.user,
                            organization=request.user.active_profile.organization
                        )
                        queryset = queryset.filter(raised_by_customer=customer)
                    except Customer.DoesNotExist:
                        return queryset.model.objects.none()
        
        return queryset


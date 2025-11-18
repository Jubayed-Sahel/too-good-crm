"""
Permission-related mixins for ViewSets.
"""

from rest_framework.exceptions import PermissionDenied
from crmApp.services import RBACService


class PermissionCheckMixin:
    """
    Mixin to provide common permission checking methods for ViewSets.
    """
    
    def get_organization_from_request(self, request, instance=None):
        """
        Get organization from request user's active profile or instance.
        Queries database directly to ensure organization is loaded.
        
        Args:
            request: The request object
            instance: Optional model instance to get organization from
            
        Returns:
            Organization instance or None
        """
        if instance and hasattr(instance, 'organization'):
            return instance.organization
        
        # Query database directly for active profile to ensure organization is loaded
        from crmApp.models import UserProfile
        try:
            active_profile = UserProfile.objects.filter(
                user=request.user,
                status='active',
                is_primary=True
            ).select_related('organization').first()
            
            if not active_profile:
                # Try any active profile if no primary
                active_profile = UserProfile.objects.filter(
                    user=request.user,
                    status='active'
                ).select_related('organization').first()
            
            if active_profile and active_profile.organization:
                return active_profile.organization
        except Exception:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error getting organization from request for user {request.user.id}", exc_info=True)
        
        # Fallback to request.user attributes if available
        if hasattr(request.user, 'current_organization') and request.user.current_organization:
            return request.user.current_organization
        
        if hasattr(request.user, 'active_profile') and request.user.active_profile:
            return request.user.active_profile.organization
        
        return None
    
    def check_permission(self, request, resource, action, organization=None, instance=None):
        """
        Check if user has permission for a resource and action.
        
        Args:
            request: The request object
            resource: Resource name (e.g., 'customer', 'deal')
            action: Action name (e.g., 'create', 'update', 'delete')
            organization: Optional organization (will be determined if not provided)
            instance: Optional model instance to get organization from
            
        Returns:
            bool: True if permission is granted
            
        Raises:
            PermissionDenied: If permission is not granted
        """
        if not organization:
            organization = self.get_organization_from_request(request, instance)
        
        if not organization:
            raise PermissionDenied('Organization is required. Please ensure you have an active profile.')
        
        # Check if user is a vendor - vendors have all permissions in their organization
        from crmApp.models import UserProfile
        
        # First check the active_profile set by middleware (most reliable)
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile:
            if active_profile.profile_type == 'vendor':
                # Verify the active profile's organization matches
                if active_profile.organization_id == organization.id:
                    # Vendors have all permissions in their organization
                    return True
            elif active_profile.profile_type == 'customer':
                # Customers have special permissions - handled by specific viewsets
                return True
        
        # Fallback: Query database directly for vendor profile
        vendor_profile = UserProfile.objects.filter(
            user=request.user,
            organization=organization,
            profile_type='vendor',
            status='active'
        ).first()
        
        if vendor_profile:
            # Vendors have all permissions in their organization
            return True
        
        # Check RBAC permission
        if not RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=resource,
            action=action
        ):
            raise PermissionDenied(f'Permission denied. Required: {resource}:{action}')
        
        return True
    
    def check_customer_permission(self, request, instance, action='update'):
        """
        Check if customer can perform action on their own resource.
        
        Args:
            request: The request object
            instance: Model instance
            action: Action being performed
            
        Raises:
            PermissionDenied: If customer doesn't own the resource
        """
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            # Check if customer owns the resource
            if hasattr(instance, 'raised_by_customer') and instance.raised_by_customer:
                if instance.raised_by_customer.user != request.user:
                    raise PermissionDenied(
                        f'Permission denied. You can only {action} resources you created.'
                    )
            elif hasattr(instance, 'user') and instance.user != request.user:
                raise PermissionDenied(
                    f'Permission denied. You can only {action} your own resources.'
                )


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
        
        IMPORTANT: For vendor/employee users, always use THEIR organization (not the instance's organization).
        For Customer instances, use the vendor's organization if user is vendor, not the customer's organization.
        
        Args:
            request: The request object
            instance: Optional model instance to get organization from
            
        Returns:
            Organization instance or None
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Query database directly for active profile to ensure organization is loaded
        from crmApp.models import UserProfile
        try:
            # First, get the user's active profile to determine their organization
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
            
            # For vendors and employees, ALWAYS use their organization (not the instance's organization)
            if active_profile and active_profile.organization:
                if active_profile.profile_type in ['vendor', 'employee']:
                    logger.debug(f"🔐 get_organization_from_request: Using user's {active_profile.profile_type} org {active_profile.organization.id} (not instance's org)")
                    return active_profile.organization
                
                # For customers or other profile types, we might use instance organization
                # But if instance is a Customer and user is vendor, we already returned above
                
                # Fallback: use active profile's organization if available
                return active_profile.organization
        except Exception:
            logger.warning(f"Error getting organization from request for user {request.user.id}", exc_info=True)
        
        # Fallback to request.user attributes if available
        if hasattr(request.user, 'current_organization') and request.user.current_organization:
            return request.user.current_organization
        
        if hasattr(request.user, 'active_profile') and request.user.active_profile:
            return request.user.active_profile.organization
        
        # Last resort: use instance's organization if it's not a Customer being accessed by vendor
        if instance and hasattr(instance, 'organization'):
            logger.debug(f"🔐 get_organization_from_request: Using instance's organization as fallback")
            return instance.organization
        
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
        import logging
        logger = logging.getLogger(__name__)
        
        # DEBUG: Log permission check start
        logger.debug(f"🔐 Permission check: user={request.user.username}, resource={resource}, action={action}")
        
        if not organization:
            organization = self.get_organization_from_request(request, instance)
        
        logger.debug(f"🔐 Organization from request: {organization.id if organization else None} ({organization.name if organization else 'None'})")
        
        if not organization:
            logger.warning(f"🔐 Permission DENIED: No organization found for user {request.user.username}")
            raise PermissionDenied('Organization is required. Please ensure you have an active profile.')
        
        # Check if user is a vendor - vendors have all permissions in their organization
        from crmApp.models import UserProfile
        
        # First check the active_profile set by middleware (most reliable)
        active_profile = getattr(request.user, 'active_profile', None)
        logger.debug(f"🔐 Active profile: {active_profile.profile_type if active_profile else 'None'} (org_id={active_profile.organization_id if active_profile else None})")
        
        # If active_profile is None, try to get it from database (middleware might not have set it)
        if not active_profile:
            logger.debug(f"🔐 Active profile is None, querying database...")
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
            
            if active_profile:
                logger.debug(f"🔐 Found active profile from DB: {active_profile.profile_type} (org_id={active_profile.organization_id})")
        
        if active_profile:
            if active_profile.profile_type == 'vendor':
                # For customer updates: check if customer belongs to vendor's org (either primary or via CustomerOrganization)
                if instance and hasattr(instance, '__class__') and instance.__class__.__name__ == 'Customer':
                    from crmApp.models import CustomerOrganization
                    logger.debug(f"🔐 Vendor updating customer: checking if customer belongs to vendor's org {active_profile.organization_id}")
                    
                    # Check 1: Customer's primary organization matches vendor's org
                    if hasattr(instance, 'organization') and instance.organization_id == active_profile.organization_id:
                        logger.debug(f"🔐 Permission GRANTED: Customer's primary org matches vendor's org")
                        return True
                    
                    # Check 2: Customer is linked to vendor's org via CustomerOrganization
                    customer_org_link = CustomerOrganization.objects.filter(
                        customer=instance,
                        organization_id=active_profile.organization_id
                    ).first()
                    
                    if customer_org_link:
                        logger.debug(f"🔐 Permission GRANTED: Customer is linked to vendor's org via CustomerOrganization")
                        return True
                    else:
                        logger.warning(f"🔐 Customer {instance.id} is NOT linked to vendor's org {active_profile.organization_id} (neither primary org nor CustomerOrganization link)")
                
                # For non-customer resources, verify the active profile's organization matches
                logger.debug(f"🔐 Vendor check: active_profile.organization_id={active_profile.organization_id}, organization.id={organization.id}")
                if active_profile.organization_id == organization.id:
                    # Vendors have all permissions in their organization
                    logger.debug(f"🔐 Permission GRANTED: Vendor {request.user.username} has access to org {organization.id}")
                    return True
                else:
                    logger.warning(f"🔐 Vendor organization mismatch: profile_org={active_profile.organization_id} != req_org={organization.id}")
            elif active_profile.profile_type == 'customer':
                # Customers have special permissions - handled by specific viewsets
                logger.debug(f"🔐 Permission GRANTED: Customer profile")
                return True
        
        # Fallback: Query database directly for vendor profile in the organization
        vendor_profile = UserProfile.objects.filter(
            user=request.user,
            organization=organization,
            profile_type='vendor',
            status='active'
        ).first()
        
        logger.debug(f"🔐 Vendor profile query (org={organization.id}): found={vendor_profile is not None}")
        
        if vendor_profile:
            # Vendors have all permissions in their organization
            logger.debug(f"🔐 Permission GRANTED: Vendor profile found in database")
            return True
        
        # Special handling for Customer instances: check CustomerOrganization links
        if instance and hasattr(instance, '__class__') and instance.__class__.__name__ == 'Customer':
            from crmApp.models import CustomerOrganization
            logger.debug(f"🔐 Customer instance detected (ID={instance.id}). Checking CustomerOrganization links for user's vendor orgs...")
            
            # Get all vendor profiles for this user
            user_vendor_profiles = UserProfile.objects.filter(
                user=request.user,
                profile_type='vendor',
                status='active'
            ).select_related('organization')
            
            logger.debug(f"🔐 User has {user_vendor_profiles.count()} vendor profile(s)")
            
            # Check if customer is linked to any of the user's vendor organizations
            for vendor_profile_check in user_vendor_profiles:
                if vendor_profile_check.organization:
                    customer_org_link = CustomerOrganization.objects.filter(
                        customer=instance,
                        organization_id=vendor_profile_check.organization_id
                    ).first()
                    
                    if customer_org_link:
                        logger.debug(f"🔐 Permission GRANTED: Customer is linked to user's vendor org {vendor_profile_check.organization_id} via CustomerOrganization")
                        return True
            
            logger.warning(f"🔐 Customer {instance.id} is NOT linked to any of user's vendor organizations")
        
        # Check RBAC permission
        logger.debug(f"🔐 Falling back to RBAC permission check...")
        if not RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=resource,
            action=action
        ):
            logger.warning(f"🔐 Permission DENIED: RBAC check failed for {request.user.username} on {resource}:{action} in org {organization.id}")
            raise PermissionDenied(f'Permission denied. Required: {resource}:{action}')
        
        logger.debug(f"🔐 Permission GRANTED: RBAC check passed")
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


"""
Custom Permission Classes for RBAC and Multi-Tenancy
"""

from rest_framework import permissions
from crmApp.services.rbac_service import RBACService


class HasOrganizationAccess(permissions.BasePermission):
    """
    Permission class to check if user has access to the organization context.
    Requires X-Organization-ID header to be set and valid.
    """
    
    message = "You do not have access to this organization."
    
    def has_permission(self, request, view):
        # Allow if no organization context required (e.g., listing user's orgs)
        if not hasattr(request, 'organization') or request.organization is None:
            return True
        
        # User must have active access to the organization
        return hasattr(request, 'organization') and request.organization is not None


class IsOrganizationOwner(permissions.BasePermission):
    """
    Permission class to check if user is the owner of the organization.
    Used for vendor-only operations.
    """
    
    message = "Only organization owners can perform this action."
    
    def has_permission(self, request, view):
        if not hasattr(request, 'is_organization_owner'):
            return False
        
        return request.is_organization_owner
    
    def has_object_permission(self, request, view, obj):
        """Check if user is owner of the object's organization"""
        if not hasattr(request, 'is_organization_owner'):
            return False
        
        # Object must belong to user's organization
        if hasattr(obj, 'organization'):
            if obj.organization != request.organization:
                return False
        
        return request.is_organization_owner


class HasResourcePermission(permissions.BasePermission):
    """
    DRF Permission class for strict RBAC enforcement.
    
    Best Practice Implementation:
    - Enforces permissions for ALL HTTP methods (including GET)
    - Vendors (org owners) have full access
    - Employees need explicit role permissions
    - Organization-scoped: users can only access their org's resources
    
    Usage in ViewSet:
        permission_classes = [IsAuthenticated, HasResourcePermission]
        resource_name = 'customers'
        
    This will check permissions like:
        - customers:read for GET/list
        - customers:create for POST
        - customers:update for PUT/PATCH
        - customers:delete for DELETE
    """
    
    message = "You do not have permission to perform this action."
    
    # Map HTTP methods to RBAC actions
    method_action_map = {
        'GET': 'read',
        'POST': 'create',
        'PUT': 'update',
        'PATCH': 'update',
        'DELETE': 'delete',
    }
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access the resource.
        Called for list and create operations.
        """
        # Get organization from middleware-set attribute or active profile
        organization = self._get_organization(request)
        if not organization:
            self.message = "You must have an active profile with an organization."
            return False
        
        # Get resource name from view
        resource_name = getattr(view, 'resource_name', None)
        if not resource_name:
            # If no resource name specified, skip RBAC (viewset handles its own logic)
            return True
        
        # Get action from HTTP method
        action = self.method_action_map.get(request.method)
        if not action:
            self.message = f"Unsupported HTTP method: {request.method}"
            return False
        
        # Check RBAC permission using RBACService
        # This will automatically:
        # 1. Grant full access to vendors (organization owners)
        # 2. Check employee role permissions from database
        # 3. Deny access if no permission found
        has_perm = RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=resource_name,
            action=action
        )
        
        if not has_perm:
            self.message = f"Permission denied. Required: {resource_name}:{action}"
        
        return has_perm
    
    def has_object_permission(self, request, view, obj):
        """
        Check permission for object-level access.
        Called for retrieve, update, partial_update, and destroy operations.
        """
        # Get organization from object or request
        organization = self._get_organization_from_object(request, obj)
        if not organization:
            self.message = "You must have an active profile with an organization."
            return False
        
        # CRITICAL: Ensure object belongs to user's organization
        # This prevents cross-organization data access
        if hasattr(obj, 'organization'):
            if obj.organization_id != organization.id:
                self.message = "You cannot access resources from other organizations."
                return False
        
        # Get resource name and action
        resource_name = getattr(view, 'resource_name', None)
        if not resource_name:
            return True
        
        action = self.method_action_map.get(request.method)
        if not action:
            self.message = f"Unsupported HTTP method: {request.method}"
            return False
        
        # Check RBAC permission
        has_perm = RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=resource_name,
            action=action
        )
        
        if not has_perm:
            self.message = f"Permission denied. Required: {resource_name}:{action}"
        
        return has_perm
    
    def _get_organization(self, request):
        """Get organization from request context"""
        # Try middleware-set attributes first
        if hasattr(request, 'organization') and request.organization:
            return request.organization
        
        if hasattr(request.user, 'current_organization') and request.user.current_organization:
            return request.user.current_organization
        
        if hasattr(request.user, 'active_profile') and request.user.active_profile:
            return request.user.active_profile.organization
        
        return None
    
    def _get_organization_from_object(self, request, obj):
        """Get organization from object or request"""
        # Try to get from object first
        if hasattr(obj, 'organization'):
            return obj.organization
        
        # Fallback to request context
        return self._get_organization(request)


# Legacy permissions for backward compatibility
class IsOrganizationMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the organization.
    """
    
    def has_object_permission(self, request, view, obj):
        # Get the organization from the object
        organization = None
        
        if hasattr(obj, 'organization'):
            organization = obj.organization
        elif hasattr(obj, 'organization_id'):
            from crmApp.models import Organization
            try:
                organization = Organization.objects.get(id=obj.organization_id)
            except Organization.DoesNotExist:
                return False
        
        if organization is None:
            return False
        
        # Check if user is member
        return request.user.user_organizations.filter(
            organization=organization,
            is_active=True
        ).exists()


class IsVendorProfile(permissions.BasePermission):
    """
    Permission class to check if user has active vendor profile.
    """
    
    message = "This action requires a vendor profile."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # If organization context is set, check for vendor profile in that org
        if hasattr(request, 'organization') and request.organization:
            return request.user.is_vendor(request.organization.id)
        
        # Otherwise, check if user has any vendor profile
        return request.user.is_vendor()


class IsEmployeeProfile(permissions.BasePermission):
    """
    Permission class to check if user has active employee profile.
    """
    
    message = "This action requires an employee profile."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # If organization context is set, check for employee profile in that org
        if hasattr(request, 'organization') and request.organization:
            return request.user.is_employee(request.organization.id)
        
        # Otherwise, check if user has any employee profile
        return request.user.is_employee()


class IsCustomerProfile(permissions.BasePermission):
    """
    Permission class to check if user has active customer profile.
    """
    
    message = "This action requires a customer profile."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # If organization context is set, check for customer profile in that org
        if hasattr(request, 'organization') and request.organization:
            return request.user.is_customer(request.organization.id)
        
        # Otherwise, check if user has any customer profile
        return request.user.is_customer()


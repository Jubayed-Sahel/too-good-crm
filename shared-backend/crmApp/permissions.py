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
    Permission class to check RBAC permissions for a resource.
    
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
    
    # Map HTTP methods to actions
    method_action_map = {
        'GET': 'read',
        'POST': 'create',
        'PUT': 'update',
        'PATCH': 'update',
        'DELETE': 'delete',
    }
    
    def has_permission(self, request, view):
        # Must have organization context for permission checking
        if not hasattr(request, 'organization') or request.organization is None:
            return False
        
        # Organization owners have all permissions
        if hasattr(request, 'is_organization_owner') and request.is_organization_owner:
            return True
        
        # Get resource name from view
        resource_name = getattr(view, 'resource_name', None)
        if not resource_name:
            # If no resource name specified, allow (viewset should handle its own logic)
            return True
        
        # Get action from HTTP method
        action = self.method_action_map.get(request.method)
        if not action:
            return False
        
        # Check RBAC permission
        has_perm = RBACService.check_permission(
            user=request.user,
            organization=request.organization,
            resource=resource_name,
            action=action
        )
        
        return has_perm
    
    def has_object_permission(self, request, view, obj):
        """Check permission for object-level access"""
        # Must have organization context
        if not hasattr(request, 'organization') or request.organization is None:
            return False
        
        # Organization owners have all permissions
        if hasattr(request, 'is_organization_owner') and request.is_organization_owner:
            return True
        
        # Object must belong to the same organization
        if hasattr(obj, 'organization'):
            if obj.organization != request.organization:
                return False
        
        # Check RBAC permission (same as has_permission)
        resource_name = getattr(view, 'resource_name', None)
        if not resource_name:
            return True
        
        action = self.method_action_map.get(request.method)
        if not action:
            return False
        
        has_perm = RBACService.check_permission(
            user=request.user,
            organization=request.organization,
            resource=resource_name,
            action=action
        )
        
        return has_perm


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


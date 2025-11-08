"""
Permission checking utilities for RBAC
"""
from django.db.models import Q
from crmApp.models import UserProfile, Role, Permission, RolePermission


class PermissionChecker:
    """
    Utility class to check user permissions within an organization.
    
    Usage:
        checker = PermissionChecker(user, organization)
        if checker.has_permission('customer', 'create'):
            # Allow action
        
        if checker.has_any_permission(['customer.create', 'customer.update']):
            # Allow action
    """
    
    def __init__(self, user, organization):
        self.user = user
        self.organization = organization
        self._permissions_cache = None
    
    def _get_user_permissions(self):
        """Get all permissions for the user in the organization (cached)"""
        if self._permissions_cache is not None:
            return self._permissions_cache
        
        # Check if user is vendor/owner - they have all permissions
        user_org = self.user.user_organizations.filter(
            organization=self.organization,
            is_active=True
        ).first()
        
        if user_org and user_org.is_owner:
            # Owners have all permissions
            all_perms = Permission.objects.filter(organization=self.organization)
            self._permissions_cache = set(f"{p.resource}.{p.action}" for p in all_perms)
            return self._permissions_cache
        
        # Get employee profile
        from crmApp.models import Employee
        employee = Employee.objects.filter(
            user=self.user,
            organization=self.organization,
            status='active'
        ).first()
        
        if not employee or not employee.role:
            # No employee record or no role assigned - no permissions
            self._permissions_cache = set()
            return self._permissions_cache
        
        # Get permissions from role
        role_permissions = RolePermission.objects.filter(
            role=employee.role,
            role__is_active=True
        ).select_related('permission')
        
        self._permissions_cache = set(
            f"{rp.permission.resource}.{rp.permission.action}" 
            for rp in role_permissions
        )
        
        return self._permissions_cache
    
    def has_permission(self, resource, action):
        """
        Check if user has a specific permission.
        
        Args:
            resource (str): Resource name (e.g., 'customer', 'deal', 'lead')
            action (str): Action name (e.g., 'create', 'read', 'update', 'delete')
        
        Returns:
            bool: True if user has permission, False otherwise
        """
        permission_key = f"{resource}.{action}"
        return permission_key in self._get_user_permissions()
    
    def has_any_permission(self, permission_list):
        """
        Check if user has any of the specified permissions.
        
        Args:
            permission_list (list): List of permission strings (e.g., ['customer.create', 'customer.update'])
        
        Returns:
            bool: True if user has at least one permission, False otherwise
        """
        user_perms = self._get_user_permissions()
        return any(perm in user_perms for perm in permission_list)
    
    def has_all_permissions(self, permission_list):
        """
        Check if user has all of the specified permissions.
        
        Args:
            permission_list (list): List of permission strings (e.g., ['customer.create', 'customer.read'])
        
        Returns:
            bool: True if user has all permissions, False otherwise
        """
        user_perms = self._get_user_permissions()
        return all(perm in user_perms for perm in permission_list)
    
    def get_all_permissions(self):
        """Get all permissions the user has"""
        return list(self._get_user_permissions())
    
    def is_owner(self):
        """Check if user is owner of the organization"""
        return self.user.user_organizations.filter(
            organization=self.organization,
            is_owner=True,
            is_active=True
        ).exists()


def check_permission(user, organization, resource, action):
    """
    Convenience function to check a single permission.
    
    Usage:
        if check_permission(request.user, organization, 'customer', 'create'):
            # Allow action
    """
    checker = PermissionChecker(user, organization)
    return checker.has_permission(resource, action)

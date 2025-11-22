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
    
    # Mapping of new permission categories to old resource names
    # This provides backward compatibility with existing frontend code
    RESOURCE_MAPPING = {
        'sales': ['customer', 'deal', 'lead'],  # sales permissions apply to customers, deals, leads
        'activities': ['activity'],  # activities permission applies to activity
        'issue': ['issue'],  # issue permission applies to issue
        'analytics': ['analytics', 'dashboard'],  # analytics permission applies to analytics and dashboard
        'team': ['employee', 'role', 'permission', 'team'],  # team permission applies to employee, role, permission management
    }
    
    def __init__(self, user, organization=None):
        self.user = user
        # If organization not provided, try to get from active profile
        if organization is None and hasattr(user, 'current_organization'):
            organization = user.current_organization
        self.organization = organization
        self._permissions_cache = None
    
    def _get_user_permissions(self):
        """Get all permissions for the user in the organization (cached)"""
        if self._permissions_cache is not None:
            return self._permissions_cache
        
        if not self.organization:
            self._permissions_cache = set()
            return self._permissions_cache
        
        # Check if user is vendor - vendors have all permissions in their organization
        vendor_profile = UserProfile.objects.filter(
            user=self.user,
            organization=self.organization,
            profile_type='vendor',
            status='active'
        ).first()
        
        if vendor_profile:
            # Vendors have all permissions in their organization
            all_perms = Permission.objects.filter(organization=self.organization)
            permissions = set()
            for p in all_perms:
                # Add the actual permission
                permissions.add(f"{p.resource}.{p.action}")
                
                # Add mapped permissions for backward compatibility
                if p.resource in self.RESOURCE_MAPPING:
                    for mapped_resource in self.RESOURCE_MAPPING[p.resource]:
                        permissions.add(f"{mapped_resource}.{p.action}")
            
            self._permissions_cache = permissions
            return self._permissions_cache
        
        # Check if user is employee - employees have permissions based on their role
        from crmApp.models import Employee, UserRole, RolePermission
        
        # Get employee record
        employee = Employee.objects.filter(
            user=self.user,
            organization=self.organization,
            status='active'
        ).first()
        
        if not employee:
            # Not an employee in this organization - no permissions
            self._permissions_cache = set()
            return self._permissions_cache
        
        # Get role IDs from Employee.role and UserRole assignments
        role_ids = set()
        
        # 1. Primary role from Employee.role
        if employee.role:
            role_ids.add(employee.role.id)
        
        # 2. Additional roles from UserRole
        user_role_ids = UserRole.objects.filter(
            user=self.user,
            organization=self.organization,
            is_active=True
        ).values_list('role_id', flat=True)
        
        role_ids.update(user_role_ids)
        
        if not role_ids:
            # Employee has no roles assigned - no permissions (except read might be allowed)
            self._permissions_cache = set()
            return self._permissions_cache
        
        # Get permissions from all roles
        role_permissions = RolePermission.objects.filter(
            role_id__in=role_ids,
            role__is_active=True,
            role__organization=self.organization
        ).select_related('permission')
        
        # Build permission set with both new and old resource names
        permissions = set()
        for rp in role_permissions:
            resource = rp.permission.resource
            action = rp.permission.action
            
            # Add the actual permission
            permissions.add(f"{resource}.{action}")
            
            # Add mapped permissions for backward compatibility
            if resource in self.RESOURCE_MAPPING:
                for mapped_resource in self.RESOURCE_MAPPING[resource]:
                    permissions.add(f"{mapped_resource}.{action}")
        
        self._permissions_cache = permissions
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
        """Check if user is vendor (owner) of the organization"""
        if not self.organization:
            return False
        
        # Check if user has vendor profile for this organization
        return UserProfile.objects.filter(
            user=self.user,
            organization=self.organization,
            profile_type='vendor',
            status='active'
        ).exists()
    
    def is_employee(self):
        """Check if user is employee of the organization"""
        if not self.organization:
            return False
        
        return UserProfile.objects.filter(
            user=self.user,
            organization=self.organization,
            profile_type='employee',
            status='active'
        ).exists()
    
    def is_vendor(self):
        """Check if user is vendor of the organization"""
        return self.is_owner()


def check_permission(user, organization, resource, action):
    """
    Convenience function to check a single permission.
    
    Usage:
        if check_permission(request.user, organization, 'customer', 'create'):
            # Allow action
    """
    checker = PermissionChecker(user, organization)
    return checker.has_permission(resource, action)

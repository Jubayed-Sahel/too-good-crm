"""
RBAC Permission Helpers
Utilities for role-based access control
"""

from typing import Optional, List
from django.http import HttpRequest
from crmApp.models import UserProfile, UserRole, Permission, Role


class PermissionChecker:
    """Helper class for checking user permissions"""
    
    def __init__(self, user, organization_id: Optional[int] = None):
        self.user = user
        self.organization_id = organization_id
    
    def has_permission(self, resource: str, action: str) -> bool:
        """
        Check if user has permission for a specific resource and action.
        
        Authorization hierarchy:
        1. Superusers → ALL permissions everywhere
        2. Staff users → ALL permissions everywhere
        3. Organization owners → ALL permissions in their organization
        4. Employees → Permissions based on assigned roles
        
        Args:
            resource: Resource name (e.g., 'customer', 'deal', 'lead')
            action: Action name (e.g., 'create', 'read', 'update', 'delete')
        
        Returns:
            bool: True if user has permission, False otherwise
        """
        # Superusers have all permissions everywhere
        if self.user.is_superuser:
            return True
        
        # Staff users (admins) have all permissions everywhere
        if self.user.is_staff:
            return True
        
        if not self.organization_id:
            return False
        
        # Organization owners have all permissions in their organization
        if self.is_organization_owner():
            return True
        
        # Check if user has specific permission through their roles
        user_roles = UserRole.objects.filter(
            user=self.user,
            organization_id=self.organization_id,
            is_active=True
        ).values_list('role_id', flat=True)
        
        if not user_roles:
            return False
        
        # Check if any of the user's roles have the required permission
        has_perm = Permission.objects.filter(
            organization_id=self.organization_id,
            resource=resource,
            action=action,
            role_permissions__role_id__in=user_roles
        ).exists()
        
        return has_perm
    
    def is_organization_owner(self) -> bool:
        """Check if user is the owner of the organization"""
        from crmApp.models import UserOrganization
        
        return UserOrganization.objects.filter(
            user=self.user,
            organization_id=self.organization_id,
            is_owner=True,
            is_active=True
        ).exists()
    
    def is_vendor(self) -> bool:
        """Check if user has vendor profile for this organization"""
        return UserProfile.objects.filter(
            user=self.user,
            organization_id=self.organization_id,
            profile_type='vendor',
            status='active'
        ).exists()
    
    def is_employee(self) -> bool:
        """Check if user has employee profile for this organization"""
        return UserProfile.objects.filter(
            user=self.user,
            organization_id=self.organization_id,
            profile_type='employee',
            status='active'
        ).exists()
    
    def is_customer(self) -> bool:
        """Check if user has customer profile for this organization"""
        return UserProfile.objects.filter(
            user=self.user,
            organization_id=self.organization_id,
            profile_type='customer',
            status='active'
        ).exists()
    
    def get_user_roles(self) -> List[str]:
        """Get list of role names for the user in this organization"""
        if not self.organization_id:
            return []
        
        return list(UserRole.objects.filter(
            user=self.user,
            organization_id=self.organization_id,
            is_active=True
        ).values_list('role__name', flat=True))
    
    def get_active_profile_type(self) -> Optional[str]:
        """Get the active profile type (vendor, employee, customer)"""
        # Get primary profile
        profile = UserProfile.objects.filter(
            user=self.user,
            is_primary=True,
            status='active'
        ).first()
        
        if not profile:
            # Get first active profile
            profile = UserProfile.objects.filter(
                user=self.user,
                status='active'
            ).first()
        
        return profile.profile_type if profile else None


def get_permission_checker(request: HttpRequest) -> Optional[PermissionChecker]:
    """
    Get permission checker from request.
    Extracts organization ID from query params or request data.
    """
    if not request.user or not request.user.is_authenticated:
        return None
    
    # Try to get organization ID from various sources
    organization_id = None
    
    # 1. From query params
    organization_id = request.query_params.get('organization') if hasattr(request, 'query_params') else None
    
    # 2. From POST data
    if not organization_id and request.method in ['POST', 'PUT', 'PATCH']:
        organization_id = request.data.get('organization') if hasattr(request, 'data') else None
    
    # 3. From user's primary profile
    if not organization_id:
        primary_profile = UserProfile.objects.filter(
            user=request.user,
            is_primary=True,
            status='active'
        ).first()
        
        if primary_profile:
            organization_id = primary_profile.organization_id
    
    return PermissionChecker(request.user, organization_id)


# Convenience functions
def has_permission(user, resource: str, action: str, organization_id: Optional[int] = None) -> bool:
    """Convenience function to check permission"""
    checker = PermissionChecker(user, organization_id)
    return checker.has_permission(resource, action)


def get_user_profile_type(user, organization_id: Optional[int] = None) -> Optional[str]:
    """Get user's active profile type"""
    checker = PermissionChecker(user, organization_id)
    return checker.get_active_profile_type()

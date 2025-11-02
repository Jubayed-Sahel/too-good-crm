"""
Custom permissions for CRM API
"""

from rest_framework import permissions


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


class IsOrganizationOwner(permissions.BasePermission):
    """
    Permission to check if user is the owner of the organization.
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
        
        # Check if user is owner
        return request.user.user_organizations.filter(
            organization=organization,
            is_owner=True,
            is_active=True
        ).exists()


class IsOrganizationAdmin(permissions.BasePermission):
    """
    Permission to check if user is an admin in the organization.
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
        
        # Check if user is owner or admin
        membership = request.user.user_organizations.filter(
            organization=organization,
            is_active=True
        ).first()
        
        if not membership:
            return False
        
        return membership.is_owner or membership.is_admin


class CanManageRoles(permissions.BasePermission):
    """
    Permission to check if user can manage roles.
    Requires specific permission or organization admin status.
    """
    
    def has_permission(self, request, view):
        # Check if user has the permission
        from crmApp.models import Permission
        
        # Get user's organizations
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        # Check for manage_roles permission
        has_permission = Permission.objects.filter(
            organization_id__in=user_orgs,
            resource='roles',
            action='manage',
            role_permissions__role__user_roles__user=request.user,
            role_permissions__role__user_roles__is_active=True
        ).exists()
        
        if has_permission:
            return True
        
        # Check if user is admin in any organization
        return request.user.user_organizations.filter(
            organization_id__in=user_orgs,
            is_admin=True,
            is_active=True
        ).exists()

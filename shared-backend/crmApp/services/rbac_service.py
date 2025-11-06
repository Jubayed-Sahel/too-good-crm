"""
RBAC Service for permission checking and role management
"""

from typing import Optional, List
from django.db.models import Q
from crmApp.models import Permission, Role, UserRole, Employee, User, Organization


class RBACService:
    """Service class for RBAC operations"""
    
    @staticmethod
    def check_permission(
        user: User,
        organization: Organization,
        resource: str,
        action: str
    ) -> bool:
        """
        Check if user has permission for resource:action in organization.
        Checks both Employee.role and UserRole assignments.
        
        Args:
            user: User instance
            organization: Organization instance
            resource: Resource name (e.g., 'customers', 'deals')
            action: Action name (e.g., 'create', 'read', 'update', 'delete')
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        # Check if user is organization owner (has all permissions)
        is_owner = user.user_organizations.filter(
            organization=organization,
            is_owner=True,
            is_active=True
        ).exists()
        
        if is_owner:
            return True
        
        # Get all roles for the user in this organization
        role_ids = set()
        
        # 1. Check Employee.role (primary role)
        try:
            employee = Employee.objects.get(
                user=user,
                organization=organization,
                status='active'
            )
            if employee.role:
                role_ids.add(employee.role.id)
        except Employee.DoesNotExist:
            pass
        
        # 2. Check UserRole assignments (additional roles)
        user_roles = UserRole.objects.filter(
            user=user,
            organization=organization,
            is_active=True
        ).values_list('role_id', flat=True)
        
        role_ids.update(user_roles)
        
        if not role_ids:
            return False
        
        # Check if any of the user's roles have the required permission
        has_permission = Permission.objects.filter(
            organization=organization,
            resource=resource,
            action=action,
            role_permissions__role_id__in=role_ids
        ).exists()
        
        return has_permission
    
    @staticmethod
    def get_user_permissions(
        user: User,
        organization: Organization
    ) -> List[dict]:
        """
        Get all permissions for a user in an organization.
        
        Args:
            user: User instance
            organization: Organization instance
            
        Returns:
            List of permission dictionaries
        """
        # Get all roles for the user
        role_ids = set()
        
        # Employee role
        try:
            employee = Employee.objects.get(
                user=user,
                organization=organization,
                status='active'
            )
            if employee.role:
                role_ids.add(employee.role.id)
        except Employee.DoesNotExist:
            pass
        
        # User roles
        user_roles = UserRole.objects.filter(
            user=user,
            organization=organization,
            is_active=True
        ).values_list('role_id', flat=True)
        
        role_ids.update(user_roles)
        
        if not role_ids:
            return []
        
        # Get all unique permissions from these roles
        permissions = Permission.objects.filter(
            organization=organization,
            role_permissions__role_id__in=role_ids
        ).distinct().values('id', 'resource', 'action', 'description')
        
        return list(permissions)
    
    @staticmethod
    def get_user_roles(
        user: User,
        organization: Organization
    ) -> List[Role]:
        """
        Get all roles assigned to a user in an organization.
        Includes both Employee.role and UserRole assignments.
        
        Args:
            user: User instance
            organization: Organization instance
            
        Returns:
            List of Role instances
        """
        role_ids = set()
        
        # Employee role
        try:
            employee = Employee.objects.get(
                user=user,
                organization=organization,
                status='active'
            )
            if employee.role:
                role_ids.add(employee.role.id)
        except Employee.DoesNotExist:
            pass
        
        # User roles
        user_roles = UserRole.objects.filter(
            user=user,
            organization=organization,
            is_active=True
        ).values_list('role_id', flat=True)
        
        role_ids.update(user_roles)
        
        return list(Role.objects.filter(id__in=role_ids))
    
    @staticmethod
    def assign_role_to_user(
        user: User,
        role: Role,
        organization: Organization,
        assigned_by: Optional[User] = None
    ) -> UserRole:
        """
        Assign a role to a user in an organization.
        
        Args:
            user: User to assign role to
            role: Role to assign
            organization: Organization context
            assigned_by: User who is assigning the role (optional)
            
        Returns:
            UserRole instance
        """
        user_role, created = UserRole.objects.get_or_create(
            user=user,
            role=role,
            organization=organization,
            defaults={
                'is_active': True,
                'assigned_by': assigned_by
            }
        )
        
        if not created and not user_role.is_active:
            user_role.is_active = True
            user_role.assigned_by = assigned_by
            user_role.save(update_fields=['is_active', 'assigned_by'])
        
        return user_role
    
    @staticmethod
    def remove_role_from_user(
        user: User,
        role: Role,
        organization: Organization
    ) -> bool:
        """
        Remove a role from a user in an organization.
        
        Args:
            user: User to remove role from
            role: Role to remove
            organization: Organization context
            
        Returns:
            bool: True if role was removed, False otherwise
        """
        deleted_count, _ = UserRole.objects.filter(
            user=user,
            role=role,
            organization=organization
        ).delete()
        
        return deleted_count > 0
    
    @staticmethod
    def create_role_with_permissions(
        organization: Organization,
        name: str,
        permission_ids: List[int],
        description: Optional[str] = None,
        slug: Optional[str] = None
    ) -> Role:
        """
        Create a role and assign permissions to it.
        
        Args:
            organization: Organization instance
            name: Role name
            permission_ids: List of permission IDs to assign
            description: Role description (optional)
            slug: Role slug (optional, auto-generated if not provided)
            
        Returns:
            Role instance with permissions assigned
        """
        from django.utils.text import slugify
        from crmApp.models import RolePermission
        
        # Generate slug if not provided
        if not slug:
            slug = slugify(name)
        
        # Create role
        role = Role.objects.create(
            organization=organization,
            name=name,
            slug=slug,
            description=description,
            is_system_role=False,
            is_active=True
        )
        
        # Assign permissions
        if permission_ids:
            permissions = Permission.objects.filter(
                id__in=permission_ids,
                organization=organization
            )
            
            for permission in permissions:
                RolePermission.objects.create(
                    role=role,
                    permission=permission
                )
        
        return role
    
    @staticmethod
    def get_available_resources(organization: Organization) -> List[str]:
        """
        Get all unique resources that have permissions in an organization.
        
        Args:
            organization: Organization instance
            
        Returns:
            List of unique resource names
        """
        resources = Permission.objects.filter(
            organization=organization
        ).values_list('resource', flat=True).distinct().order_by('resource')
        
        return list(resources)
    
    @staticmethod
    def get_available_actions(
        organization: Organization,
        resource: Optional[str] = None
    ) -> List[str]:
        """
        Get all unique actions available in an organization.
        Optionally filter by resource.
        
        Args:
            organization: Organization instance
            resource: Resource name to filter by (optional)
            
        Returns:
            List of unique action names
        """
        query = Permission.objects.filter(organization=organization)
        
        if resource:
            query = query.filter(resource=resource)
        
        actions = query.values_list('action', flat=True).distinct().order_by('action')
        
        return list(actions)

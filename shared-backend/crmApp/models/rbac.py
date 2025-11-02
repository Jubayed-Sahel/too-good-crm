"""
Role-Based Access Control (RBAC) models.
"""
from django.db import models
from .base import TimestampedModel


class Role(TimestampedModel):
    """
    Role definition model for RBAC.
    Roles are scoped to organizations.
    """
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='roles')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(null=True, blank=True)
    is_system_role = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'roles'
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        unique_together = [('organization', 'slug')]
        indexes = [
            models.Index(fields=['organization', 'slug']),
        ]
    
    def __str__(self):
        return f"{self.organization.name} - {self.name}"


class Permission(TimestampedModel):
    """
    Permission model for RBAC.
    Defines what actions can be performed on what resources.
    """
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='permissions')
    resource = models.CharField(max_length=100)  # e.g., 'customer', 'deal', 'lead'
    action = models.CharField(max_length=50)      # e.g., 'create', 'read', 'update', 'delete'
    description = models.TextField(null=True, blank=True)
    is_system_permission = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'permissions'
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
        unique_together = [('organization', 'resource', 'action')]
        indexes = [
            models.Index(fields=['organization', 'resource', 'action']),
        ]
    
    def __str__(self):
        return f"{self.resource}:{self.action} ({self.organization.name})"


class RolePermission(TimestampedModel):
    """
    Junction table linking roles to permissions.
    Defines which permissions are granted to each role.
    """
    role = models.ForeignKey('Role', on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey('Permission', on_delete=models.CASCADE, related_name='role_permissions')
    
    class Meta:
        db_table = 'role_permissions'
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'
        unique_together = [('role', 'permission')]
        indexes = [
            models.Index(fields=['role', 'permission']),
        ]
    
    def __str__(self):
        return f"{self.role.name} - {self.permission}"


class UserRole(TimestampedModel):
    """
    Junction table linking users to roles within an organization.
    Users can have multiple roles per organization.
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey('Role', on_delete=models.CASCADE, related_name='user_roles')
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='user_roles')
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_roles')
    
    class Meta:
        db_table = 'user_roles'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        unique_together = [('user', 'role', 'organization')]
        indexes = [
            models.Index(fields=['user', 'organization']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.role.name} ({self.organization.name})"

/**
 * RBAC (Role-Based Access Control) Service
 * Connects to Django backend RBAC endpoints
 */

import api from '@/lib/apiClient';
import type {
  Role,
  Permission,
  UserRole,
  CreateRoleRequest,
  CreatePermissionRequest,
  AssignRoleRequest,
  BulkAssignRoleRequest,
  UpdatePermissionsRequest,
  ToggleActiveRequest,
  AssignPermissionRequest,
  RemovePermissionRequest,
  RoleWithUsers,
  UserRolesResponse,
  AvailableResource,
  AvailableAction,
  BulkAssignResponse,
  BulkRemoveResponse,
  AssignPermissionResponse,
  RemovePermissionResponse,
  UpdatePermissionsResponse,
  UserPermissions,
} from '@/types';

class RBACService {
  // ============ Permission Endpoints ============

  /**
   * Get all permissions for the organization
   */
  async getPermissions(filters?: { resource?: string; action?: string }): Promise<Permission[]> {
    return api.get<Permission[]>('/permissions/', {
      params: filters,
    });
  }

  /**
   * Get single permission by ID
   */
  async getPermission(id: number): Promise<Permission> {
    return api.get<Permission>(`/permissions/${id}/`);
  }

  /**
   * Create new permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return api.post<Permission>('/permissions/', data);
  }

  /**
   * Update permission
   */
  async updatePermission(id: number, data: Partial<CreatePermissionRequest>): Promise<Permission> {
    return api.patch<Permission>(`/permissions/${id}/`, data);
  }

  /**
   * Delete permission
   */
  async deletePermission(id: number): Promise<void> {
    await api.delete(`/permissions/${id}/`);
  }

  /**
   * Get available resources in the system
   */
  async getAvailableResources(): Promise<AvailableResource[]> {
    return api.get<AvailableResource[]>(
      '/permissions/available_resources/'
    );
  }

  /**
   * Get available actions (optionally filtered by resource)
   */
  async getAvailableActions(resource?: string): Promise<AvailableAction[]> {
    return api.get<AvailableAction[]>(
      '/permissions/available_actions/',
      { params: resource ? { resource } : undefined }
    );
  }

  // ============ Role Endpoints ============

  /**
   * Get all roles for the organization
   */
  async getRoles(): Promise<Role[]> {
    return api.get<Role[]>('/roles/');
  }

  /**
   * Get single role by ID (with permissions)
   */
  async getRole(id: number): Promise<Role> {
    return api.get<Role>(`/roles/${id}/`);
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    return api.post<Role>('/roles/', data);
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: Partial<CreateRoleRequest>): Promise<Role> {
    return api.patch<Role>(`/roles/${id}/`, data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}/`);
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return api.get<Permission[]>(`/roles/${roleId}/permissions/`);
  }

  /**
   * Get all users assigned to a role
   */
  async getRoleUsers(roleId: number): Promise<RoleWithUsers> {
    const users = await api.get<{ users: RoleWithUsers['users'] }>(
      `/roles/${roleId}/users/`
    );
    const role = await this.getRole(roleId);
    return { ...role, users: users.users };
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(
    roleId: number,
    data: AssignPermissionRequest
  ): Promise<AssignPermissionResponse> {
    return api.post<AssignPermissionResponse>(
      `/roles/${roleId}/assign_permission/`,
      data
    );
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(
    roleId: number,
    data: RemovePermissionRequest
  ): Promise<RemovePermissionResponse> {
    return api.post<RemovePermissionResponse>(
      `/roles/${roleId}/remove_permission/`,
      data
    );
  }

  /**
   * Update all permissions for a role at once
   */
  async updateRolePermissions(
    roleId: number,
    data: UpdatePermissionsRequest
  ): Promise<UpdatePermissionsResponse> {
    return api.post<UpdatePermissionsResponse>(
      `/roles/${roleId}/update_permissions/`,
      data
    );
  }

  // ============ UserRole Endpoints ============

  /**
   * Get all user role assignments
   */
  async getUserRoles(filters?: { user_id?: number; role_id?: number }): Promise<UserRole[]> {
    return api.get<UserRole[]>('/user-roles/', {
      params: filters,
    });
  }

  /**
   * Get single user role by ID
   */
  async getUserRole(id: number): Promise<UserRole> {
    return api.get<UserRole>(`/user-roles/${id}/`);
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(data: AssignRoleRequest): Promise<UserRole> {
    return api.post<UserRole>('/user-roles/', data);
  }

  /**
   * Remove user role assignment
   */
  async removeRoleFromUser(userRoleId: number): Promise<void> {
    await api.delete(`/user-roles/${userRoleId}/`);
  }

  /**
   * Bulk assign role to multiple users
   */
  async bulkAssignRole(data: BulkAssignRoleRequest): Promise<BulkAssignResponse> {
    return api.post<BulkAssignResponse>(
      '/user-roles/bulk_assign/',
      data
    );
  }

  /**
   * Bulk remove role from multiple users
   */
  async bulkRemoveRole(data: BulkAssignRoleRequest): Promise<BulkRemoveResponse> {
    return api.post<BulkRemoveResponse>(
      '/user-roles/bulk_remove/',
      data
    );
  }

  /**
   * Get all users assigned to a specific role
   */
  async getUsersByRole(roleId: number): Promise<UserRole[]> {
    return api.get<UserRole[]>('/user-roles/by_role/', {
      params: { role_id: roleId },
    });
  }

  /**
   * Get all roles assigned to a specific user
   */
  async getRolesByUser(userId: number): Promise<UserRolesResponse> {
    return api.get<UserRolesResponse>('/user-roles/by_user/', {
      params: { user_id: userId },
    });
  }

  /**
   * Toggle user role active status
   */
  async toggleUserRoleActive(data: ToggleActiveRequest): Promise<{ message: string; is_active: boolean }> {
    return api.post<{ message: string; is_active: boolean }>(
      '/user-roles/toggle_active/',
      data
    );
  }

  // ============ Permission Checking (Client-side helpers) ============

  /**
   * Check if current user has a specific permission
   * Note: This checks cached permissions. For real-time checks, use backend validation.
   */
  hasPermission(userPermissions: UserPermissions, resource: string, action: string): boolean {
    return userPermissions.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  }

  /**
   * Check if current user has any of the specified permissions
   */
  hasAnyPermission(
    userPermissions: UserPermissions,
    checks: Array<{ resource: string; action: string }>
  ): boolean {
    return checks.some((check) => this.hasPermission(userPermissions, check.resource, check.action));
  }

  /**
   * Check if current user has all of the specified permissions
   */
  hasAllPermissions(
    userPermissions: UserPermissions,
    checks: Array<{ resource: string; action: string }>
  ): boolean {
    return checks.every((check) => this.hasPermission(userPermissions, check.resource, check.action));
  }

  /**
   * Get all unique resources from permissions
   */
  getResourcesFromPermissions(permissions: Permission[]): string[] {
    const resources = new Set(permissions.map((p) => p.resource));
    return Array.from(resources).sort();
  }

  /**
   * Get all unique actions from permissions
   */
  getActionsFromPermissions(permissions: Permission[]): string[] {
    const actions = new Set(permissions.map((p) => p.action));
    return Array.from(actions).sort();
  }

  /**
   * Group permissions by resource
   */
  groupPermissionsByResource(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }

  // ============ Hook Compatibility Methods ============

  /**
   * Get user permissions (for useRBAC hook)
   */
  async getUserPermissions(userId: number, _organizationId?: number): Promise<UserPermissions> {
    // Get user's roles
    const userRoles = await this.getUserRoles({ user_id: userId });
    const roles = userRoles.map(ur => typeof ur.role === 'object' ? ur.role : { id: ur.role } as Role);
    
    // Get all permissions from those roles
    const permissions: Permission[] = [];
    for (const ur of userRoles) {
      const roleId = typeof ur.role === 'object' ? ur.role.id : ur.role;
      const rolePerms = await this.getRolePermissions(roleId);
      permissions.push(...rolePerms);
    }
    
    // Remove duplicates
    const uniquePermissions = permissions.filter((perm, index, self) =>
      index === self.findIndex((p) => p.id === perm.id)
    );
    
    return {
      permissions: uniquePermissions,
      roles: roles,
    };
  }

  /**
   * Check if user has permission (for useRBAC hook)
   */
  async checkPermission(
    userId: number,
    organizationId: number,
    check: { resource: string; action: string }
  ): Promise<boolean> {
    const userPerms = await this.getUserPermissions(userId, organizationId);
    return this.hasPermission(userPerms, check.resource, check.action);
  }

  /**
   * Assign role to user (for useRBAC hook)
   */
  async assignRole(_organizationId: number, data: AssignRoleRequest): Promise<UserRole> {
    return this.assignRoleToUser(data);
  }

  /**
   * Remove role from user (for useRBAC hook)
   */
  async removeRole(userRoleId: number): Promise<void> {
    return this.removeRoleFromUser(userRoleId);
  }
}

export const rbacService = new RBACService();


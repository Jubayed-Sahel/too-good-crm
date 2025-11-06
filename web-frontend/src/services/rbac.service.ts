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
  private readonly baseUrl = '/api';

  // ============ Permission Endpoints ============

  /**
   * Get all permissions for the organization
   */
  async getPermissions(filters?: { resource?: string; action?: string }): Promise<Permission[]> {
    return api.get<Permission[]>(`${this.baseUrl}/permissions/`, {
      params: filters,
    });
  }

  /**
   * Get single permission by ID
   */
  async getPermission(id: number): Promise<Permission> {
    return api.get<Permission>(`${this.baseUrl}/permissions/${id}/`);
  }

  /**
   * Create new permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return api.post<Permission>(`${this.baseUrl}/permissions/`, data);
  }

  /**
   * Update permission
   */
  async updatePermission(id: number, data: Partial<CreatePermissionRequest>): Promise<Permission> {
    return api.patch<Permission>(`${this.baseUrl}/permissions/${id}/`, data);
  }

  /**
   * Delete permission
   */
  async deletePermission(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/permissions/${id}/`);
  }

  /**
   * Get available resources in the system
   */
  async getAvailableResources(): Promise<AvailableResource[]> {
    return api.get<AvailableResource[]>(
      `${this.baseUrl}/permissions/available_resources/`
    );
  }

  /**
   * Get available actions (optionally filtered by resource)
   */
  async getAvailableActions(resource?: string): Promise<AvailableAction[]> {
    return api.get<AvailableAction[]>(
      `${this.baseUrl}/permissions/available_actions/`,
      { params: resource ? { resource } : undefined }
    );
  }

  // ============ Role Endpoints ============

  /**
   * Get all roles for the organization
   */
  async getRoles(): Promise<Role[]> {
    return api.get<Role[]>(`${this.baseUrl}/roles/`);
  }

  /**
   * Get single role by ID (with permissions)
   */
  async getRole(id: number): Promise<Role> {
    return api.get<Role>(`${this.baseUrl}/roles/${id}/`);
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    return api.post<Role>(`${this.baseUrl}/roles/`, data);
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: Partial<CreateRoleRequest>): Promise<Role> {
    return api.patch<Role>(`${this.baseUrl}/roles/${id}/`, data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/roles/${id}/`);
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return api.get<Permission[]>(`${this.baseUrl}/roles/${roleId}/permissions/`);
  }

  /**
   * Get all users assigned to a role
   */
  async getRoleUsers(roleId: number): Promise<RoleWithUsers> {
    const users = await api.get<{ users: RoleWithUsers['users'] }>(
      `${this.baseUrl}/roles/${roleId}/users/`
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
      `${this.baseUrl}/roles/${roleId}/assign_permission/`,
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
      `${this.baseUrl}/roles/${roleId}/remove_permission/`,
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
      `${this.baseUrl}/roles/${roleId}/update_permissions/`,
      data
    );
  }

  // ============ UserRole Endpoints ============

  /**
   * Get all user role assignments
   */
  async getUserRoles(filters?: { user_id?: number; role_id?: number }): Promise<UserRole[]> {
    return api.get<UserRole[]>(`${this.baseUrl}/user-roles/`, {
      params: filters,
    });
  }

  /**
   * Get single user role by ID
   */
  async getUserRole(id: number): Promise<UserRole> {
    return api.get<UserRole>(`${this.baseUrl}/user-roles/${id}/`);
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(data: AssignRoleRequest): Promise<UserRole> {
    return api.post<UserRole>(`${this.baseUrl}/user-roles/`, data);
  }

  /**
   * Remove user role assignment
   */
  async removeRoleFromUser(userRoleId: number): Promise<void> {
    await api.delete(`${this.baseUrl}/user-roles/${userRoleId}/`);
  }

  /**
   * Bulk assign role to multiple users
   */
  async bulkAssignRole(data: BulkAssignRoleRequest): Promise<BulkAssignResponse> {
    return api.post<BulkAssignResponse>(
      `${this.baseUrl}/user-roles/bulk_assign/`,
      data
    );
  }

  /**
   * Bulk remove role from multiple users
   */
  async bulkRemoveRole(data: BulkAssignRoleRequest): Promise<BulkRemoveResponse> {
    return api.post<BulkRemoveResponse>(
      `${this.baseUrl}/user-roles/bulk_remove/`,
      data
    );
  }

  /**
   * Get all users assigned to a specific role
   */
  async getUsersByRole(roleId: number): Promise<UserRole[]> {
    return api.get<UserRole[]>(`${this.baseUrl}/user-roles/by_role/`, {
      params: { role_id: roleId },
    });
  }

  /**
   * Get all roles assigned to a specific user
   */
  async getRolesByUser(userId: number): Promise<UserRolesResponse> {
    return api.get<UserRolesResponse>(`${this.baseUrl}/user-roles/by_user/`, {
      params: { user_id: userId },
    });
  }

  /**
   * Toggle user role active status
   */
  async toggleUserRoleActive(data: ToggleActiveRequest): Promise<{ message: string; is_active: boolean }> {
    return api.post<{ message: string; is_active: boolean }>(
      `${this.baseUrl}/user-roles/toggle_active/`,
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
}

export const rbacService = new RBACService();


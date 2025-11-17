/**
 * RBAC (Role-Based Access Control) Service
 * Connects to Django backend RBAC endpoints
 */

import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { employeeService } from './employee.service';
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
    return api.get<Permission[]>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST, {
      params: filters,
    });
  }

  /**
   * Get single permission by ID
   */
  async getPermission(id: number): Promise<Permission> {
    return api.get<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.DETAIL(id));
  }

  /**
   * Create new permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return api.post<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST, data);
  }

  /**
   * Update permission
   */
  async updatePermission(id: number, data: Partial<CreatePermissionRequest>): Promise<Permission> {
    return api.patch<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.DETAIL(id), data);
  }

  /**
   * Delete permission
   */
  async deletePermission(id: number): Promise<void> {
    await api.delete(API_CONFIG.ENDPOINTS.PERMISSIONS.DETAIL(id));
  }

  /**
   * Get available resources in the system
   */
  async getAvailableResources(): Promise<AvailableResource[]> {
    return api.get<AvailableResource[]>(
      API_CONFIG.ENDPOINTS.PERMISSIONS.AVAILABLE_RESOURCES
    );
  }

  /**
   * Get available actions (optionally filtered by resource)
   */
  async getAvailableActions(resource?: string): Promise<AvailableAction[]> {
    return api.get<AvailableAction[]>(
      API_CONFIG.ENDPOINTS.PERMISSIONS.AVAILABLE_ACTIONS,
      { params: resource ? { resource } : undefined }
    );
  }

  // ============ Role Endpoints ============

  /**
   * Get all roles for the organization
   */
  async getRoles(): Promise<Role[]> {
    return api.get<Role[]>(API_CONFIG.ENDPOINTS.ROLES.LIST);
  }

  /**
   * Get single role by ID (with permissions)
   */
  async getRole(id: number): Promise<Role> {
    return api.get<Role>(API_CONFIG.ENDPOINTS.ROLES.DETAIL(id));
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    return api.post<Role>(API_CONFIG.ENDPOINTS.ROLES.LIST, data);
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: Partial<CreateRoleRequest>): Promise<Role> {
    return api.patch<Role>(API_CONFIG.ENDPOINTS.ROLES.DETAIL(id), data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    await api.delete(API_CONFIG.ENDPOINTS.ROLES.DETAIL(id));
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return api.get<Permission[]>(API_CONFIG.ENDPOINTS.ROLES.PERMISSIONS(roleId));
  }

  /**
   * Get all users assigned to a role
   */
  async getRoleUsers(roleId: number): Promise<RoleWithUsers> {
    const users = await api.get<{ users: RoleWithUsers['users'] }>(
      API_CONFIG.ENDPOINTS.ROLES.USERS(roleId)
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
      API_CONFIG.ENDPOINTS.ROLES.ASSIGN_PERMISSION(roleId),
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
      API_CONFIG.ENDPOINTS.ROLES.REMOVE_PERMISSION(roleId),
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
      API_CONFIG.ENDPOINTS.ROLES.UPDATE_PERMISSIONS(roleId),
      data
    );
  }

  // ============ UserRole Endpoints ============

  /**
   * Get all user role assignments
   */
  async getUserRoles(filters?: { user_id?: number; role_id?: number }): Promise<UserRole[]> {
    const response = await api.get<{ results: UserRole[] } | UserRole[]>(API_CONFIG.ENDPOINTS.USER_ROLES.LIST, {
      params: filters,
    });
    
    // Handle paginated response from Django REST Framework
    if (response && typeof response === 'object' && 'results' in response) {
      return response.results;
    }
    
    // Handle direct array response
    return response as UserRole[];
  }

  /**
   * Get single user role by ID
   */
  async getUserRole(id: number): Promise<UserRole> {
    return api.get<UserRole>(API_CONFIG.ENDPOINTS.USER_ROLES.DETAIL(id));
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(data: AssignRoleRequest): Promise<UserRole> {
    return api.post<UserRole>(API_CONFIG.ENDPOINTS.USER_ROLES.LIST, data);
  }

  /**
   * Remove user role assignment
   */
  async removeRoleFromUser(userRoleId: number): Promise<void> {
    await api.delete(API_CONFIG.ENDPOINTS.USER_ROLES.DETAIL(userRoleId));
  }

  /**
   * Bulk assign role to multiple users
   */
  async bulkAssignRole(data: BulkAssignRoleRequest): Promise<BulkAssignResponse> {
    return api.post<BulkAssignResponse>(
      API_CONFIG.ENDPOINTS.USER_ROLES.BULK_ASSIGN,
      data
    );
  }

  /**
   * Bulk remove role from multiple users
   */
  async bulkRemoveRole(data: BulkAssignRoleRequest): Promise<BulkRemoveResponse> {
    return api.post<BulkRemoveResponse>(
      API_CONFIG.ENDPOINTS.USER_ROLES.BULK_REMOVE,
      data
    );
  }

  /**
   * Get all users assigned to a specific role
   */
  async getUsersByRole(roleId: number): Promise<UserRole[]> {
    return api.get<UserRole[]>(API_CONFIG.ENDPOINTS.USER_ROLES.BY_ROLE, {
      params: { role_id: roleId },
    });
  }

  /**
   * Get all roles assigned to a specific user
   */
  async getRolesByUser(userId: number): Promise<UserRolesResponse> {
    return api.get<UserRolesResponse>(API_CONFIG.ENDPOINTS.USER_ROLES.BY_USER, {
      params: { user_id: userId },
    });
  }

  /**
   * Toggle user role active status
   */
  async toggleUserRoleActive(data: ToggleActiveRequest): Promise<{ message: string; is_active: boolean }> {
    return api.post<{ message: string; is_active: boolean }>(
      API_CONFIG.ENDPOINTS.USER_ROLES.TOGGLE_ACTIVE,
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
   * Uses backend API endpoint for proper permission calculation
   */
  async getUserPermissions(userId: number, organizationId?: number): Promise<UserPermissions> {
    console.log('[rbacService] getUserPermissions called:', { userId, organizationId });
    
    if (!organizationId) {
      console.warn('[rbacService] No organizationId provided, returning empty permissions');
      return {
        permissions: [],
        roles: [],
      };
    }
    
    try {
      // Use backend API endpoint that uses RBACService.get_user_permissions
      const response = await api.get<UserPermissions>(
        API_CONFIG.ENDPOINTS.USER_ROLES.USER_PERMISSIONS,
        {
          params: {
            user_id: userId,
            organization_id: organizationId,
          },
        }
      );
      
      console.log('[rbacService] Received permissions from backend:', {
        permissionCount: response.permissions.length,
        roleCount: response.roles.length,
        permissions: response.permissions.map((p: Permission) => `${p.resource}:${p.action}`),
      });
      
      return response;
    } catch (error: any) {
      console.error('[rbacService] Error fetching user permissions from backend:', error);
      // Return empty permissions on error
      return {
        permissions: [],
        roles: [],
      };
    }
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


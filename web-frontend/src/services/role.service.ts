/**
 * Role Service
 * Handles role and RBAC-related API calls
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';

export interface Role {
  id: number;
  organization: number;
  name: string;
  slug: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  organization: number;
  resource: string;
  action: string;
  description?: string;
  is_system_permission: boolean;
}

export interface RolePermission {
  id: number;
  role: number;
  permission: Permission;
}

export interface UserRole {
  id: number;
  user: number;
  role: Role;
  organization: number;
  is_active: boolean;
  assigned_at: string;
  assigned_by?: number;
}

export interface RoleFilters {
  organization?: number;
  is_active?: boolean;
  search?: string;
}

class RoleService {
  /**
   * Get all roles
   */
  async getRoles(filters?: RoleFilters): Promise<Role[]> {
    const response = await api.get<any>(API_CONFIG.ENDPOINTS.ROLES.LIST, { params: filters });
    // Handle both paginated and non-paginated responses
    if (response.results) {
      return response.results;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Get role by ID
   */
  async getRole(id: number): Promise<Role> {
    return api.get<Role>(API_CONFIG.ENDPOINTS.ROLES.DETAIL(id));
  }

  /**
   * Create role
   */
  async createRole(data: Partial<Role>): Promise<Role> {
    return api.post<Role>(API_CONFIG.ENDPOINTS.ROLES.LIST, data);
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    return api.patch<Role>(API_CONFIG.ENDPOINTS.ROLES.DETAIL(id), data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    return api.delete(API_CONFIG.ENDPOINTS.ROLES.DETAIL(id));
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return api.get<Permission[]>(API_CONFIG.ENDPOINTS.ROLES.PERMISSIONS(roleId));
  }

  /**
   * Get users assigned to a role
   */
  async getRoleUsers(roleId: number): Promise<any[]> {
    const response = await api.get<{ users: any[] }>(API_CONFIG.ENDPOINTS.ROLES.USERS(roleId));
    return response.users;
  }

  /**
   * Assign permission to role
   */
  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    return api.post(API_CONFIG.ENDPOINTS.ROLES.ASSIGN_PERMISSION(roleId), {
      permission_id: permissionId,
    });
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    return api.post(API_CONFIG.ENDPOINTS.ROLES.REMOVE_PERMISSION(roleId), {
      permission_id: permissionId,
    });
  }

  /**
   * Update all permissions for a role
   */
  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    return api.post(API_CONFIG.ENDPOINTS.ROLES.UPDATE_PERMISSIONS(roleId), {
      permission_ids: permissionIds,
    });
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get<any>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST);
    if (response.results) {
      return response.results;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Assign role to employee
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<UserRole> {
    return api.post<UserRole>(API_CONFIG.ENDPOINTS.USER_ROLES.LIST, {
      user: userId,
      role: roleId,
    });
  }

  /**
   * Remove role from employee
   */
  async removeRoleFromUser(userRoleId: number): Promise<void> {
    return api.delete(API_CONFIG.ENDPOINTS.USER_ROLES.DETAIL(userRoleId));
  }

  /**
   * Get roles for a user
   */
  async getUserRoles(userId: number): Promise<{ user_roles: UserRole[]; primary_role: any }> {
    return api.get<{ user_roles: UserRole[]; primary_role: any }>(
      API_CONFIG.ENDPOINTS.USER_ROLES.BY_USER,
      { params: { user_id: userId } }
    );
  }

  /**
   * Bulk assign role to multiple users
   */
  async bulkAssignRole(roleId: number, userIds: number[]): Promise<void> {
    return api.post(API_CONFIG.ENDPOINTS.USER_ROLES.BULK_ASSIGN, {
      role_id: roleId,
      user_ids: userIds,
    });
  }

  /**
   * Bulk remove role from multiple users
   */
  async bulkRemoveRole(roleId: number, userIds: number[]): Promise<void> {
    return api.post(API_CONFIG.ENDPOINTS.USER_ROLES.BULK_REMOVE, {
      role_id: roleId,
      user_ids: userIds,
    });
  }

  /**
   * Get current user's roles
   */
  async getMyRoles(): Promise<UserRole[]> {
    const response = await api.get<any>(API_CONFIG.ENDPOINTS.USER_ROLES.MY_ROLES);
    if (response.results) {
      return response.results;
    }
    return Array.isArray(response) ? response : [];
  }
}

export const roleService = new RoleService();

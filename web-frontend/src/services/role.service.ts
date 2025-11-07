/**
 * Role Service
 * Handles role and RBAC-related API calls
 */
import api from '@/lib/apiClient';

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
  private readonly baseUrl = '/roles';
  private readonly permissionsUrl = '/permissions';
  private readonly userRolesUrl = '/user-roles';

  /**
   * Get all roles
   */
  async getRoles(filters?: RoleFilters): Promise<Role[]> {
    const response = await api.get<any>(this.baseUrl, { params: filters });
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
    return api.get<Role>(`${this.baseUrl}/${id}/`);
  }

  /**
   * Create role
   */
  async createRole(data: Partial<Role>): Promise<Role> {
    return api.post<Role>(this.baseUrl, data);
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    return api.patch<Role>(`${this.baseUrl}/${id}/`, data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    return api.delete(`${this.baseUrl}/${id}/`);
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return api.get<Permission[]>(`${this.baseUrl}/${roleId}/permissions/`);
  }

  /**
   * Get users assigned to a role
   */
  async getRoleUsers(roleId: number): Promise<any[]> {
    const response = await api.get<{ users: any[] }>(`${this.baseUrl}/${roleId}/users/`);
    return response.users;
  }

  /**
   * Assign permission to role
   */
  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    return api.post(`${this.baseUrl}/${roleId}/assign_permission/`, {
      permission_id: permissionId,
    });
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    return api.post(`${this.baseUrl}/${roleId}/remove_permission/`, {
      permission_id: permissionId,
    });
  }

  /**
   * Update all permissions for a role
   */
  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    return api.post(`${this.baseUrl}/${roleId}/update_permissions/`, {
      permission_ids: permissionIds,
    });
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    return api.get<Permission[]>(this.permissionsUrl);
  }

  /**
   * Assign role to employee
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<UserRole> {
    return api.post<UserRole>(this.userRolesUrl, {
      user: userId,
      role: roleId,
    });
  }

  /**
   * Remove role from employee
   */
  async removeRoleFromUser(userRoleId: number): Promise<void> {
    return api.delete(`${this.userRolesUrl}/${userRoleId}/`);
  }

  /**
   * Get roles for a user
   */
  async getUserRoles(userId: number): Promise<{ user_roles: UserRole[]; primary_role: any }> {
    return api.get<{ user_roles: UserRole[]; primary_role: any }>(
      `${this.userRolesUrl}/by_user/`,
      { params: { user_id: userId } }
    );
  }

  /**
   * Bulk assign role to multiple users
   */
  async bulkAssignRole(roleId: number, userIds: number[]): Promise<void> {
    return api.post(`${this.userRolesUrl}/bulk_assign/`, {
      role_id: roleId,
      user_ids: userIds,
    });
  }

  /**
   * Bulk remove role from multiple users
   */
  async bulkRemoveRole(roleId: number, userIds: number[]): Promise<void> {
    return api.post(`${this.userRolesUrl}/bulk_remove/`, {
      role_id: roleId,
      user_ids: userIds,
    });
  }
}

export const roleService = new RoleService();

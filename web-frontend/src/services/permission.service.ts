/**
 * Permission Service
 * Handles permission-related API calls for RBAC
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';

export interface Permission {
  id: number;
  organization: number;
  resource: string;
  action: string;
  description?: string;
  is_system_permission: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionsByResource {
  [resource: string]: Permission[];
}

export interface AvailableResourcesResponse {
  resources: string[];
}

export interface AvailableActionsResponse {
  actions: string[];
}

export interface PermissionFilters {
  resource?: string;
  action?: string;
  is_system_permission?: boolean;
}

class PermissionService {
  /**
   * Get all permissions
   */
  async getPermissions(filters?: PermissionFilters): Promise<Permission[]> {
    const response = await api.get<any>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST, { 
      params: filters 
    });
    // Handle both paginated and non-paginated responses
    if (response.results) {
      return response.results;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Get permission by ID
   */
  async getPermission(id: number): Promise<Permission> {
    return api.get<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.DETAIL(id));
  }

  /**
   * Create a new permission
   */
  async createPermission(data: Partial<Permission>): Promise<Permission> {
    return api.post<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST, data);
  }

  /**
   * Update an existing permission
   */
  async updatePermission(id: number, data: Partial<Permission>): Promise<Permission> {
    return api.patch<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.DETAIL(id), data);
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: number): Promise<void> {
    return api.delete(API_CONFIG.ENDPOINTS.PERMISSIONS.DETAIL(id));
  }

  /**
   * Get permissions grouped by resource
   */
  async getPermissionsByResource(): Promise<PermissionsByResource> {
    return api.get<PermissionsByResource>(API_CONFIG.ENDPOINTS.PERMISSIONS.BY_RESOURCE);
  }

  /**
   * Get list of available resources (resource names)
   */
  async getAvailableResources(): Promise<string[]> {
    const response = await api.get<AvailableResourcesResponse>(
      API_CONFIG.ENDPOINTS.PERMISSIONS.AVAILABLE_RESOURCES
    );
    return response.resources || [];
  }

  /**
   * Get list of available actions
   * @param resource - Optional resource name to filter actions
   */
  async getAvailableActions(resource?: string): Promise<string[]> {
    const params = resource ? { resource } : undefined;
    const response = await api.get<AvailableActionsResponse>(
      API_CONFIG.ENDPOINTS.PERMISSIONS.AVAILABLE_ACTIONS,
      { params }
    );
    return response.actions || [];
  }
}

export const permissionService = new PermissionService();

/**
 * RBAC (Role-Based Access Control) Types
 */

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  organizationId: string;
  isSystem: boolean;
  permissions: Permission[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  organizationId: string;
  role: Role;
  assignedAt: string;
  assignedBy?: string;
}

export interface CreateRoleData {
  name: string;
  displayName: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleData {
  displayName?: string;
  description?: string;
  permissionIds?: string[];
}

export interface AssignRoleData {
  userId: string;
  roleId: string;
}

// Permission resources
export type PermissionResource =
  | 'leads'
  | 'customers'
  | 'deals'
  | 'products'
  | 'orders'
  | 'vendors'
  | 'employees'
  | 'activities'
  | 'samples'
  | 'reports'
  | 'settings'
  | 'roles'
  | 'users'
  | 'organization';

// Permission actions
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Helper type for checking permissions
export interface PermissionCheck {
  resource: PermissionResource;
  action: PermissionAction;
}

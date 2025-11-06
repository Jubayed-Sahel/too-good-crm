/**
 * RBAC (Role-Based Access Control) Types
 * Updated to match Django backend structure
 */

export interface Permission {
  id: number;
  resource: string;
  action: string;
  description?: string;
  organization: number;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  organization: number;
  created_at: string;
  permissions?: Permission[];
  user_count?: number;
}

export interface UserRole {
  id: number;
  user: number;
  role: Role | number;
  organization: number;
  assigned_by: number;
  assigned_at: string;
  is_active: boolean;
}

export interface RolePermission {
  id: number;
  role: number;
  permission: Permission;
}

// Request types
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permission_ids?: number[];
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface AssignRoleRequest {
  user_id: number;
  role_id: number;
}

export interface BulkAssignRoleRequest {
  role_id: number;
  user_ids: number[];
}

export interface UpdatePermissionsRequest {
  permission_ids: number[];
}

export interface ToggleActiveRequest {
  user_role_id: number;
  is_active: boolean;
}

export interface AssignPermissionRequest {
  permission_id: number;
}

export interface RemovePermissionRequest {
  permission_id: number;
}

// Response types
export interface RoleWithUsers extends Role {
  users?: UserInfo[];
}

export interface UserInfo {
  id: number;
  email: string;
  full_name: string;
  source: 'user_role' | 'employee_role';
  assigned_at?: string;
  employee_code?: string;
}

export interface UserRolesResponse {
  user_roles: UserRole[];
  primary_role: {
    id: number;
    name: string;
    slug: string;
    is_primary: true;
  } | null;
}

export interface AvailableResource {
  value: string;
  label: string;
  count?: number;
}

export interface AvailableAction {
  value: string;
  label: string;
  count?: number;
}

export interface BulkAssignResponse {
  message: string;
  created: number;
  skipped: number;
}

export interface BulkRemoveResponse {
  message: string;
  removed: number;
}

export interface AssignPermissionResponse {
  message: string;
  created: boolean;
}

export interface RemovePermissionResponse {
  message: string;
  removed: boolean;
}

export interface UpdatePermissionsResponse {
  message: string;
  permission_count: number;
}

// Permission check types
export interface PermissionCheck {
  resource: string;
  action: string;
  hasPermission: boolean;
}

export interface UserPermissions {
  permissions: Permission[];
  roles: Role[];
}

// Filter types
export interface RoleFilters {
  search?: string;
  organization?: number;
}

export interface PermissionFilters {
  resource?: string;
  action?: string;
  organization?: number;
  search?: string;
}

export interface UserRoleFilters {
  user_id?: number;
  role_id?: number;
  is_active?: boolean;
}

// Permission resources (common resources in the system)
export type PermissionResource =
  | 'customer'
  | 'lead'
  | 'deal'
  | 'product'
  | 'order'
  | 'vendor'
  | 'employee'
  | 'activity'
  | 'sample'
  | 'report'
  | 'analytics'
  | 'pipeline'
  | 'stage'
  | 'role'
  | 'permission'
  | 'user'
  | 'organization'
  | 'settings';

// Permission actions (CRUD + custom)
export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'list'
  | 'manage'
  | 'assign'
  | 'export'
  | 'import';


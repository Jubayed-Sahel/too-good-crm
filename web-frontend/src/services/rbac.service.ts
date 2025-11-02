/**
 * RBAC (Role-Based Access Control) Service with Mock Data
 */

import type {
  Role,
  Permission,
  UserRole,
  CreateRoleData,
  UpdateRoleData,
  AssignRoleData,
  PermissionCheck,
} from '@/types';

// Mock permissions data
const mockPermissions: Permission[] = [
  // Leads permissions
  { id: '1', name: 'leads.create', resource: 'leads', action: 'create', description: 'Create new leads', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'leads.read', resource: 'leads', action: 'read', description: 'View leads', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'leads.update', resource: 'leads', action: 'update', description: 'Update leads', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'leads.delete', resource: 'leads', action: 'delete', description: 'Delete leads', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // Customers permissions
  { id: '5', name: 'customers.create', resource: 'customers', action: 'create', description: 'Create new customers', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '6', name: 'customers.read', resource: 'customers', action: 'read', description: 'View customers', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '7', name: 'customers.update', resource: 'customers', action: 'update', description: 'Update customers', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '8', name: 'customers.delete', resource: 'customers', action: 'delete', description: 'Delete customers', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // Deals permissions
  { id: '9', name: 'deals.create', resource: 'deals', action: 'create', description: 'Create new deals', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '10', name: 'deals.read', resource: 'deals', action: 'read', description: 'View deals', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '11', name: 'deals.update', resource: 'deals', action: 'update', description: 'Update deals', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '12', name: 'deals.delete', resource: 'deals', action: 'delete', description: 'Delete deals', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // Settings permissions
  { id: '13', name: 'settings.manage', resource: 'settings', action: 'manage', description: 'Manage organization settings', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '14', name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles and permissions', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '15', name: 'users.manage', resource: 'users', action: 'manage', description: 'Manage users', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // Reports permissions
  { id: '16', name: 'reports.read', resource: 'reports', action: 'read', description: 'View reports', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

// Mock roles data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    displayName: 'Admin',
    description: 'Full access to all features',
    organizationId: '1',
    isSystem: true,
    permissions: mockPermissions,
    userCount: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'sales_manager',
    displayName: 'Sales Manager',
    description: 'Manage sales team and view reports',
    organizationId: '1',
    isSystem: false,
    permissions: mockPermissions.filter(p => 
      ['leads', 'customers', 'deals', 'reports'].includes(p.resource)
    ),
    userCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'sales_rep',
    displayName: 'Sales Representative',
    description: 'Manage own leads, customers, and deals',
    organizationId: '1',
    isSystem: false,
    permissions: mockPermissions.filter(p => 
      ['leads', 'customers', 'deals'].includes(p.resource) && p.action !== 'delete'
    ),
    userCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access',
    organizationId: '1',
    isSystem: false,
    permissions: mockPermissions.filter(p => p.action === 'read'),
    userCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock user roles
const mockUserRoles: UserRole[] = [
  {
    id: '1',
    userId: '1',
    roleId: '1',
    organizationId: '1',
    role: mockRoles[0],
    assignedAt: '2024-01-15T10:00:00Z',
    assignedBy: '1',
  },
];

// Simulated delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class RBACService {
  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    await delay(300);
    return mockPermissions;
  }

  /**
   * Get all roles for organization
   */
  async getRoles(organizationId: string): Promise<Role[]> {
    await delay(400);
    return mockRoles.filter(r => r.organizationId === organizationId);
  }

  /**
   * Get role by ID
   */
  async getRole(id: string): Promise<Role> {
    await delay(300);
    const role = mockRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');
    return role;
  }

  /**
   * Create new role
   */
  async createRole(organizationId: string, data: CreateRoleData): Promise<Role> {
    await delay(700);
    
    const permissions = mockPermissions.filter(p => 
      data.permissionIds.includes(p.id)
    );

    const newRole: Role = {
      id: String(mockRoles.length + 1),
      name: data.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: data.displayName,
      description: data.description,
      organizationId,
      isSystem: false,
      permissions,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockRoles.push(newRole);
    return newRole;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    await delay(600);
    
    const index = mockRoles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');
    if (mockRoles[index].isSystem) throw new Error('Cannot update system role');

    const permissions = data.permissionIds 
      ? mockPermissions.filter(p => data.permissionIds!.includes(p.id))
      : mockRoles[index].permissions;

    mockRoles[index] = {
      ...mockRoles[index],
      displayName: data.displayName || mockRoles[index].displayName,
      description: data.description !== undefined ? data.description : mockRoles[index].description,
      permissions,
      updatedAt: new Date().toISOString(),
    };

    return mockRoles[index];
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await delay(500);
    
    const index = mockRoles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');
    if (mockRoles[index].isSystem) throw new Error('Cannot delete system role');
    
    mockRoles.splice(index, 1);
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string, organizationId: string): Promise<UserRole[]> {
    await delay(300);
    return mockUserRoles.filter(
      ur => ur.userId === userId && ur.organizationId === organizationId
    );
  }

  /**
   * Assign role to user
   */
  async assignRole(organizationId: string, data: AssignRoleData): Promise<UserRole> {
    await delay(500);
    
    const role = mockRoles.find(r => r.id === data.roleId);
    if (!role) throw new Error('Role not found');

    const userRole: UserRole = {
      id: String(mockUserRoles.length + 1),
      userId: data.userId,
      roleId: data.roleId,
      organizationId,
      role,
      assignedAt: new Date().toISOString(),
      assignedBy: '1',
    };

    mockUserRoles.push(userRole);
    return userRole;
  }

  /**
   * Remove role from user
   */
  async removeRole(userRoleId: string): Promise<void> {
    await delay(400);
    
    const index = mockUserRoles.findIndex(ur => ur.id === userRoleId);
    if (index === -1) throw new Error('User role not found');
    
    mockUserRoles.splice(index, 1);
  }

  /**
   * Check if user has permission
   */
  async checkPermission(userId: string, organizationId: string, check: PermissionCheck): Promise<boolean> {
    await delay(200);
    
    const userRoles = mockUserRoles.filter(
      ur => ur.userId === userId && ur.organizationId === organizationId
    );

    for (const userRole of userRoles) {
      const hasPermission = userRole.role.permissions.some(
        p => p.resource === check.resource && p.action === check.action
      );
      if (hasPermission) return true;
    }

    return false;
  }

  /**
   * Get all user permissions
   */
  async getUserPermissions(userId: string, organizationId: string): Promise<Permission[]> {
    await delay(300);
    
    const userRoles = mockUserRoles.filter(
      ur => ur.userId === userId && ur.organizationId === organizationId
    );

    const permissionsMap = new Map<string, Permission>();
    
    userRoles.forEach(userRole => {
      userRole.role.permissions.forEach(permission => {
        permissionsMap.set(permission.id, permission);
      });
    });

    return Array.from(permissionsMap.values());
  }
}

export const rbacService = new RBACService();

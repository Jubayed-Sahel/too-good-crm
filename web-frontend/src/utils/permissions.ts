/**
 * Permission Utilities
 * Helper functions for permission checking and management
 */

import type { Permission } from '@/types';

/**
 * CRM Resource Types
 * Maps frontend resource names to backend permission resources
 */
export const CRM_RESOURCES = {
  LEADS: 'leads',
  DEALS: 'deals',
  CUSTOMERS: 'customers',
  CONTACTS: 'contacts',
  COMPANIES: 'companies',
  ACTIVITIES: 'activities',
  TASKS: 'tasks',
  NOTES: 'notes',
  PIPELINES: 'pipelines',
  STAGES: 'stages',
  EMPLOYEES: 'employees',
  VENDORS: 'vendors',
  ISSUES: 'issues',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
} as const;

/**
 * Permission Actions
 */
export const PERMISSION_ACTIONS = {
  READ: 'read',
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
} as const;

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Normalize resource name
 * Handles plural/singular variations
 */
export function normalizeResource(resource: string): string {
  // Remove trailing 's' for singular form
  if (resource.endsWith('s') && resource.length > 1) {
    return resource.slice(0, -1);
  }
  return resource;
}

/**
 * Normalize action name
 * Maps aliases to standard actions
 */
export function normalizeAction(action: string): string[] {
  const actionAliases: Record<string, string[]> = {
    'read': ['read', 'view'],
    'view': ['read', 'view'],
    'create': ['create'],
    'update': ['update', 'edit'],
    'edit': ['update', 'edit'],
    'delete': ['delete'],
    'export': ['export'],
    'import': ['import'],
    'manage': ['read', 'create', 'update', 'delete'],
  };

  return actionAliases[action.toLowerCase()] || [action.toLowerCase()];
}

/**
 * Check if a permission string matches a resource and action
 */
export function matchesPermission(
  permission: string,
  resource: string,
  action: string
): boolean {
  // Check wildcard permission
  if (permission === '*:*') {
    return true;
  }

  const [permResource, permAction] = permission.split(':');
  if (!permResource || !permAction) {
    return false;
  }

  // Normalize resource names
  const normalizedResource = normalizeResource(resource);
  const normalizedPermResource = normalizeResource(permResource);

  // Check resource match (plural or singular)
  const resourceMatches =
    permResource === resource ||
    permResource === normalizedResource ||
    normalizedPermResource === resource ||
    normalizedPermResource === normalizedResource;

  if (!resourceMatches) {
    return false;
  }

  // Check action match
  const normalizedActions = normalizeAction(action);
  const normalizedPermActions = normalizeAction(permAction);

  // Check if any action matches
  return (
    normalizedActions.some((a) => normalizedPermActions.includes(a)) ||
    normalizedPermActions.some((a) => normalizedActions.includes(a)) ||
    permAction === '*' ||
    action === '*'
  );
}

/**
 * Check if user has permission for a resource and action
 * 
 * @param permissions - Array of permission strings (e.g., ["customers:read", "deals:create"])
 * @param resource - Resource name (e.g., "customers", "deals")
 * @param action - Action name (e.g., "read", "create", "update")
 * @param isVendor - Whether user is a vendor (vendors have all permissions)
 * @param isOwner - Whether user is an owner (owners have all permissions)
 * 
 * @returns PermissionCheckResult with hasPermission boolean and optional reason
 */
export function hasPermission(
  permissions: string[],
  resource: string,
  action: string = PERMISSION_ACTIONS.READ,
  isVendor: boolean = false,
  isOwner: boolean = false
): PermissionCheckResult {
  // Vendors and owners have full access
  if (isVendor || isOwner) {
    return {
      hasPermission: true,
      reason: isVendor ? 'User is a vendor' : 'User is an owner',
    };
  }

  // If no permissions, deny access
  if (!permissions || permissions.length === 0) {
    return {
      hasPermission: false,
      reason: 'No permissions assigned',
    };
  }

  // Check wildcard permission
  if (permissions.includes('*:*')) {
    return {
      hasPermission: true,
      reason: 'User has wildcard permission',
    };
  }

  // Check each permission
  for (const permission of permissions) {
    if (matchesPermission(permission, resource, action)) {
      return {
        hasPermission: true,
        reason: `Permission granted: ${permission}`,
      };
    }
  }

  return {
    hasPermission: false,
    reason: `No matching permission found for ${resource}:${action}`,
  };
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  permissions: string[],
  checks: Array<{ resource: string; action?: string }>,
  isVendor: boolean = false,
  isOwner: boolean = false
): PermissionCheckResult {
  if (isVendor || isOwner) {
    return { hasPermission: true, reason: 'User has full access' };
  }

  for (const check of checks) {
    const result = hasPermission(
      permissions,
      check.resource,
      check.action || PERMISSION_ACTIONS.READ,
      isVendor,
      isOwner
    );
    if (result.hasPermission) {
      return result;
    }
  }

  return {
    hasPermission: false,
    reason: 'No matching permissions found',
  };
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  permissions: string[],
  checks: Array<{ resource: string; action?: string }>,
  isVendor: boolean = false,
  isOwner: boolean = false
): PermissionCheckResult {
  if (isVendor || isOwner) {
    return { hasPermission: true, reason: 'User has full access' };
  }

  for (const check of checks) {
    const result = hasPermission(
      permissions,
      check.resource,
      check.action || PERMISSION_ACTIONS.READ,
      isVendor,
      isOwner
    );
    if (!result.hasPermission) {
      return {
        hasPermission: false,
        reason: `Missing permission: ${check.resource}:${check.action || PERMISSION_ACTIONS.READ}`,
      };
    }
  }

  return {
    hasPermission: true,
    reason: 'All required permissions found',
  };
}

/**
 * Get all permissions for a specific resource
 */
export function getResourcePermissions(
  permissions: string[],
  resource: string
): string[] {
  const normalizedResource = normalizeResource(resource);
  
  return permissions.filter((perm) => {
    const [permResource] = perm.split(':');
    const normalizedPermResource = normalizeResource(permResource);
    
    return (
      permResource === resource ||
      permResource === normalizedResource ||
      normalizedPermResource === resource ||
      normalizedPermResource === normalizedResource ||
      permResource === '*'
    );
  });
}

/**
 * Format permission string for display
 */
export function formatPermission(permission: string): string {
  const [resource, action] = permission.split(':');
  const formattedResource = resource
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const formattedAction = action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${formattedResource}: ${formattedAction}`;
}


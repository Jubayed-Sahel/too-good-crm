/**
 * Permission Guard Component
 * Only renders children if user has the required permission
 */
import { usePermissions } from '@/hooks/usePermissions';

export interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // For multiple permissions
  permissions?: string[]; // Alternative to resource+action
}

/**
 * Permission Guard Component
 * Only renders children if user has the required permission(s)
 * 
 * Usage:
 * <PermissionGuard resource="customer" action="create">
 *   <Button>Create Customer</Button>
 * </PermissionGuard>
 * 
 * Or with multiple permissions:
 * <PermissionGuard permissions={['customer.create', 'customer.update']} requireAll={false}>
 *   <Button>Manage Customers</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  permissions,
  requireAll = true,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isOwner } = usePermissions();

  // Owners bypass all permission checks
  if (isOwner) {
    return <>{children}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // Check single permission
  if (resource && action) {
    if (!hasPermission(resource, action)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // No permissions specified - deny by default
  return <>{fallback}</>;
};

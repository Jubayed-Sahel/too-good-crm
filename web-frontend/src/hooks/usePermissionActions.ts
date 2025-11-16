/**
 * Hook to get permission flags for common actions
 * Makes it easy to check if user can perform CRUD operations
 */
import { usePermissions } from '@/contexts/PermissionContext';

export interface PermissionActions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport?: boolean;
  canImport?: boolean;
}

export const usePermissionActions = (resource: string): PermissionActions => {
  const { canAccess, isVendor } = usePermissions();

  // Vendors have all permissions
  if (isVendor) {
    return {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
      canImport: true,
    };
  }

  return {
    canRead: canAccess(resource, 'read'),
    canCreate: canAccess(resource, 'create'),
    canUpdate: canAccess(resource, 'update'),
    canDelete: canAccess(resource, 'delete'),
    canExport: canAccess(resource, 'export'),
    canImport: canAccess(resource, 'import'),
  };
};


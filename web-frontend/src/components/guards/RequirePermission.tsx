/**
 * RequirePermission Component
 * Wraps content and shows AccessDenied if user doesn't have permission
 * Always allows access to dashboard, settings, and customers
 */
import { usePermissions } from '@/contexts/PermissionContext';
import { AccessDenied } from './AccessDenied';
import type { ReactNode } from 'react';

interface RequirePermissionProps {
  resource: string;
  action?: string;
  children: ReactNode;
  alwaysAllow?: boolean; // If true, always show children (for dashboard, settings, customers)
}

export const RequirePermission = ({ 
  resource, 
  action = 'read',
  children,
  alwaysAllow = false 
}: RequirePermissionProps) => {
  const { canAccess, isVendor, isLoading, isEmployee } = usePermissions();

  // Always allow if flag is set (for dashboard, settings, customers)
  if (alwaysAllow) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Vendors always have access
  if (isVendor) {
    return <>{children}</>;
  }

  // For employees, check permission strictly
  if (isEmployee) {
    const hasAccess = canAccess(resource, action);
    if (!hasAccess) {
      console.log(`[RequirePermission] Employee denied access to ${resource}:${action}`);
      return (
        <AccessDenied 
          resource={resource}
          message={`You don't have access to ${resource}. Please contact your administrator.`}
        />
      );
    }
  }

  // Check permission for other profile types
  if (!canAccess(resource, action)) {
    return (
      <AccessDenied 
        resource={resource}
        message={`You don't have access to ${resource}. Please contact your administrator.`}
      />
    );
  }

  return <>{children}</>;
};


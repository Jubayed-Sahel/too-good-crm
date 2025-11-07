/**
 * Permission Context
 * Provides permission checking functionality throughout the app
 */
import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/hooks';
import type { ReactNode } from 'react';

interface PermissionContextType {
  canAccess: (resource: string, action?: string) => boolean;
  isVendor: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
  isOwner: boolean;
  userRole: string | null;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

/**
 * Permission Provider Component
 * Wraps app to provide permission checking
 */
export const PermissionProvider = ({ children }: PermissionProviderProps) => {
  const { user, isLoading } = useAuth();

  const permissions = useMemo(() => {
    // If auth is loading or no user, return default permissions
    if (isLoading || !user) {
      return {
        canAccess: () => false,
        isVendor: false,
        isEmployee: false,
        isCustomer: false,
        isOwner: false,
        userRole: null,
      };
    }

    const primaryProfile = user?.primaryProfile || user?.profiles?.[0];
    
    if (!primaryProfile) {
      return {
        canAccess: () => false,
        isVendor: false,
        isEmployee: false,
        isCustomer: false,
        isOwner: false,
        userRole: null,
      };
    }

    const profileType = primaryProfile.profile_type;
    const isVendor = profileType === 'vendor';
    const isEmployee = profileType === 'employee';
    const isCustomer = profileType === 'customer';

    // Check if user is organization owner (vendors are usually owners)
    const isOwner = isVendor; // Simplified - could check UserOrganization.is_owner

    /**
     * Check if user can access a resource/action
     * For now, simplified logic:
     * - Vendors/Owners: Full access to everything
     * - Employees: Limited access based on role
     * - Customers: Only client UI access
     */
    const canAccess = (resource: string, action: string = 'read'): boolean => {
      // Vendors/Owners have full access
      if (isVendor || isOwner) {
        return true;
      }

      // Customers can only access client resources
      if (isCustomer) {
        const clientResources = ['vendors', 'orders', 'payments', 'issues'];
        return clientResources.includes(resource);
      }

      // Employees - check based on typical sales role permissions
      if (isEmployee) {
        const employeePermissions: Record<string, string[]> = {
          // Resources employees can access
          'customers': ['read', 'create', 'update'],
          'leads': ['read', 'create', 'update'],
          'deals': ['read', 'create', 'update'],
          'activities': ['read', 'create', 'update'],
          'analytics': ['read'],
          'dashboard': ['read'],
          
          // Resources employees CANNOT access
          'employees': [],
          'vendors': [],
          'settings': [],
          'roles': [],
          'permissions': [],
        };

        const allowedActions = employeePermissions[resource] || [];
        return allowedActions.includes(action);
      }

      return false;
    };

    return {
      canAccess,
      isVendor,
      isEmployee,
      isCustomer,
      isOwner,
      userRole: profileType,
    };
  }, [user, isLoading]);

  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Hook to use permissions
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

/**
 * Component that only renders children if user has permission
 */
interface CanProps {
  access: string; // e.g., "customers", "leads:create", "settings"
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ access, children, fallback = null }: CanProps) => {
  const { canAccess } = usePermissions();

  // Parse access string: "resource" or "resource:action"
  const [resource, action = 'read'] = access.split(':');

  if (!canAccess(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

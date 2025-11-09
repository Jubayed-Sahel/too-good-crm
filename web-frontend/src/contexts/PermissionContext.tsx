/**
 * Permission Context
 * Provides permission checking functionality throughout the app
 */
import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { useProfile } from './ProfileContext';
import { rbacService } from '@/services';
import type { ReactNode } from 'react';
import type { Permission } from '@/types';

interface PermissionContextType {
  canAccess: (resource: string, action?: string) => boolean;
  isVendor: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
  isOwner: boolean;
  userRole: string | null;
  permissions: string[];
  isLoading: boolean;
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
  const { user, isLoading: authLoading } = useAuth();
  const { activeProfile, activeOrganizationId } = useProfile();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user permissions from backend
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user || !activeOrganizationId || !activeProfile) {
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // For employees, fetch actual permissions from backend
        if (activeProfile.profile_type === 'employee') {
          try {
            const userPermissions = await rbacService.getUserPermissions(user.id, activeOrganizationId);
            
            // Convert permissions to simple strings like "customers:read", "customers:create"
            const permissionStrings = userPermissions.permissions.map((p: Permission) => 
              `${p.resource}:${p.action}`
            );
            
            setPermissions(permissionStrings);
          } catch (permError) {
            console.warn('[PermissionContext] Could not fetch employee permissions, granting full access:', permError);
            // If permission fetch fails, grant full access to prevent blocking
            setPermissions(['*:*']);
          }
        } else {
          // Vendors, customers, and owners have all permissions
          setPermissions(['*:*']); // Wildcard for full access
        }
      } catch (error) {
        console.error('[PermissionContext] Failed to fetch permissions:', error);
        // On error, grant full access to prevent blocking the user
        setPermissions(['*:*']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeOrganizationId, activeProfile?.id]);

  const permissionContext = useMemo(() => {
    // If auth is loading or no user, return default permissions
    if (authLoading || !user || !activeProfile) {
      return {
        canAccess: () => false,
        isVendor: false,
        isEmployee: false,
        isCustomer: false,
        isOwner: false,
        userRole: null,
        permissions: [],
        isLoading: true,
      };
    }

    const profileType = activeProfile.profile_type;
    const isVendor = profileType === 'vendor';
    const isEmployee = profileType === 'employee';
    const isCustomer = profileType === 'customer';
    const isOwner = activeProfile.is_owner || false;

    /**
     * Check if user can access a resource/action
     * Uses real permissions from backend
     * 
     * Handles multiple permission naming conventions:
     * - customers:read or customer:view (both mean "view customers")
     * - customers:create or customer:create
     * - customers:update or customer:edit
     * - customers:delete or customer:delete
     */
    const canAccess = (resource: string, action: string = 'read'): boolean => {
      // Vendors/Owners have full access
      if (isVendor || isOwner) {
        return true;
      }

      // Check wildcard permission
      if (permissions.includes('*:*')) {
        return true;
      }

      // Normalize resource name (remove trailing 's' for singular form)
      const singularResource = resource.endsWith('s') ? resource.slice(0, -1) : resource;
      
      // Map action aliases (read <-> view, update <-> edit)
      const actionAliases: Record<string, string[]> = {
        'read': ['read', 'view'],
        'view': ['read', 'view'],
        'create': ['create'],
        'update': ['update', 'edit'],
        'edit': ['update', 'edit'],
        'delete': ['delete'],
      };
      
      const possibleActions = actionAliases[action] || [action];
      
      // Check all possible permission combinations
      for (const possibleAction of possibleActions) {
        // Check plural resource with action (e.g., "customers:read")
        const pluralPerm = `${resource}:${possibleAction}`;
        if (permissions.includes(pluralPerm)) {
          return true;
        }
        
        // Check singular resource with action (e.g., "customer:view")
        const singularPerm = `${singularResource}:${possibleAction}`;
        if (permissions.includes(singularPerm)) {
          return true;
        }
        
        // Check resource-level wildcard (e.g., "customers:*" or "customer:*")
        const pluralWildcard = `${resource}:*`;
        const singularWildcard = `${singularResource}:*`;
        if (permissions.includes(pluralWildcard) || permissions.includes(singularWildcard)) {
          return true;
        }
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
      permissions,
      isLoading,
    };
  }, [user, authLoading, activeProfile, permissions, isLoading, activeOrganizationId]);

  return (
    <PermissionContext.Provider value={permissionContext}>
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

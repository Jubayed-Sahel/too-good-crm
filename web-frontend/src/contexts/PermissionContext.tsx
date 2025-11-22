/**
 * Permission Context
 * Provides permission checking functionality throughout the app
 */
import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { useProfile } from './ProfileContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, getResourcePermissions } from '@/utils/permissions';
import type { ReactNode } from 'react';
import type { PermissionCheckResult } from '@/utils/permissions';

interface PermissionContextType {
  canAccess: (resource: string, action?: string) => boolean;
  hasPermission: (resource: string, action?: string) => PermissionCheckResult;
  hasAnyPermission: (checks: Array<{ resource: string; action?: string }>) => PermissionCheckResult;
  hasAllPermissions: (checks: Array<{ resource: string; action?: string }>) => PermissionCheckResult;
  getResourcePermissions: (resource: string) => string[];
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
          console.log('[PermissionContext] Fetching permissions for employee:', {
            userId: user.id,
            organizationId: activeOrganizationId,
            profileId: activeProfile.id
          });
          
          try {
            // Get token from localStorage (stored as 'authToken')
            const token = localStorage.getItem('authToken');
            if (!token) {
              throw new Error('No authentication token found');
            }
            
            // Ensure organizationId is a number
            const orgId = typeof activeOrganizationId === 'object' ? activeOrganizationId?.id : activeOrganizationId;
            
            console.log('[PermissionContext] Making API call:', {
              url: `/api/user-context/permissions/?organization=${orgId}`,
              token: token ? `${token.substring(0, 10)}...` : 'none',
            });
            
            // Call the correct endpoint: /api/user-context/permissions/
            const response = await fetch(`/api/user-context/permissions/?organization=${orgId}`, {
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            console.log('[PermissionContext] API response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('[PermissionContext] API error response:', errorText);
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const userPermissions = await response.json();
            
            console.log('[PermissionContext] Raw userPermissions response:', userPermissions);
            console.log('[PermissionContext] Permissions type:', typeof userPermissions.permissions);
            console.log('[PermissionContext] Permissions sample:', userPermissions.permissions?.slice(0, 5));
            
            // Backend returns permissions as array of strings with DOT notation (e.g., ["customers.read", "deals.read"])
            // Convert to COLON notation for frontend (e.g., ["customers:read", "deals:read"])
            const permissionStrings = (userPermissions.permissions || []).map((p: string) => {
              // Convert dot to colon: "customers.read" → "customers:read"
              return p.replace(/\./g, ':');
            });
            
            console.log('[PermissionContext] Employee permissions (converted):', permissionStrings.slice(0, 10));
            console.log('[PermissionContext] Permission count:', permissionStrings.length);
            
            // If no permissions found, employee has no role assigned - restrict access
            if (permissionStrings.length === 0) {
              console.warn('[PermissionContext] Employee has no permissions assigned. Access will be restricted.');
              console.warn('[PermissionContext] This usually means the employee has no role assigned or the role has no permissions.');
              setPermissions([]); // Empty = no permissions (only dashboard, settings, customers allowed)
            } else {
              setPermissions(permissionStrings);
            }
          } catch (permError: any) {
            console.error('[PermissionContext] Could not fetch employee permissions:', permError);
            console.error('[PermissionContext] Error details:', {
              message: permError?.message,
              stack: permError?.stack,
              response: permError?.response
            });
            // If permission fetch fails, restrict access (don't grant full access)
            setPermissions([]); // Empty = no permissions (only dashboard, settings, customers allowed)
          }
        } else {
          // Vendors, customers, and owners have all permissions
          setPermissions(['*:*']); // Wildcard for full access
        }
      } catch (error) {
        console.error('[PermissionContext] Failed to fetch permissions:', error);
        // On error, restrict access for employees, grant full access for others
        if (activeProfile?.profile_type === 'employee') {
          setPermissions([]); // Empty = no permissions for employees
        } else {
          setPermissions(['*:*']); // Full access for vendors/owners
        }
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

    // Debug logging (always enabled for debugging)
    console.log('[PermissionContext] Profile context:', {
      profileType,
      isVendor,
      isEmployee,
      isCustomer,
      isOwner,
      permissionsCount: permissions.length,
      samplePermissions: permissions.slice(0, 5),
    });

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
      console.log('[PermissionContext.canAccess] Checking:', { resource, action, isVendor, isOwner, isEmployee, permissionsCount: permissions.length });
      
      // Vendors/Owners have full access
      if (isVendor || isOwner) {
        console.log('[PermissionContext.canAccess] Granted (vendor/owner)');
        return true;
      }

      // For employees, always check permissions (no automatic access)
      if (isEmployee) {
        // For employees with no permissions, deny access
        if (permissions.length === 0) {
          console.log('[PermissionContext.canAccess] Denied (no permissions)');
          return false;
        }

        // Check wildcard permission
        if (permissions.includes('*:*')) {
          console.log('[PermissionContext.canAccess] Granted (wildcard)');
          return true;
        }
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
          console.log('[PermissionContext.canAccess] Granted (found:', pluralPerm, ')');
          return true;
        }
        
        // Check singular resource with action (e.g., "customer:view")
        const singularPerm = `${singularResource}:${possibleAction}`;
        if (permissions.includes(singularPerm)) {
          console.log('[PermissionContext.canAccess] Granted (found:', singularPerm, ')');
          return true;
        }
        
        // Check resource-level wildcard (e.g., "customers:*" or "customer:*")
        const pluralWildcard = `${resource}:*`;
        const singularWildcard = `${singularResource}:*`;
        if (permissions.includes(pluralWildcard) || permissions.includes(singularWildcard)) {
          console.log('[PermissionContext.canAccess] Granted (wildcard)');
          return true;
        }
      }

      // No matching permission found
      console.log('[PermissionContext.canAccess] Denied (no match found)');
      return false;
    };

    // Enhanced permission checkers using utility functions
    const checkPermission = (resource: string, action: string = 'read'): PermissionCheckResult => {
      return hasPermission(permissions, resource, action, isVendor, isOwner);
    };

    const checkAnyPermission = (checks: Array<{ resource: string; action?: string }>): PermissionCheckResult => {
      return hasAnyPermission(permissions, checks, isVendor, isOwner);
    };

    const checkAllPermissions = (checks: Array<{ resource: string; action?: string }>): PermissionCheckResult => {
      return hasAllPermissions(permissions, checks, isVendor, isOwner);
    };

    const getResourcePerms = (resource: string): string[] => {
      return getResourcePermissions(permissions, resource);
    };

    return {
      canAccess,
      hasPermission: checkPermission,
      hasAnyPermission: checkAnyPermission,
      hasAllPermissions: checkAllPermissions,
      getResourcePermissions: getResourcePerms,
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

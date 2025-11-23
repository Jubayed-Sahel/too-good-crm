/**
 * Permission Context
 * Provides permission checking functionality throughout the app
 */
import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { useProfile } from './ProfileContext';
import { rbacService } from '@/services';
import { hasPermission, hasAnyPermission, hasAllPermissions, getResourcePermissions } from '@/utils/permissions';
import type { ReactNode } from 'react';
import type { Permission } from '@/types';
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
      // ========== DIAGNOSTIC LOGGING ==========
      console.log('[PermissionContext] ========== PERMISSION FETCH START ==========');
      console.log('[PermissionContext] User:', user ? `${user.email} (ID: ${user.id})` : 'null');
      console.log('[PermissionContext] activeOrganizationId:', activeOrganizationId);
      console.log('[PermissionContext] activeProfile:', activeProfile);
      
      if (activeProfile) {
        console.log('[PermissionContext] Active Profile Details:', {
          id: activeProfile.id,
          profile_type: activeProfile.profile_type,
          organization: activeProfile.organization,
          organization_name: activeProfile.organization_name,
          roles: activeProfile.roles,
          is_primary: activeProfile.is_primary
        });
      }
      // ========================================
      
      if (!user || !activeOrganizationId || !activeProfile) {
        console.log('[PermissionContext] ❌ Missing required data - aborting permission fetch');
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // For employees, fetch actual permissions from backend
        if (activeProfile.profile_type === 'employee') {
          console.log('[PermissionContext] ✅ Profile is EMPLOYEE');
          console.log('[PermissionContext] Fetching permissions for employee:', {
            userId: user.id,
            organizationId: activeOrganizationId,
            profileId: activeProfile.id,
            employeeRole: activeProfile.roles && activeProfile.roles.length > 0 ? activeProfile.roles[0].name : 'NO ROLE'
          });
          
          try {
            console.log('[PermissionContext] Calling rbacService.getUserPermissions...');
            const userPermissions = await rbacService.getUserPermissions(user.id, activeOrganizationId);
            
            console.log('[PermissionContext] ✅ Received userPermissions response:', userPermissions);
            
            // Convert permissions to simple strings like "customers:read", "customers:create"
            const permissionStrings = userPermissions.permissions.map((p: Permission) => 
              `${p.resource}:${p.action}`
            );
            
            console.log('[PermissionContext] 📋 Employee permissions:', permissionStrings);
            console.log('[PermissionContext] 🔢 Permission count:', permissionStrings.length);
            
            // If no permissions found, employee has no role assigned - restrict access
            if (permissionStrings.length === 0) {
              console.warn('[PermissionContext] ⚠️ Employee has no permissions assigned. Access will be restricted.');
              console.warn('[PermissionContext] This usually means the employee has no role assigned or the role has no permissions.');
              console.warn('[PermissionContext] Check: Employee.role field in database');
              setPermissions([]); // Empty = no permissions (only dashboard, settings, customers allowed)
            } else {
              console.log('[PermissionContext] ✅ Setting permissions:', permissionStrings);
              setPermissions(permissionStrings);
            }
          } catch (permError: any) {
            console.error('[PermissionContext] ❌ Could not fetch employee permissions:', permError);
            console.error('[PermissionContext] Error details:', {
              message: permError?.message,
              stack: permError?.stack,
              response: permError?.response
            });
            // If permission fetch fails, restrict access (don't grant full access)
            console.warn('[PermissionContext] Setting empty permissions due to API error');
            setPermissions([]); // Empty = no permissions (only dashboard, settings, customers allowed)
          }
          console.log('[PermissionContext] ========== PERMISSION FETCH COMPLETE (Employee) ==========\n');
        } else {
          // Vendors, customers, and owners have all permissions
          console.log('[PermissionContext] ✅ Profile is VENDOR/CUSTOMER - granting full access');
          setPermissions(['*:*']); // Wildcard for full access
          console.log('[PermissionContext] ========== PERMISSION FETCH COMPLETE (Vendor/Customer) ==========\n');
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

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[PermissionContext] Profile context:', {
        profileType,
        isVendor,
        isEmployee,
        isCustomer,
        isOwner,
        permissionsCount: permissions.length,
      });
    }

    /**
     * Check if user can access a resource/action
     * Uses real permissions from backend
     * 
     * Backend uses STANDARDIZED convention:
     * - Resource names: SINGULAR (customer, employee, activity, issue, order, payment)
     * - Actions: CRUD (read, create, update, delete)
     * 
     * Frontend normalizes for backward compatibility:
     * - Accepts both singular and plural (customers → customer)
     * - Accepts both old and new actions (view → read, edit → update)
     */
    const canAccess = (resource: string, action: string = 'read'): boolean => {
      // Vendors/Owners have full access
      if (isVendor || isOwner) {
        return true;
      }

      // For employees, always check permissions (no automatic access)
      if (isEmployee) {
        // For employees with no permissions, deny access
        if (permissions.length === 0) {
          return false;
        }

        // Check wildcard permission
        if (permissions.includes('*:*')) {
          return true;
        }
      }

      // Normalize resource name to singular (backend standard)
      // customers → customer, employees → employee, activities → activity
      const singularResource = resource.endsWith('s') && resource !== 'analytics' && resource !== 'settings'
        ? resource.slice(0, -1) 
        : resource;
      
      // Normalize action to standard CRUD (backend standard)
      // view → read, edit → update
      const actionMap: Record<string, string> = {
        'view': 'read',
        'read': 'read',
        'create': 'create',
        'edit': 'update',
        'update': 'update',
        'delete': 'delete',
      };
      
      const normalizedAction = actionMap[action] || action;
      
      // Check the standardized permission format (singular:action)
      const standardPerm = `${singularResource}:${normalizedAction}`;
      if (permissions.includes(standardPerm)) {
        return true;
      }
      
      // Check resource-level wildcard
      const resourceWildcard = `${singularResource}:*`;
      if (permissions.includes(resourceWildcard)) {
        return true;
      }

      // No matching permission found
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

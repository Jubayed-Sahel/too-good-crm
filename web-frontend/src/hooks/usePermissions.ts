/**
 * Permission checking hook for RBAC
 * Provides utilities to check user permissions in the current organization
 */
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/apiClient';
import { useProfile } from '@/contexts/ProfileContext';

export interface UserPermissions {
  organization_id: number;
  organization_name: string;
  is_owner: boolean;
  is_employee: boolean;
  role: string | null;
  role_id: number | null;
  permissions: string[];
  grouped_permissions: Record<string, string[]>;
}

export const usePermissions = (organizationId?: number) => {
  const { activeOrganizationId } = useProfile();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const orgId = organizationId || activeOrganizationId;

  const fetchPermissions = useCallback(async () => {
    if (!orgId) {
      setPermissions(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get<UserPermissions>(
        `/user-context/permissions/?organization=${orgId}`
      );
      setPermissions(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      if (!permissions) return false;
      if (permissions.is_owner) return true; // Owners have all permissions
      return permissions.permissions.includes(`${resource}.${action}`);
    },
    [permissions]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissionList: string[]): boolean => {
      if (!permissions) return false;
      if (permissions.is_owner) return true;
      return permissionList.some((perm) => permissions.permissions.includes(perm));
    },
    [permissions]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissionList: string[]): boolean => {
      if (!permissions) return false;
      if (permissions.is_owner) return true;
      return permissionList.every((perm) => permissions.permissions.includes(perm));
    },
    [permissions]
  );

  /**
   * Check if user can perform action on resource
   */
  const can = useCallback(
    (action: string, resource: string): boolean => {
      return hasPermission(resource, action);
    },
    [hasPermission]
  );

  /**
   * Check if user is owner of the organization
   */
  const isOwner = permissions?.is_owner || false;

  /**
   * Check if user is employee in the organization
   */
  const isEmployee = permissions?.is_employee || false;

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    isOwner,
    isEmployee,
    refetch: fetchPermissions,
  };
};

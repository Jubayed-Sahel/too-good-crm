/**
 * RBAC React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacService } from '@/services';
import type { 
  CreateRoleData, 
  UpdateRoleData, 
  AssignRoleData, 
  PermissionCheck 
} from '@/types';

/**
 * Query keys for RBAC-related queries
 */
export const rbacKeys = {
  all: ['rbac'] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
  roles: (orgId: string) => [...rbacKeys.all, 'roles', orgId] as const,
  role: (id: string) => [...rbacKeys.all, 'role', id] as const,
  userRoles: (userId: string, orgId: string) => [...rbacKeys.all, 'userRoles', userId, orgId] as const,
  userPermissions: (userId: string, orgId: string) => [...rbacKeys.all, 'userPermissions', userId, orgId] as const,
};

/**
 * Get all permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: () => rbacService.getPermissions(),
  });
}

/**
 * Get roles for organization
 */
export function useRoles(organizationId: string) {
  return useQuery({
    queryKey: rbacKeys.roles(organizationId),
    queryFn: () => rbacService.getRoles(organizationId),
    enabled: !!organizationId,
  });
}

/**
 * Get role by ID
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: rbacKeys.role(id),
    queryFn: () => rbacService.getRole(id),
    enabled: !!id,
  });
}

/**
 * Get user roles
 */
export function useUserRoles(userId: string, organizationId: string) {
  return useQuery({
    queryKey: rbacKeys.userRoles(userId, organizationId),
    queryFn: () => rbacService.getUserRoles(userId, organizationId),
    enabled: !!(userId && organizationId),
  });
}

/**
 * Get user permissions
 */
export function useUserPermissions(userId: string, organizationId: string) {
  return useQuery({
    queryKey: rbacKeys.userPermissions(userId, organizationId),
    queryFn: () => rbacService.getUserPermissions(userId, organizationId),
    enabled: !!(userId && organizationId),
  });
}

/**
 * Check if user has permission
 */
export function useHasPermission(userId: string, organizationId: string, check: PermissionCheck) {
  return useQuery({
    queryKey: [...rbacKeys.userPermissions(userId, organizationId), 'check', check],
    queryFn: () => rbacService.checkPermission(userId, organizationId, check),
    enabled: !!(userId && organizationId && check),
  });
}

/**
 * Create role mutation
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: CreateRoleData }) =>
      rbacService.createRole(organizationId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles(variables.organizationId) });
    },
  });
}

/**
 * Update role mutation
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) =>
      rbacService.updateRole(id, data),
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.role(updatedRole.id) });
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles(updatedRole.organizationId) });
    },
  });
}

/**
 * Delete role mutation
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rbacService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all });
    },
  });
}

/**
 * Assign role mutation
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: AssignRoleData }) =>
      rbacService.assignRole(organizationId, data),
    onSuccess: (userRole) => {
      queryClient.invalidateQueries({ 
        queryKey: rbacKeys.userRoles(userRole.userId, userRole.organizationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: rbacKeys.userPermissions(userRole.userId, userRole.organizationId) 
      });
    },
  });
}

/**
 * Remove role mutation
 */
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userRoleId: string) => rbacService.removeRole(userRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all });
    },
  });
}

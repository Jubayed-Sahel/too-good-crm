/**
 * Organization React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services';
import type { CreateOrganizationData, UpdateOrganizationData, InviteUserData } from '@/types';

/**
 * Query keys for organization-related queries
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: string) => [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  current: () => [...organizationKeys.all, 'current'] as const,
  members: (id: string) => [...organizationKeys.all, 'members', id] as const,
};

/**
 * Get user's organizations
 */
export function useUserOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: () => organizationService.getUserOrganizations(),
  });
}

/**
 * Get current organization
 */
export function useCurrentOrganization() {
  return useQuery({
    queryKey: organizationKeys.current(),
    queryFn: () => organizationService.getCurrentOrganization(),
  });
}

/**
 * Get organization members
 */
export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId),
    queryFn: () => organizationService.getOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });
}

/**
 * Create organization mutation
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationData) => 
      organizationService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Update organization mutation
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationData }) =>
      organizationService.updateOrganization(id, data),
    onSuccess: (updatedOrg) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(updatedOrg.id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.current() });
    },
  });
}

/**
 * Switch organization mutation
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      organizationService.switchOrganization(organizationId),
    onSuccess: () => {
      // Invalidate current organization and refresh all data
      queryClient.invalidateQueries({ queryKey: organizationKeys.current() });
      queryClient.invalidateQueries(); // Refresh all queries
    },
  });
}

/**
 * Invite user mutation
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: InviteUserData }) =>
      organizationService.inviteUser(organizationId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: organizationKeys.members(variables.organizationId) 
      });
    },
  });
}

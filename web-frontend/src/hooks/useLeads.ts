/**
 * Leads React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '@/services';
import { useProfile } from '@/contexts/ProfileContext';
import type {
  CreateLeadData,
  UpdateLeadData,
  ConvertLeadData,
  LeadFilters,
  LeadActivity,
} from '@/types';

/**
 * Query keys for lead-related queries
 */
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters?: LeadFilters) => [...leadKeys.lists(), { filters }] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...leadKeys.details(), id] as const,
  activities: (id: string | number) => [...leadKeys.all, 'activities', id] as const,
  stats: () => [...leadKeys.all, 'stats'] as const,
};

/**
 * Get all leads with optional filters
 */
export function useLeads(filters?: LeadFilters) {
  const { activeOrganizationId } = useProfile();
  
  // Build filters with organization, converting null to undefined
  const filtersWithOrg = {
    ...filters,
    ...(activeOrganizationId ? { organization: activeOrganizationId } : {}),
  };
  
  return useQuery({
    queryKey: leadKeys.list(filtersWithOrg),
    queryFn: () => leadService.getLeads(filtersWithOrg),
    enabled: !!activeOrganizationId,
  });
}

/**
 * Get lead by ID
 */
export function useLead(id: string | number) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadService.getLead(id),
    enabled: !!id,
  });
}

/**
 * Get lead activities
 */
export function useLeadActivities(leadId: string | number) {
  return useQuery({
    queryKey: leadKeys.activities(leadId),
    queryFn: () => leadService.getLeadActivities(leadId),
    enabled: !!leadId,
  });
}

/**
 * Get lead statistics
 */
export function useLeadStats() {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: () => leadService.getLeadStats(),
  });
}

// Note: Mutations are exported from useLeadMutations.ts to avoid conflicts

/**
 * Convert lead to deal mutation
 */
export function useConvertLeadToDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data?: { deal_title?: string; deal_value?: number; description?: string } }) =>
      leadService.convertLeadToDeal(id, data || {}),
    onSuccess: (response) => {
      // Response structure: { deal_id, customer_id, lead, message }
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      if (response.lead?.id) {
        queryClient.invalidateQueries({ queryKey: leadKeys.detail(response.lead.id) });
      }
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // Invalidate customers
      queryClient.invalidateQueries({ queryKey: ['deals'] }); // Invalidate deals
    },
  });
}

/**
 * Add lead activity mutation
 */
export function useAddLeadActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, activity }: { leadId: string | number; activity: Partial<LeadActivity> }) =>
      leadService.addLeadActivity(leadId, activity),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.activities(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) });
    },
  });
}

/**
 * Update lead score mutation
 */
export function useUpdateLeadScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score, reason }: { id: string | number; score: number; reason: string }) =>
      leadService.updateLeadScore(id, score, reason),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(updatedLead.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
    },
  });
}

/**
 * Assign lead mutation
 */
export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string | number; userId: string | number }) =>
      leadService.assignLead(id, userId),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(updatedLead.id) });
    },
  });
}

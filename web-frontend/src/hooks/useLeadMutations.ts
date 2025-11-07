/**
 * Lead Mutation Hooks using React Query
 * Provides reusable mutations for lead operations with automatic cache management
 * 
 * Usage:
 * const createLead = useCreateLead();
 * createLead.mutate({ name: 'John Doe', email: 'john@example.com', ... });
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { toaster } from '@/components/ui/toaster';
import type { CreateLeadData, UpdateLeadData } from '@/types';

/**
 * Create Lead Mutation
 * Automatically invalidates lead list cache on success
 */
export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLeadData) => leadService.createLead(data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead created',
        description: `Lead "${data.name || data.company}" has been created successfully.`,
        type: 'success',
      });
      
      // Invalidate and refetch lead list and stats
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      // Extract specific backend validation errors
      const errorMessage = 
        error.response?.data?.email?.[0] ||
        error.response?.data?.phone?.[0] ||
        error.response?.data?.name?.[0] ||
        error.response?.data?.company?.[0] ||
        error.response?.data?.lead_score?.[0] ||
        error.response?.data?.estimated_value?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to create lead. Please try again.';
      
      toaster.create({
        title: 'Error creating lead',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Update Lead Mutation
 * Automatically invalidates both list and detail cache on success
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateLeadData }) =>
      leadService.updateLead(id, data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead updated',
        description: `Lead "${data.name || data.company}" has been updated successfully.`,
        type: 'success',
      });
      
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.email?.[0] ||
        error.response?.data?.phone?.[0] ||
        error.response?.data?.lead_score?.[0] ||
        error.response?.data?.estimated_value?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to update lead. Please try again.';
      
      toaster.create({
        title: 'Error updating lead',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Delete Lead Mutation
 * Automatically removes lead from cache on success
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => leadService.deleteLead(id),
    onSuccess: (_, id) => {
      toaster.create({
        title: 'Lead deleted',
        description: 'Lead has been deleted successfully.',
        type: 'success',
      });
      
      // Invalidate list and remove from cache
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.removeQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error deleting lead',
        description: error.response?.data?.detail || 'Failed to delete lead. Please try again.',
        type: 'error',
      });
    },
  });
}

/**
 * Convert Lead to Customer Mutation
 * Converts lead to customer and updates lead status
 */
export function useConvertLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: { customer_type?: 'individual' | 'business'; assigned_to_id?: number } }) =>
      leadService.convertLead(id, data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead converted',
        description: `Lead "${data.name || data.company}" has been converted to a customer.`,
        type: 'success',
      });
      
      // Invalidate leads and customers
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error converting lead',
        description: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Failed to convert lead.',
        type: 'error',
      });
    },
  });
}

/**
 * Qualify Lead Mutation
 * Marks lead as qualified
 */
export function useQualifyLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => leadService.qualifyLead(id),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead qualified',
        description: `Lead "${data.name || data.company}" has been marked as qualified.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error qualifying lead',
        description: error.response?.data?.detail || 'Failed to qualify lead.',
        type: 'error',
      });
    },
  });
}

/**
 * Disqualify Lead Mutation
 * Marks lead as disqualified with optional reason
 */
export function useDisqualifyLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason?: string }) =>
      leadService.disqualifyLead(id, reason),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead disqualified',
        description: `Lead "${data.name || data.company}" has been marked as disqualified.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error disqualifying lead',
        description: error.response?.data?.detail || 'Failed to disqualify lead.',
        type: 'error',
      });
    },
  });
}

/**
 * Assign Lead Mutation
 * Assigns lead to a user
 */
export function useAssignLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string | number; userId: string | number }) =>
      leadService.assignLead(id, userId),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead assigned',
        description: `Lead "${data.name || data.company}" has been assigned.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error assigning lead',
        description: error.response?.data?.detail || 'Failed to assign lead.',
        type: 'error',
      });
    },
  });
}

/**
 * Update Lead Score Mutation
 * Updates lead score with reason
 */
export function useUpdateLeadScore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, score, reason }: { id: string | number; score: number; reason: string }) =>
      leadService.updateLeadScore(id, score, reason),
    onSuccess: (data) => {
      toaster.create({
        title: 'Lead score updated',
        description: `Lead score updated to ${data.lead_score}.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error updating lead score',
        description: error.response?.data?.detail || 'Failed to update lead score.',
        type: 'error',
      });
    },
  });
}

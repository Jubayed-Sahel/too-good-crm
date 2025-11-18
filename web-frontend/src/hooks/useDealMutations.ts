/**
 * Deal Mutation Hooks using React Query
 * Provides reusable mutations for deal operations with automatic cache management
 * 
 * Usage:
 * const createDeal = useCreateDeal();
 * createDeal.mutate({ title: 'Big Deal', customer: 1, value: 50000, ... });
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster';
import { dealService } from '@/services/deal.service';

/**
 * Create Deal Mutation
 * Automatically invalidates deal list cache on success
 */
export function useCreateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => dealService.createDeal(data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal created',
        description: `Deal "${data.title}" has been created successfully.`,
        type: 'success',
      });
      
      // Invalidate and refetch deal list and stats
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
    },
    onError: (error: any) => {
      // Extract specific backend validation errors
      const errorMessage = 
        error.response?.data?.title?.[0] ||
        error.response?.data?.customer?.[0] ||
        error.response?.data?.value?.[0] ||
        error.response?.data?.probability?.[0] ||
        error.response?.data?.expected_close_date?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to create deal. Please try again.';
      
      toaster.create({
        title: 'Error creating deal',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Update Deal Mutation
 * Automatically invalidates both list and detail cache on success
 */
export function useUpdateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      dealService.updateDeal(id, data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal updated',
        description: `Deal "${data.title}" has been updated successfully.`,
        type: 'success',
      });
      
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.title?.[0] ||
        error.response?.data?.value?.[0] ||
        error.response?.data?.probability?.[0] ||
        error.response?.data?.expected_close_date?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to update deal. Please try again.';
      
      toaster.create({
        title: 'Error updating deal',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Delete Deal Mutation
 * Automatically removes deal from cache on success
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => dealService.deleteDeal(id),
    onSuccess: (_, id) => {
      toaster.create({
        title: 'Deal deleted',
        description: 'Deal has been deleted successfully.',
        type: 'success',
      });
      
      // Invalidate list and remove from cache, then refetch
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.removeQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
      // Force refetch all deal queries to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ['deals'], exact: false });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error deleting deal',
        description: error.response?.data?.detail || 'Failed to delete deal. Please try again.',
        type: 'error',
      });
    },
  });
}

/**
 * Move Deal to Stage Mutation
 * Updates deal stage in the pipeline
 */
export function useMoveDealToStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stageId }: { id: number; stageId: number }) =>
      dealService.updateDeal(id, { stage: stageId }),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal moved',
        description: `Deal "${data.title}" has been moved to a new stage.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error moving deal',
        description: error.response?.data?.detail || 'Failed to move deal.',
        type: 'error',
      });
    },
  });
}

/**
 * Mark Deal as Won Mutation
 * Sets deal status to won and updates close date
 */
export function useMarkDealWon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      dealService.updateDeal(id, { 
        is_won: true, 
        is_lost: false,
        actual_close_date: new Date().toISOString().split('T')[0]
      } as any),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal won! 🎉',
        description: `Congratulations! Deal "${data.title}" has been won.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error marking deal as won',
        description: error.response?.data?.detail || 'Failed to mark deal as won.',
        type: 'error',
      });
    },
  });
}

/**
 * Mark Deal as Lost Mutation
 * Sets deal status to lost with optional reason
 */
export function useMarkDealLost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      dealService.updateDeal(id, { 
        is_lost: true,
        is_won: false,
        lost_reason: reason,
        actual_close_date: new Date().toISOString().split('T')[0]
      } as any),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal marked as lost',
        description: `Deal "${data.title}" has been marked as lost.`,
        type: 'info',
      });
      
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error marking deal as lost',
        description: error.response?.data?.detail || 'Failed to mark deal as lost.',
        type: 'error',
      });
    },
  });
}

/**
 * Reopen Deal Mutation
 * Reopens a closed deal
 */
export function useReopenDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      dealService.updateDeal(id, { 
        is_won: false,
        is_lost: false,
        actual_close_date: null,
        lost_reason: null
      } as any),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal reopened',
        description: `Deal "${data.title}" has been reopened.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error reopening deal',
        description: error.response?.data?.detail || 'Failed to reopen deal.',
        type: 'error',
      });
    },
  });
}

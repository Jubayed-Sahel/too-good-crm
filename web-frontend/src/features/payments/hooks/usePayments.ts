/**
 * usePayments Hook
 * React Query hook for payment data fetching and management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services';
import { toaster } from '@/components/ui/toaster';
import { useProfile } from '@/contexts/ProfileContext';
import type { CreatePaymentData, UpdatePaymentData, PaymentFilters } from '../types';

const PAYMENTS_QUERY_KEY = 'payments';

export const usePayments = (filters?: PaymentFilters) => {
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  const queryFilters: PaymentFilters = {
    ...filters,
    organization: organizationId || undefined,
  };

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, queryFilters],
    queryFn: () => paymentService.getAll(queryFilters),
    enabled: !!organizationId,
  });
};

export const usePayment = (id: number) => {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, id],
    queryFn: () => paymentService.getById(id),
    enabled: !!id,
  });
};

export const usePaymentStats = (filters?: PaymentFilters) => {
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  const queryFilters: PaymentFilters = {
    ...filters,
    organization: organizationId || undefined,
  };

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, 'stats', queryFilters],
    queryFn: () => paymentService.getStats(),
    enabled: !!organizationId,
  });
};

export const usePaymentMutations = () => {
  const queryClient = useQueryClient();

  const createPayment = useMutation({
    mutationFn: (data: CreatePaymentData) => {
      return paymentService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      toaster.create({
        title: 'Payment Created',
        description: 'Payment has been created successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to create payment',
        type: 'error',
      });
    },
  });

  const updatePayment = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaymentData }) =>
      paymentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      toaster.create({
        title: 'Payment Updated',
        description: 'Payment has been updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to update payment',
        type: 'error',
      });
    },
  });

  const deletePayment = useMutation({
    mutationFn: (id: number) => paymentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      toaster.create({
        title: 'Payment Deleted',
        description: 'Payment has been deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to delete payment',
        type: 'error',
      });
    },
  });

  const processPayment = useMutation({
    mutationFn: (id: number) => paymentService.process(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      toaster.create({
        title: 'Payment Processed',
        description: 'Payment has been processed successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to process payment',
        type: 'error',
      });
    },
  });

  const markPaymentFailed = useMutation({
    mutationFn: (id: number) => paymentService.markFailed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      toaster.create({
        title: 'Payment Marked as Failed',
        description: 'Payment status has been updated',
        type: 'info',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to update payment status',
        type: 'error',
      });
    },
  });

  return {
    createPayment,
    updatePayment,
    deletePayment,
    processPayment,
    markPaymentFailed,
  };
};

/**
 * React Query mutations for customer operations
 * Demonstrates best practices for state management with TanStack Query
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customer.service';
import { toaster } from '@/components/ui/toaster';
import type { Customer } from '@/types';

/**
 * Hook for creating a customer
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Customer>) => customerService.createCustomer(data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Customer created successfully',
        description: `Customer "${data.full_name || data.email}" has been created.`,
        type: 'success',
      });
      
      // Invalidate and refetch customer queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      console.error('Error creating customer:', error);
      
      // Handle validation errors from backend
      const errorMessage = error.response?.data?.email?.[0] 
        || error.response?.data?.phone?.[0]
        || error.response?.data?.company_name?.[0]
        || error.response?.data?.non_field_errors?.[0]
        || 'Failed to create customer. Please try again.';
      
      toaster.create({
        title: 'Failed to create customer',
        description: errorMessage,
        type: 'error',
      });
    },
  });
};

/**
 * Hook for updating a customer
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => 
      customerService.updateCustomer(id, data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Customer updated successfully',
        description: `Customer "${data.full_name || data.email}" has been updated.`,
        type: 'success',
      });
      
      // Invalidate customer queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
    },
    onError: (error: any) => {
      console.error('Error updating customer:', error);
      
      const errorMessage = error.response?.data?.email?.[0] 
        || error.response?.data?.phone?.[0]
        || error.response?.data?.non_field_errors?.[0]
        || 'Failed to update customer. Please try again.';
      
      toaster.create({
        title: 'Failed to update customer',
        description: errorMessage,
        type: 'error',
      });
    },
  });
};

/**
 * Hook for deleting a customer
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: (_, id) => {
      toaster.create({
        title: 'Customer deleted successfully',
        description: 'Customer has been deleted.',
        type: 'success',
      });
      
      // Invalidate customer queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
    onError: (error: any) => {
      console.error('Error deleting customer:', error);
      toaster.create({
        title: 'Failed to delete customer',
        description: 'Please try again.',
        type: 'error',
      });
    },
  });
};

/**
 * Hook for activating a customer
 */
export const useActivateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerService.activate(id),
    onSuccess: (data) => {
      toaster.create({
        title: 'Customer activated',
        description: `Customer "${data.full_name || data.email}" is now active.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
    },
    onError: (error: any) => {
      console.error('Error activating customer:', error);
      toaster.create({
        title: 'Failed to activate customer',
        description: 'Please try again.',
        type: 'error',
      });
    },
  });
};

/**
 * Hook for deactivating a customer
 */
export const useDeactivateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerService.deactivate(id),
    onSuccess: (data) => {
      toaster.create({
        title: 'Customer deactivated',
        description: `Customer "${data.full_name || data.email}" is now inactive.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
    },
    onError: (error: any) => {
      console.error('Error deactivating customer:', error);
      toaster.create({
        title: 'Failed to deactivate customer',
        description: 'Please try again.',
        type: 'error',
      });
    },
  });
};

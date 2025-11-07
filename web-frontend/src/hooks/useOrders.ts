/**
 * useOrders Hook
 * React Query hook for order data fetching and management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services';
import { toaster } from '../components/ui/toaster';
import { useAuth } from './useAuth';
import type { CreateOrderData, UpdateOrderData, OrderFilters } from '../types';

const ORDERS_QUERY_KEY = 'orders';

export const useOrders = (filters?: OrderFilters) => {
  const { user } = useAuth();
  const organizationId = user?.primaryOrganizationId;

  const queryFilters: OrderFilters = {
    ...filters,
    organization: organizationId,
  };

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, queryFilters],
    queryFn: () => orderService.getAll(queryFilters),
    enabled: !!organizationId,
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};

export const useOrderStats = (filters?: OrderFilters) => {
  const { user } = useAuth();
  const organizationId = user?.primaryOrganizationId;

  const queryFilters: OrderFilters = {
    ...filters,
    organization: organizationId,
  };

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'stats', queryFilters],
    queryFn: () => orderService.getStats(),
    enabled: !!organizationId,
  });
};

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: (data: CreateOrderData) => {
      return orderService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toaster.create({
        title: 'Order Created',
        description: 'Order has been created successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to create order',
        type: 'error',
      });
    },
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderData }) =>
      orderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toaster.create({
        title: 'Order Updated',
        description: 'Order has been updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to update order',
        type: 'error',
      });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: (id: number) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toaster.create({
        title: 'Order Deleted',
        description: 'Order has been deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to delete order',
        type: 'error',
      });
    },
  });

  const completeOrder = useMutation({
    mutationFn: (id: number) => orderService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toaster.create({
        title: 'Order Completed',
        description: 'Order has been marked as completed',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to complete order',
        type: 'error',
      });
    },
  });

  const cancelOrder = useMutation({
    mutationFn: (id: number) => orderService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toaster.create({
        title: 'Order Cancelled',
        description: 'Order has been cancelled',
        type: 'info',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to cancel order',
        type: 'error',
      });
    },
  });

  return {
    createOrder,
    updateOrder,
    deleteOrder,
    completeOrder,
    cancelOrder,
  };
};

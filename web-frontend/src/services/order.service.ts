/**
 * Order Service
 * API service for Order-related operations
 */

import api from '@/lib/apiClient';
import type { Order, CreateOrderData, UpdateOrderData, OrderStats, OrderFilters, PaginatedResponse } from '@/types';

export const orderService = {
  /**
   * Get all orders with optional filters
   */
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    return api.get<PaginatedResponse<Order>>('/orders/', { params: filters });
  },

  /**
   * Get single order by ID
   */
  getById: async (id: number): Promise<Order> => {
    return api.get<Order>(`/orders/${id}/`);
  },

  /**
   * Create new order with items
   */
  create: async (data: CreateOrderData): Promise<Order> => {
    return api.post<Order>('/orders/', data);
  },

  /**
   * Update existing order
   */
  update: async (id: number, data: UpdateOrderData): Promise<Order> => {
    return api.put<Order>(`/orders/${id}/`, data);
  },

  /**
   * Partially update order
   */
  partialUpdate: async (id: number, data: Partial<UpdateOrderData>): Promise<Order> => {
    return api.patch<Order>(`/orders/${id}/`, data);
  },

  /**
   * Delete order
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}/`);
  },

  /**
   * Mark order as completed
   */
  complete: async (id: number): Promise<Order> => {
    return api.post<Order>(`/orders/${id}/complete/`);
  },

  /**
   * Cancel order
   */
  cancel: async (id: number): Promise<Order> => {
    return api.post<Order>(`/orders/${id}/cancel/`);
  },

  /**
   * Get order statistics
   */
  getStats: async (): Promise<OrderStats> => {
    return api.get<OrderStats>('/orders/stats/');
  },
};

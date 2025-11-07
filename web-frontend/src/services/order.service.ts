/**
 * Order Service
 * API service for Order-related operations
 */

import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Order, CreateOrderData, UpdateOrderData, OrderStats, OrderFilters, PaginatedResponse } from '@/types';

export const orderService = {
  /**
   * Get all orders with optional filters
   */
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    return api.get<PaginatedResponse<Order>>(API_CONFIG.ENDPOINTS.ORDERS.LIST, { params: filters });
  },

  /**
   * Get single order by ID
   */
  getById: async (id: number): Promise<Order> => {
    return api.get<Order>(API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id));
  },

  /**
   * Create new order with items
   */
  create: async (data: CreateOrderData): Promise<Order> => {
    return api.post<Order>(API_CONFIG.ENDPOINTS.ORDERS.LIST, data);
  },

  /**
   * Update existing order
   */
  update: async (id: number, data: UpdateOrderData): Promise<Order> => {
    return api.put<Order>(API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id), data);
  },

  /**
   * Partially update order
   */
  partialUpdate: async (id: number, data: Partial<UpdateOrderData>): Promise<Order> => {
    return api.patch<Order>(API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id), data);
  },

  /**
   * Delete order
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id));
  },

  /**
   * Get order items
   */
  getItems: async (id: number): Promise<any[]> => {
    return api.get<any[]>(API_CONFIG.ENDPOINTS.ORDERS.ITEMS(id));
  },

  /**
   * Mark order as completed
   */
  complete: async (id: number): Promise<Order> => {
    return api.post<Order>(API_CONFIG.ENDPOINTS.ORDERS.COMPLETE(id));
  },

  /**
   * Cancel order
   */
  cancel: async (id: number): Promise<Order> => {
    return api.post<Order>(API_CONFIG.ENDPOINTS.ORDERS.CANCEL(id));
  },

  /**
   * Get order statistics
   */
  getStats: async (): Promise<OrderStats> => {
    return api.get<OrderStats>(API_CONFIG.ENDPOINTS.ORDERS.STATS);
  },
};

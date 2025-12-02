/**
 * Payment Service
 * API service for Payment-related operations
 */

import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentStats, PaymentFilters, PaginatedResponse } from '@/types';

export const paymentService = {
  /**
   * Get all payments with optional filters
   */
  getAll: async (filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> => {
    return api.get<PaginatedResponse<Payment>>(API_CONFIG.ENDPOINTS.PAYMENTS.LIST, { params: filters });
  },

  /**
   * Get single payment by ID
   */
  getById: async (id: number): Promise<Payment> => {
    return api.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id));
  },

  /**
   * Create new payment
   */
  create: async (data: CreatePaymentData): Promise<Payment> => {
    return api.post<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.LIST, data);
  },

  /**
   * Update existing payment
   */
  update: async (id: number, data: UpdatePaymentData): Promise<Payment> => {
    return api.put<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id), data);
  },

  /**
   * Partially update payment
   */
  partialUpdate: async (id: number, data: Partial<UpdatePaymentData>): Promise<Payment> => {
    return api.patch<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id), data);
  },

  /**
   * Delete payment
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id));
  },

  /**
   * Confirm payment
   */
  confirm: async (id: number): Promise<Payment> => {
    return api.post<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.CONFIRM(id));
  },

  /**
   * Refund payment
   */
  refund: async (id: number): Promise<Payment> => {
    return api.post<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.REFUND(id));
  },

  /**
   * Mark payment as processed (completed) - Legacy support
   */
  process: async (id: number): Promise<Payment> => {
    return api.post<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.CONFIRM(id));
  },

  /**
   * Mark payment as failed - Legacy support
   */
  markFailed: async (id: number): Promise<Payment> => {
    return api.post<Payment>(`/payments/${id}/mark_failed/`);
  },

  /**
   * Get payment statistics
   */
  getStats: async (): Promise<PaymentStats> => {
    return api.get<PaymentStats>(API_CONFIG.ENDPOINTS.PAYMENTS.STATS);
  },
};

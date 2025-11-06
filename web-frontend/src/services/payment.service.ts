/**
 * Payment Service
 * API service for Payment-related operations
 */

import api from '@/lib/apiClient';
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentStats, PaymentFilters, PaginatedResponse } from '@/types';

export const paymentService = {
  /**
   * Get all payments with optional filters
   */
  getAll: async (filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> => {
    return api.get<PaginatedResponse<Payment>>('/payments/', { params: filters });
  },

  /**
   * Get single payment by ID
   */
  getById: async (id: number): Promise<Payment> => {
    return api.get<Payment>(`/payments/${id}/`);
  },

  /**
   * Create new payment
   */
  create: async (data: CreatePaymentData): Promise<Payment> => {
    return api.post<Payment>('/payments/', data);
  },

  /**
   * Update existing payment
   */
  update: async (id: number, data: UpdatePaymentData): Promise<Payment> => {
    return api.put<Payment>(`/payments/${id}/`, data);
  },

  /**
   * Partially update payment
   */
  partialUpdate: async (id: number, data: Partial<UpdatePaymentData>): Promise<Payment> => {
    return api.patch<Payment>(`/payments/${id}/`, data);
  },

  /**
   * Delete payment
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/payments/${id}/`);
  },

  /**
   * Mark payment as processed (completed)
   */
  process: async (id: number): Promise<Payment> => {
    return api.post<Payment>(`/payments/${id}/process/`);
  },

  /**
   * Mark payment as failed
   */
  markFailed: async (id: number): Promise<Payment> => {
    return api.post<Payment>(`/payments/${id}/mark_failed/`);
  },

  /**
   * Get payment statistics
   */
  getStats: async (): Promise<PaymentStats> => {
    return api.get<PaymentStats>('/payments/stats/');
  },
};

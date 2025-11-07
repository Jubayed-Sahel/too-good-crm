/**
 * Vendor Service
 * API service for Vendor-related operations
 */

import api from '../lib/apiClient';
import type { Vendor, CreateVendorData, UpdateVendorData, VendorStats, VendorFilters, PaginatedResponse } from '../types';

export const vendorService = {
  /**
   * Get all vendors with optional filters
   */
  getAll: async (filters?: VendorFilters): Promise<PaginatedResponse<Vendor>> => {
    return api.get<PaginatedResponse<Vendor>>('/vendors/', { params: filters });
  },

  /**
   * Get single vendor by ID
   */
  getById: async (id: number): Promise<Vendor> => {
    return api.get<Vendor>(`/vendors/${id}/`);
  },

  /**
   * Create new vendor
   */
  create: async (data: CreateVendorData): Promise<Vendor> => {
    return api.post<Vendor>('/vendors/', data);
  },

  /**
   * Update existing vendor
   */
  update: async (id: number, data: UpdateVendorData): Promise<Vendor> => {
    return api.put<Vendor>(`/vendors/${id}/`, data);
  },

  /**
   * Partially update vendor
   */
  partialUpdate: async (id: number, data: Partial<UpdateVendorData>): Promise<Vendor> => {
    return api.patch<Vendor>(`/vendors/${id}/`, data);
  },

  /**
   * Delete vendor
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/vendors/${id}/`);
  },

  /**
   * Get vendor types
   */
  getTypes: async (): Promise<string[]> => {
    return api.get<string[]>('/vendors/types/');
  },

  /**
   * Get vendor statistics
   */
  getStats: async (filters?: VendorFilters): Promise<VendorStats> => {
    return api.get<VendorStats>('/vendors/stats/', { params: filters });
  },
};

/**
 * Vendor Service
 * API service for Vendor-related operations
 */

import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Vendor, CreateVendorData, UpdateVendorData, VendorStats, VendorFilters, PaginatedResponse } from '../types';

export const vendorService = {
  /**
   * Get all vendors with optional filters
   */
  getAll: async (filters?: VendorFilters): Promise<PaginatedResponse<Vendor>> => {
    return api.get<PaginatedResponse<Vendor>>(API_CONFIG.ENDPOINTS.VENDORS.LIST, { params: filters });
  },

  /**
   * Get single vendor by ID
   */
  getById: async (id: number): Promise<Vendor> => {
    return api.get<Vendor>(API_CONFIG.ENDPOINTS.VENDORS.DETAIL(id));
  },

  /**
   * Create new vendor
   */
  create: async (data: CreateVendorData): Promise<Vendor> => {
    return api.post<Vendor>(API_CONFIG.ENDPOINTS.VENDORS.LIST, data);
  },

  /**
   * Update existing vendor
   */
  update: async (id: number, data: UpdateVendorData): Promise<Vendor> => {
    return api.put<Vendor>(API_CONFIG.ENDPOINTS.VENDORS.DETAIL(id), data);
  },

  /**
   * Partially update vendor
   */
  partialUpdate: async (id: number, data: Partial<UpdateVendorData>): Promise<Vendor> => {
    return api.patch<Vendor>(API_CONFIG.ENDPOINTS.VENDORS.DETAIL(id), data);
  },

  /**
   * Delete vendor
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.VENDORS.DETAIL(id));
  },

  /**
   * Get vendor types
   */
  getTypes: async (): Promise<string[]> => {
    return api.get<string[]>(API_CONFIG.ENDPOINTS.VENDORS.TYPES);
  },

  /**
   * Get vendor statistics
   */
  getStats: async (filters?: VendorFilters): Promise<VendorStats> => {
    return api.get<VendorStats>(API_CONFIG.ENDPOINTS.VENDORS.STATS, { params: filters });
  },
};

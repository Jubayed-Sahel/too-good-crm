/**
 * Issue Service
 * API service for Issue-related operations
 */

import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Issue, CreateIssueData, UpdateIssueData, IssueStats, IssueFilters, PaginatedResponse } from '@/types';

export const issueService = {
  /**
   * Get all issues with optional filters
   */
  getAll: async (filters?: IssueFilters): Promise<PaginatedResponse<Issue>> => {
    return api.get<PaginatedResponse<Issue>>(API_CONFIG.ENDPOINTS.ISSUES.LIST, { params: filters });
  },

  /**
   * Get single issue by ID
   */
  getById: async (id: number): Promise<Issue> => {
    return api.get<Issue>(API_CONFIG.ENDPOINTS.ISSUES.DETAIL(id));
  },

  /**
   * Create new issue
   */
  create: async (data: CreateIssueData): Promise<Issue> => {
    return api.post<Issue>(API_CONFIG.ENDPOINTS.ISSUES.LIST, data);
  },

  /**
   * Update existing issue
   */
  update: async (id: number, data: UpdateIssueData): Promise<Issue> => {
    return api.put<Issue>(API_CONFIG.ENDPOINTS.ISSUES.DETAIL(id), data);
  },

  /**
   * Partially update issue
   */
  partialUpdate: async (id: number, data: Partial<UpdateIssueData>): Promise<Issue> => {
    return api.patch<Issue>(API_CONFIG.ENDPOINTS.ISSUES.DETAIL(id), data);
  },

  /**
   * Delete issue
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.ISSUES.DETAIL(id));
  },

  /**
   * Resolve issue
   */
  resolve: async (id: number): Promise<Issue> => {
    return api.post<Issue>(API_CONFIG.ENDPOINTS.ISSUES.RESOLVE(id));
  },

  /**
   * Close issue
   */
  close: async (id: number): Promise<Issue> => {
    return api.post<Issue>(API_CONFIG.ENDPOINTS.ISSUES.CLOSE(id));
  },

  /**
   * Reopen resolved/closed issue
   */
  reopen: async (id: number): Promise<Issue> => {
    return api.post<Issue>(API_CONFIG.ENDPOINTS.ISSUES.REOPEN(id));
  },

  /**
   * Get issue statistics
   */
  getStats: async (): Promise<IssueStats> => {
    return api.get<IssueStats>(API_CONFIG.ENDPOINTS.ISSUES.STATS);
  },
};

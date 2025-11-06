/**
 * Issue Service
 * API service for Issue-related operations
 */

import api from '@/lib/apiClient';
import type { Issue, CreateIssueData, UpdateIssueData, IssueStats, IssueFilters, PaginatedResponse } from '@/types';

export const issueService = {
  /**
   * Get all issues with optional filters
   */
  getAll: async (filters?: IssueFilters): Promise<PaginatedResponse<Issue>> => {
    return api.get<PaginatedResponse<Issue>>('/issues/', { params: filters });
  },

  /**
   * Get single issue by ID
   */
  getById: async (id: number): Promise<Issue> => {
    return api.get<Issue>(`/issues/${id}/`);
  },

  /**
   * Create new issue
   */
  create: async (data: CreateIssueData): Promise<Issue> => {
    return api.post<Issue>('/issues/', data);
  },

  /**
   * Update existing issue
   */
  update: async (id: number, data: UpdateIssueData): Promise<Issue> => {
    return api.put<Issue>(`/issues/${id}/`, data);
  },

  /**
   * Partially update issue
   */
  partialUpdate: async (id: number, data: Partial<UpdateIssueData>): Promise<Issue> => {
    return api.patch<Issue>(`/issues/${id}/`, data);
  },

  /**
   * Delete issue
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/issues/${id}/`);
  },

  /**
   * Resolve issue
   */
  resolve: async (id: number): Promise<Issue> => {
    return api.post<Issue>(`/issues/${id}/resolve/`);
  },

  /**
   * Reopen resolved issue
   */
  reopen: async (id: number): Promise<Issue> => {
    return api.post<Issue>(`/issues/${id}/reopen/`);
  },

  /**
   * Get issue statistics
   */
  getStats: async (): Promise<IssueStats> => {
    return api.get<IssueStats>('/issues/stats/');
  },
};

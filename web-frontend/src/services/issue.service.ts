/**
 * Issue Service
 * API service for Issue-related operations
 */

import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Issue, CreateIssueData, UpdateIssueData, IssueStats, IssueFilters, PaginatedResponse, ClientRaiseIssueData } from '@/types';

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
   * Raise issue (with auto-sync to Linear)
   */
  raise: async (data: any): Promise<any> => {
    return api.post('/api/issues/raise/', data);
  },

  /**
   * Resolve issue (with optional resolution notes)
   */
  resolve: async (id: number, resolutionNotes?: string): Promise<Issue> => {
    return api.post<Issue>(`/api/issues/resolve/${id}/`, { resolution_notes: resolutionNotes });
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

  /**
   * Client endpoints
   */
  
  /**
   * Raise issue as a client about an organization
   */
  clientRaise: async (data: ClientRaiseIssueData): Promise<any> => {
    console.log('🌐 [issueService] POST /api/client/issues/raise/', data);
    try {
      const response = await api.post('/api/client/issues/raise/', data);
      console.log('✅ [issueService] Response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [issueService] Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Get client issue details
   */
  clientGetIssue: async (id: number): Promise<Issue> => {
    return api.get<Issue>(`/api/client/issues/${id}/`);
  },

  /**
   * Add comment to client issue
   */
  clientAddComment: async (id: number, comment: string): Promise<Issue> => {
    return api.post<Issue>(`/api/client/issues/${id}/comment/`, { comment });
  },

  /**
   * Fetch issues from Linear (for vendors/employees)
   * @param limit - Maximum number of issues to fetch (default: 50)
   * @param sync - Whether to sync Linear issues to CRM (default: false)
   */
  fetchFromLinear: async (limit: number = 50, sync: boolean = false): Promise<any> => {
    return api.get('/api/issues/fetch_from_linear/', {
      params: { limit, sync: sync.toString() }
    });
  },

  /**
   * Sync issue to Linear
   */
  syncToLinear: async (id: number): Promise<any> => {
    return api.post(`/api/issues/${id}/sync_to_linear/`);
  },

  /**
   * Sync issue from Linear (pull latest changes)
   */
  syncFromLinear: async (id: number): Promise<Issue> => {
    return api.post<Issue>(`/api/issues/${id}/sync_from_linear/`);
  },
};

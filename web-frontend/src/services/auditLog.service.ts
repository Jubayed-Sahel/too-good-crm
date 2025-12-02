/**
 * Audit Log Service
 * API service for system-level audit logging (CRUD operations)
 */

import api from '@/lib/apiClient';

export interface AuditLog {
  id: number;
  created_at: string;
  updated_at: string;
  organization: number;
  user: number | null;
  user_email: string;
  user_profile_type: 'vendor' | 'employee' | 'customer';
  action: string;
  action_display: string;
  resource_type: string;
  resource_type_display: string;
  resource_id: number | null;
  resource_name: string;
  description: string;
  changes?: Record<string, { old: any; new: any }>;
  ip_address?: string | null;
  user_agent?: string | null;
  request_path?: string | null;
  request_method?: string | null;
  related_customer?: number | null;
  related_lead?: number | null;
  related_deal?: number | null;
  customer_name?: string | null;
  lead_name?: string | null;
  deal_name?: string | null;
}

export interface AuditLogStats {
  total_logs: number;
  recent_activity_24h: number;
  by_action: Record<string, { label: string; count: number }>;
  by_resource: Record<string, { label: string; count: number }>;
  by_profile_type: Record<string, number>;
}

export interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  user_id?: number;
  profile_type?: string;
  customer_id?: number;
  lead_id?: number;
  deal_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  organization?: number;
}

export interface PaginatedAuditLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export const auditLogService = {
  /**
   * Get audit logs with optional filters
   */
  getAll: async (filters?: AuditLogFilters): Promise<PaginatedAuditLogs> => {
    return api.get<PaginatedAuditLogs>('/api/audit-logs/', { params: filters });
  },

  /**
   * Get single audit log by ID
   */
  getById: async (id: number): Promise<AuditLog> => {
    return api.get<AuditLog>(`/api/audit-logs/${id}/`);
  },

  /**
   * Get audit log statistics
   */
  getStats: async (filters?: { organization?: number }): Promise<AuditLogStats> => {
    return api.get<AuditLogStats>('/api/audit-logs/stats/', { params: filters });
  },

  /**
   * Get recent audit logs (last 50)
   */
  getRecent: async (): Promise<AuditLog[]> => {
    return api.get<AuditLog[]>('/api/audit-logs/recent/');
  },

  /**
   * Get timeline view (grouped by date)
   */
  getTimeline: async (): Promise<Record<string, AuditLog[]>> => {
    return api.get<Record<string, AuditLog[]>>('/api/audit-logs/timeline/');
  },
};


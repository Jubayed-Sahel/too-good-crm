/**
 * Leads Service - Connected to Backend API
 */
import api from '@/lib/apiClient';
import { API_CONFIG, buildUrl } from '@/config/api.config';
import type {
  Lead,
  LeadActivity,
  CreateLeadData,
  UpdateLeadData,
  ConvertLeadData,
  LeadFilters,
  PaginatedResponse,
} from '@/types';
import type { LeadStats } from '@/types/lead.types';

class LeadService {
  /**
   * Get all leads with optional filters
   */
  async getLeads(filters?: LeadFilters): Promise<PaginatedResponse<Lead>> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.LEADS.LIST, filters as any);
    return api.get<PaginatedResponse<Lead>>(url);
  }

  /**
   * Get lead by ID
   */
  async getLead(id: string | number): Promise<Lead> {
    const url = API_CONFIG.ENDPOINTS.LEADS.DETAIL(id);
    return api.get<Lead>(url);
  }

  /**
   * Create new lead
   */
  async createLead(data: CreateLeadData): Promise<Lead> {
    return api.post<Lead>(API_CONFIG.ENDPOINTS.LEADS.LIST, data);
  }

  /**
   * Update lead
   */
  async updateLead(id: string | number, data: UpdateLeadData): Promise<Lead> {
    const url = API_CONFIG.ENDPOINTS.LEADS.DETAIL(id);
    return api.patch<Lead>(url, data);
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string | number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.LEADS.DETAIL(id);
    return api.delete(url);
  }

  /**
   * Convert lead to customer/deal
   * Returns response with customer_id and lead data
   */
  async convertLead(id: string | number, data: ConvertLeadData): Promise<{ customer_id: number; lead: Lead; message: string }> {
    const url = API_CONFIG.ENDPOINTS.LEADS.CONVERT(id);
    return api.post<{ customer_id: number; lead: Lead; message: string }>(url, data);
  }

  /**
   * Convert lead to deal (creates customer first, then deal)
   * Returns response with deal_id, customer_id and lead data
   */
  async convertLeadToDeal(
    id: string | number, 
    data: { deal_title?: string; deal_value?: number; description?: string }
  ): Promise<{ deal_id: number; customer_id: number | null; lead: Lead; message: string }> {
    const url = API_CONFIG.ENDPOINTS.LEADS.CONVERT_TO_DEAL(id);
    return api.post<{ deal_id: number; customer_id: number | null; lead: Lead; message: string }>(url, data);
  }

  /**
   * Qualify lead
   */
  async qualifyLead(id: string | number): Promise<Lead> {
    const url = API_CONFIG.ENDPOINTS.LEADS.QUALIFY(id);
    return api.post<Lead>(url);
  }

  /**
   * Disqualify lead
   */
  async disqualifyLead(id: string | number, reason?: string): Promise<Lead> {
    const url = API_CONFIG.ENDPOINTS.LEADS.DISQUALIFY(id);
    return api.post<Lead>(url, { reason });
  }

  /**
   * Get lead activities
   */
  async getLeadActivities(leadId: string | number): Promise<LeadActivity[]> {
    const url = API_CONFIG.ENDPOINTS.LEADS.ACTIVITIES(leadId);
    return api.get<LeadActivity[]>(url);
  }

  /**
   * Add lead activity
   */
  async addLeadActivity(leadId: string | number, activity: Partial<LeadActivity>): Promise<LeadActivity> {
    const url = API_CONFIG.ENDPOINTS.LEADS.ADD_ACTIVITY(leadId);
    return api.post<LeadActivity>(url, activity);
  }

  /**
   * Update lead score
   */
  async updateLeadScore(id: string | number, newScore: number, reason: string): Promise<Lead> {
    const url = API_CONFIG.ENDPOINTS.LEADS.UPDATE_SCORE(id);
    return api.post<Lead>(url, { score: newScore, reason });
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(): Promise<LeadStats> {
    return api.get<LeadStats>(API_CONFIG.ENDPOINTS.LEADS.STATS);
  }

  /**
   * Assign lead to user
   */
  async assignLead(id: string | number, userId: string | number): Promise<Lead> {
    const url = API_CONFIG.ENDPOINTS.LEADS.ASSIGN(id);
    return api.post<Lead>(url, { assigned_to: userId });
  }
}

export const leadService = new LeadService();

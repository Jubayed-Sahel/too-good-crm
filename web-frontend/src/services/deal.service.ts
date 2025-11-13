/**
 * Deals Service
 * Handles deal and pipeline-related API calls
 */
import api from '@/lib/apiClient';
import { API_CONFIG, buildQueryString } from '@/config/api.config';
import type { Deal, PaginatedResponse } from '@/types';

export interface DealStats {
  total: number;
  open: number;
  won: number;
  lost: number;
  total_value: number;
  won_value: number;
  average_deal_size: number;
  win_rate: number;
  average_days_to_close: number;
}

export interface Pipeline {
  id: number;
  name: string;
  description?: string;
  is_default: boolean;
  organization: number;
  created_at: string;
  updated_at: string;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: number;
  name: string;
  pipeline: number;
  probability: number;
  order: number;
  created_at: string;
  updated_at: string;
  deals_count?: number;
}

export interface DealFilters {
  status?: string;
  stage?: number;
  pipeline?: number;
  assigned_to?: number;
  customer?: number;
  min_value?: number;
  max_value?: number;
  tags?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DealCreateData {
  title: string;
  value: number;
  currency?: string;
  customer: number;
  stage: number;  // Pipeline stage ID
  pipeline?: number;
  probability?: number;
  expected_close_date?: string;
  assigned_to?: number;
  tags?: string[];
  notes?: string;
  description?: string;
}

export interface MoveStageData {
  stage: number;
  notes?: string;
}

export interface MarkWonData {
  actual_close_date?: string;
  notes?: string;
}

export interface MarkLostData {
  lost_reason: string;
  notes?: string;
}

class DealService {
  /**
   * Get paginated list of deals
   */
  async getDeals(filters?: DealFilters): Promise<PaginatedResponse<Deal>> {
    const endpoint = API_CONFIG.ENDPOINTS.DEALS.LIST;
    const queryString = filters ? buildQueryString(filters) : '';
    return api.get<PaginatedResponse<Deal>>(`${endpoint}${queryString}`);
  }

  /**
   * Get deal by ID
   */
  async getDeal(id: number): Promise<Deal> {
    const url = API_CONFIG.ENDPOINTS.DEALS.DETAIL(id);
    return api.get<Deal>(url);
  }

  /**
   * Create new deal
   */
  async createDeal(data: DealCreateData): Promise<Deal> {
    return api.post<Deal>(API_CONFIG.ENDPOINTS.DEALS.LIST, data);
  }

  /**
   * Update deal
   */
  async updateDeal(id: number, data: Partial<DealCreateData>): Promise<Deal> {
    const url = API_CONFIG.ENDPOINTS.DEALS.DETAIL(id);
    return api.patch<Deal>(url, data);
  }

  /**
   * Delete deal
   */
  async deleteDeal(id: number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.DEALS.DETAIL(id);
    return api.delete(url);
  }

  /**
   * Get deal statistics
   */
  async getStats(filters?: Pick<DealFilters, 'pipeline' | 'assigned_to'>): Promise<DealStats> {
    const endpoint = API_CONFIG.ENDPOINTS.DEALS.STATS;
    const queryString = filters ? buildQueryString(filters) : '';
    return api.get<DealStats>(`${endpoint}${queryString}`);
  }

  /**
   * Move deal to different stage
   */
  async moveStage(id: number, data: MoveStageData): Promise<Deal> {
    const url = API_CONFIG.ENDPOINTS.DEALS.MOVE_STAGE(id);
    return api.post<Deal>(url, data);
  }

  /**
   * Mark deal as won
   */
  async markWon(id: number, data?: MarkWonData): Promise<Deal> {
    const url = API_CONFIG.ENDPOINTS.DEALS.MARK_WON(id);
    return api.post<Deal>(url, data || {});
  }

  /**
   * Mark deal as lost
   */
  async markLost(id: number, data: MarkLostData): Promise<Deal> {
    const url = API_CONFIG.ENDPOINTS.DEALS.MARK_LOST(id);
    return api.post<Deal>(url, data);
  }

  /**
   * Reopen a closed deal
   */
  async reopen(id: number): Promise<Deal> {
    const url = API_CONFIG.ENDPOINTS.DEALS.REOPEN(id);
    return api.post<Deal>(url);
  }

  /**
   * Get pipeline statistics (legacy method)
   */
  async getPipelineStats(): Promise<DealStats> {
    return this.getStats();
  }

  // ==================== Pipelines ====================

  /**
   * Get all pipelines
   */
  async getPipelines(): Promise<Pipeline[]> {
    const response = await api.get<PaginatedResponse<Pipeline>>(API_CONFIG.ENDPOINTS.PIPELINES.LIST);
    return response.results || [];
  }

  /**
   * Get a single pipeline by ID
   */
  async getPipeline(id: number): Promise<Pipeline> {
    const url = API_CONFIG.ENDPOINTS.PIPELINES.DETAIL(id);
    return api.get<Pipeline>(url);
  }

  /**
   * Create a new pipeline
   */
  async createPipeline(data: Omit<Pipeline, 'id' | 'created_at' | 'updated_at' | 'organization'>): Promise<Pipeline> {
    return api.post<Pipeline>(API_CONFIG.ENDPOINTS.PIPELINES.LIST, data);
  }

  /**
   * Update a pipeline
   */
  async updatePipeline(id: number, data: Partial<Omit<Pipeline, 'id' | 'created_at' | 'updated_at' | 'organization'>>): Promise<Pipeline> {
    const url = API_CONFIG.ENDPOINTS.PIPELINES.DETAIL(id);
    return api.patch<Pipeline>(url, data);
  }

  /**
   * Delete a pipeline
   */
  async deletePipeline(id: number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.PIPELINES.DETAIL(id);
    return api.delete(url);
  }

  /**
   * Set a pipeline as default
   */
  async setDefaultPipeline(id: number): Promise<Pipeline> {
    const url = API_CONFIG.ENDPOINTS.PIPELINES.SET_DEFAULT(id);
    return api.post<Pipeline>(url);
  }

  /**
   * Get pipeline stages
   */
  async getPipelineStages(pipelineId?: number): Promise<PipelineStage[]> {
    const endpoint = API_CONFIG.ENDPOINTS.PIPELINES.STAGES;
    const queryString = pipelineId ? buildQueryString({ pipeline: pipelineId }) : '';
    const response = await api.get<PaginatedResponse<PipelineStage>>(`${endpoint}${queryString}`);
    return response.results || [];
  }

  /**
   * Create a pipeline stage
   */
  async createPipelineStage(
    pipelineId: number,
    data: Omit<PipelineStage, 'id' | 'created_at' | 'updated_at' | 'pipeline'>
  ): Promise<PipelineStage> {
    return api.post<PipelineStage>(API_CONFIG.ENDPOINTS.PIPELINES.STAGES, { 
      ...data, 
      pipeline: pipelineId 
    });
  }

  /**
   * Update a pipeline stage
   */
  async updatePipelineStage(
    stageId: number,
    data: Partial<Omit<PipelineStage, 'id' | 'created_at' | 'updated_at' | 'pipeline'>>
  ): Promise<PipelineStage> {
    const url = API_CONFIG.ENDPOINTS.PIPELINES.STAGE_DETAIL(stageId);
    return api.patch<PipelineStage>(url, data);
  }

  /**
   * Delete a pipeline stage
   */
  async deletePipelineStage(stageId: number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.PIPELINES.STAGE_DETAIL(stageId);
    return api.delete(url);
  }

  /**
   * Reorder pipeline stages
   */
  async reorderStages(pipelineId: number, stageOrders: { id: number; order: number }[]): Promise<PipelineStage[]> {
    return api.post<PipelineStage[]>(`/pipelines/${pipelineId}/stages/reorder/`, {
      stages: stageOrders,
    });
  }

  /**
   * Get deals by pipeline stage (for Kanban view)
   */
  async getDealsByStage(pipelineId: number): Promise<Record<number, Deal[]>> {
    const deals = await this.getDeals({ pipeline: pipelineId, page_size: 1000 });
    const dealsByStage: Record<number, Deal[]> = {};

    deals.results.forEach(deal => {
      const stageId = typeof deal.stage === 'number' ? deal.stage : parseInt(deal.stage, 10);
      if (!dealsByStage[stageId]) {
        dealsByStage[stageId] = [];
      }
      dealsByStage[stageId].push(deal);
    });

    return dealsByStage;
  }

  /**
   * Bulk update deals
   */
  async bulkUpdate(dealIds: number[], data: Partial<DealCreateData>): Promise<Deal[]> {
    return api.post<Deal[]>('/deals/bulk_update/', {
      ids: dealIds,
      data,
    });
  }

  /**
   * Export deals to CSV
   */
  async exportDeals(filters?: DealFilters): Promise<Blob> {
    const endpoint = '/deals/export/';
    const queryString = filters ? buildQueryString(filters) : '';
    return api.get<Blob>(`${endpoint}${queryString}`, {
      responseType: 'blob',
    });
  }
}

export const dealService = new DealService();

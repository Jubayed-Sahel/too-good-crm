/**
 * Deal service
 */
import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/constants';
import type { Deal, PaginatedResponse } from '@/types';

class DealService {
  /**
   * Get paginated list of deals
   */
  async getDeals(_params?: Record<string, any>): Promise<PaginatedResponse<Deal>> {
    // Mock data for development
    const mockDeals: Deal[] = [
      {
        id: 1,
        title: 'Enterprise Software License',
        customer: 1,
        customer_name: 'John Doe',
        value: 150000,
        stage: 'negotiation',
        probability: 75,
        expected_close_date: '2024-02-15',
        assigned_to: 1,
        description: 'Annual enterprise software license renewal',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z',
      },
      {
        id: 2,
        title: 'Cloud Migration Project',
        customer: 2,
        customer_name: 'Jane Smith',
        value: 250000,
        stage: 'proposal',
        probability: 60,
        expected_close_date: '2024-03-01',
        assigned_to: 2,
        description: 'Full cloud infrastructure migration',
        created_at: '2024-01-12T09:15:00Z',
        updated_at: '2024-01-18T16:45:00Z',
      },
      {
        id: 3,
        title: 'Consulting Services',
        customer: 3,
        customer_name: 'Mike Johnson',
        value: 75000,
        stage: 'qualified',
        probability: 40,
        expected_close_date: '2024-02-28',
        assigned_to: 1,
        description: 'Business process optimization consulting',
        created_at: '2024-01-15T11:30:00Z',
        updated_at: '2024-01-15T11:30:00Z',
      },
      {
        id: 4,
        title: 'Product Development',
        customer: 4,
        customer_name: 'Sarah Williams',
        value: 180000,
        stage: 'lead',
        probability: 25,
        expected_close_date: '2024-04-15',
        assigned_to: 3,
        description: 'Custom product development engagement',
        created_at: '2024-01-18T13:00:00Z',
        updated_at: '2024-01-18T13:00:00Z',
      },
      {
        id: 5,
        title: 'Training Package',
        customer: 5,
        customer_name: 'David Brown',
        value: 45000,
        stage: 'closed-won',
        probability: 100,
        expected_close_date: '2024-01-25',
        actual_close_date: '2024-01-24',
        assigned_to: 2,
        description: 'Corporate training program',
        is_won: true,
        is_closed: true,
        created_at: '2024-01-05T08:00:00Z',
        updated_at: '2024-01-24T17:00:00Z',
      },
      {
        id: 6,
        title: 'System Integration',
        customer: 1,
        customer_name: 'John Doe',
        value: 95000,
        stage: 'negotiation',
        probability: 80,
        expected_close_date: '2024-02-20',
        assigned_to: 1,
        description: 'ERP system integration',
        created_at: '2024-01-08T10:30:00Z',
        updated_at: '2024-01-22T15:20:00Z',
      },
    ];

    return Promise.resolve({
      count: mockDeals.length,
      next: null,
      previous: null,
      results: mockDeals,
    });
  }

  /**
   * Get deal by ID
   */
  async getDeal(id: number): Promise<Deal> {
    return apiService.get<Deal>(API_ENDPOINTS.DEALS.DETAIL(id));
  }

  /**
   * Create new deal
   */
  async createDeal(data: Partial<Deal>): Promise<Deal> {
    return apiService.post<Deal>(API_ENDPOINTS.DEALS.LIST, data);
  }

  /**
   * Update deal
   */
  async updateDeal(id: number, data: Partial<Deal>): Promise<Deal> {
    return apiService.patch<Deal>(API_ENDPOINTS.DEALS.DETAIL(id), data);
  }

  /**
   * Delete deal
   */
  async deleteDeal(id: number): Promise<void> {
    return apiService.delete(API_ENDPOINTS.DEALS.DETAIL(id));
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(): Promise<any> {
    return apiService.get(API_ENDPOINTS.DEALS.PIPELINE_STATS);
  }
}

export const dealService = new DealService();

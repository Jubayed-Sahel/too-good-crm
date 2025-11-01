/**
 * Analytics service
 */
import type { DashboardStats } from '@/types';

class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Mock data for development
    return Promise.resolve({
      customers: {
        total: 1234,
        new_this_month: 87,
        by_status: {
          active: 890,
          inactive: 234,
          pending: 110,
        },
      },
      deals: {
        total: 156,
        open: 87,
        won: 45,
        total_won_value: 452000,
        pipeline_value: 1250000,
        win_rate: 28.8,
      },
      user_stats: {
        my_customers: 45,
        my_deals: 23,
      },
    });

    // Uncomment when backend is ready
    // return apiService.get<DashboardStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  }
}

export const analyticsService = new AnalyticsService();

/**
 * Analytics service
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { DashboardStats } from '@/types';

class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>(API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD);
  }

  /**
   * Get sales funnel metrics
   */
  async getSalesFunnel(): Promise<any> {
    return api.get(API_CONFIG.ENDPOINTS.ANALYTICS.SALES_FUNNEL);
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year' = 'month', limit: number = 12): Promise<any> {
    return api.get(`${API_CONFIG.ENDPOINTS.ANALYTICS.REVENUE_BY_PERIOD}?period=${period}&limit=${limit}`);
  }

  /**
   * Get employee performance metrics
   */
  async getEmployeePerformance(): Promise<any> {
    return api.get(API_CONFIG.ENDPOINTS.ANALYTICS.EMPLOYEE_PERFORMANCE);
  }

  /**
   * Get top performers
   */
  async getTopPerformers(metric: 'revenue' | 'deals' | 'win_rate' = 'revenue', limit: number = 10): Promise<any> {
    return api.get(`${API_CONFIG.ENDPOINTS.ANALYTICS.TOP_PERFORMERS}?metric=${metric}&limit=${limit}`);
  }
}

export const analyticsService = new AnalyticsService();

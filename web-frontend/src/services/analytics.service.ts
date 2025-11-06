/**
 * Analytics service
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { 
  DashboardStats,
  RevenueData,
  MonthlyRevenue,
  SalesPipelineData,
  TopPerformer,
  EmployeePerformance,
  ConversionFunnelData,
  RecentActivity,
} from '@/types';

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
  async getSalesFunnel(): Promise<ConversionFunnelData> {
    return api.get<ConversionFunnelData>(API_CONFIG.ENDPOINTS.ANALYTICS.SALES_FUNNEL);
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year' = 'month', limit: number = 12): Promise<MonthlyRevenue[]> {
    return api.get<MonthlyRevenue[]>(`${API_CONFIG.ENDPOINTS.ANALYTICS.REVENUE_BY_PERIOD}?period=${period}&limit=${limit}`);
  }

  /**
   * Get revenue data for chart (with current/previous month comparison)
   */
  async getRevenueChartData(): Promise<RevenueData> {
    // Get last 6 months of data
    const monthlyData = await this.getRevenueByPeriod('month', 6);
    
    // Calculate current month and previous month
    const currentMonth = monthlyData[monthlyData.length - 1]?.revenue || 0;
    const previousMonth = monthlyData[monthlyData.length - 2]?.revenue || 0;
    const growth = previousMonth > 0 
      ? ((currentMonth - previousMonth) / previousMonth) * 100 
      : currentMonth > 0 ? 100 : 0;

    return {
      currentMonth,
      previousMonth,
      growth,
      monthlyData,
    };
  }

  /**
   * Get employee performance metrics
   */
  async getEmployeePerformance(): Promise<EmployeePerformance[]> {
    return api.get<EmployeePerformance[]>(API_CONFIG.ENDPOINTS.ANALYTICS.EMPLOYEE_PERFORMANCE);
  }

  /**
   * Get top performers
   */
  async getTopPerformers(metric: 'revenue' | 'deals' | 'win_rate' = 'revenue', limit: number = 10): Promise<TopPerformer[]> {
    const performance = await api.get<EmployeePerformance[]>(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.TOP_PERFORMERS}?metric=${metric}&limit=${limit}`
    );
    
    // Transform employee performance to top performer format
    return performance.map(perf => ({
      id: perf.employee.id,
      name: perf.employee.user 
        ? `${perf.employee.user.first_name} ${perf.employee.user.last_name}`.trim()
        : perf.employee.code,
      role: perf.employee.designation || perf.employee.department || 'Employee',
      deals: perf.deals.won,
      revenue: perf.revenue.won,
    }));
  }

  /**
   * Get sales pipeline data (by pipeline stages)
   */
  async getSalesPipeline(): Promise<SalesPipelineData> {
    // This will be handled by a new backend endpoint
    // For now, return from deals stats
    const response = await api.get<any>('/deals/stats/');
    
    // Transform to pipeline format
    const stages = response.by_stage || [];
    const totalValue = stages.reduce((sum: number, stage: any) => sum + (stage.total_value || 0), 0);
    
    return {
      stages: stages.map((stage: any, index: number) => ({
        name: stage.stage_name || 'Unknown',
        count: stage.count || 0,
        value: stage.total_value || 0,
        color: this.getStageColor(index),
      })),
      totalValue,
    };
  }

  /**
   * Get recent activities for analytics
   */
  async getRecentActivities(limit: number = 6): Promise<RecentActivity[]> {
    const response = await api.get<{ results: RecentActivity[] }>(
      `/activities/?ordering=-created_at&page_size=${limit}`
    );
    return response.results || [];
  }

  /**
   * Helper to get color for pipeline stages
   */
  private getStageColor(index: number): string {
    const colors = [
      '#718096', // gray
      '#3182CE', // blue
      '#805AD5', // purple
      '#DD6B20', // orange
      '#38A169', // green
    ];
    return colors[index % colors.length];
  }
}

export const analyticsService = new AnalyticsService();

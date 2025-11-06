/**
 * Analytics hooks for vendor analytics page
 */
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services';
import type {
  RevenueData,
  SalesPipelineData,
  TopPerformer,
  ConversionFunnelData,
  RecentActivity,
} from '@/types';

/**
 * Hook to fetch revenue chart data
 */
export const useRevenueChart = () => {
  return useQuery<RevenueData>({
    queryKey: ['analytics', 'revenue-chart'],
    queryFn: () => analyticsService.getRevenueChartData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch sales pipeline data
 */
export const useSalesPipeline = () => {
  return useQuery<SalesPipelineData>({
    queryKey: ['analytics', 'sales-pipeline'],
    queryFn: () => analyticsService.getSalesPipeline(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch top performers
 */
export const useTopPerformers = (metric: 'revenue' | 'deals' | 'win_rate' = 'revenue', limit: number = 5) => {
  return useQuery<TopPerformer[]>({
    queryKey: ['analytics', 'top-performers', metric, limit],
    queryFn: () => analyticsService.getTopPerformers(metric, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch conversion funnel data
 */
export const useConversionFunnel = () => {
  return useQuery<ConversionFunnelData>({
    queryKey: ['analytics', 'conversion-funnel'],
    queryFn: () => analyticsService.getSalesFunnel(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch recent activities
 */
export const useRecentActivities = (limit: number = 6) => {
  return useQuery<RecentActivity[]>({
    queryKey: ['analytics', 'recent-activities', limit],
    queryFn: () => analyticsService.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for activities)
  });
};

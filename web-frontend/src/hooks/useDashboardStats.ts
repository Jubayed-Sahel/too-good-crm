/**
 * Dashboard statistics hook
 * 
 * Note: Analytics page has been removed. This hook now returns
 * basic stats calculated from individual resource endpoints.
 */
import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { customerService, leadService, dealService } from '@/services';
import type { DashboardStats } from '@/types';

export const useDashboardStats = () => {
  const { activeOrganizationId, isLoading: profileLoading } = useProfile();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    // Don't fetch if profile is still loading
    if (profileLoading) {
      return;
    }

    // If no organization ID, set loading to false and return
    if (!activeOrganizationId) {
      console.warn('[useDashboardStats] No active organization ID, skipping stats fetch');
      setIsLoading(false);
      setStats(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch basic stats from individual services
      const [customersData, leadsData, dealsData] = await Promise.all([
        customerService.getCustomers().catch(() => ({ results: [] })),
        leadService.getLeads().catch(() => ({ results: [] })),
        dealService.getDeals().catch(() => ({ results: [] })),
      ]);

      const customers = Array.isArray(customersData) ? customersData : customersData.results || [];
      const leads = Array.isArray(leadsData) ? leadsData : leadsData.results || [];
      const deals = Array.isArray(dealsData) ? dealsData : dealsData.results || [];

      // Calculate basic stats
      const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
      const qualifiedLeads = leads.filter((l: any) => l.status === 'qualified').length;
      const wonDeals = deals.filter((d: any) => d.is_won).length;
      const activeDeals = deals.filter((d: any) => !d.is_closed).length;
      
      const totalRevenue = deals
        .filter((d: any) => d.is_won)
        .reduce((sum: number, d: any) => sum + (parseFloat(d.value) || 0), 0);
      
      const pipelineValue = deals
        .filter((d: any) => !d.is_closed)
        .reduce((sum: number, d: any) => sum + (parseFloat(d.value) || 0), 0);

      const data: DashboardStats = {
        customers: {
          total: customers.length,
          active: activeCustomers,
          growth: 0, // Growth calculation requires historical data
        },
        leads: {
          total: leads.length,
          qualified: qualifiedLeads,
          conversion_rate: leads.length > 0 ? (qualifiedLeads / leads.length) * 100 : 0,
        },
        deals: {
          total: deals.length,
          active: activeDeals,
          won: wonDeals,
          win_rate: deals.length > 0 ? (wonDeals / deals.length) * 100 : 0,
        },
        revenue: {
          total: totalRevenue,
          pipeline_value: pipelineValue,
          expected: pipelineValue * 0.5, // Simple estimation
        },
      };

      setStats(data);
    } catch (err) {
      console.error('[useDashboardStats] Failed to fetch dashboard stats:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for profile to load before attempting to fetch stats
    if (!profileLoading) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganizationId, profileLoading]);

  return {
    stats,
    isLoading: isLoading || profileLoading,
    error,
    refetch: fetchStats,
  };
};

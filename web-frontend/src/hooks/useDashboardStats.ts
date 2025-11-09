/**
 * Dashboard statistics hook
 */
import { useState, useEffect } from 'react';
import { analyticsService } from '@/services';
import { useProfile } from '@/contexts/ProfileContext';
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
      const data = await analyticsService.getDashboardStats({ organization: activeOrganizationId });
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

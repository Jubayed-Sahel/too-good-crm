/**
 * Deals data hook
 */
import { useState, useEffect } from 'react';
import { dealService, type DealCreateData } from '@/services';
import { useProfile } from '@/contexts/ProfileContext';
import type { Deal, PaginatedResponse } from '@/types';

export const useDeals = (params?: Record<string, any>) => {
  const { activeOrganizationId } = useProfile();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Deal>, 'results'> | null>(null);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Always include organization filter if available
      const filters = {
        ...params,
        ...(activeOrganizationId && { organization: activeOrganizationId }),
      };
      
      const response = await dealService.getDeals(filters);
      setDeals(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganizationId) {
      fetchDeals();
    }
  }, [JSON.stringify(params), activeOrganizationId]);

  const createDeal = async (data: DealCreateData) => {
    try {
      const newDeal = await dealService.createDeal(data);
      setDeals((prev) => [newDeal, ...prev]);
      return newDeal;
    } catch (err) {
      throw err;
    }
  };

  const updateDeal = async (id: number, data: Partial<DealCreateData>) => {
    try {
      const updated = await dealService.updateDeal(id, data);
      setDeals((prev) => prev.map((deal) => (deal.id === id ? updated : deal)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteDeal = async (id: number) => {
    try {
      await dealService.deleteDeal(id);
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    deals,
    isLoading,
    error,
    pagination,
    refetch: fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
  };
};

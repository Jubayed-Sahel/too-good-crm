/**
 * Sales Page hook for pipeline management
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealService, type DealStats, type Pipeline } from '@/services';

/**
 * Hook to manage sales pipeline page state and data
 */
export const useSalesPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  // Fetch deals
  const {
    data: dealsData,
    isLoading: dealsLoading,
    error: dealsError,
  } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealService.getDeals(),
  });

  // Fetch pipeline stats
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<DealStats>({
    queryKey: ['deals', 'stats'],
    queryFn: () => dealService.getStats(),
  });

  // Fetch pipelines (to get stages)
  const {
    data: pipelines,
    isLoading: pipelinesLoading,
  } = useQuery<Pipeline[]>({
    queryKey: ['pipelines'],
    queryFn: () => dealService.getPipelines(),
  });

  // Move deal to different stage mutation
  const moveDealMutation = useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: number; stageId: number }) =>
      dealService.moveStage(dealId, { stage: stageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
    },
  });

  const deals = dealsData?.results || [];
  const isLoading = dealsLoading || statsLoading || pipelinesLoading;

  // Get unique owners for filter
  const owners = useMemo(() => {
    const uniqueOwners = Array.from(
      new Set(deals.map(d => d.assigned_to_name).filter(Boolean))
    );
    return uniqueOwners.sort();
  }, [deals]);

  // Filter deals based on search and filters
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.customer_name && deal.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || deal.assigned_to_name === ownerFilter;
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesOwner && matchesStage;
    });
  }, [deals, searchQuery, ownerFilter, stageFilter]);

  // Group deals by stage
  const getStageDeals = (stageName: string) => {
    return filteredDeals.filter(deal => deal.stage === stageName);
  };

  // Calculate stage value
  const getStageValue = (stageName: string) => {
    const stageDeals = getStageDeals(stageName);
    return stageDeals.reduce((sum, deal) => {
      const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
      return sum + (value || 0);
    }, 0);
  };

  // Move deal to different stage
  const moveDeal = async (dealId: number, newStageId: number) => {
    try {
      await moveDealMutation.mutateAsync({ dealId, stageId: newStageId });
    } catch (error) {
      console.error('Failed to move deal:', error);
      throw error;
    }
  };

  // Get pipeline stages (from first pipeline or default stages)
  const defaultPipeline = pipelines?.find(p => p.is_default) || pipelines?.[0];
  const pipelineStages = defaultPipeline?.stages || [];

  return {
    // Data
    deals: filteredDeals,
    allDeals: deals,
    stats: stats || {
      total_deals: 0,
      total_value: 0,
      expected_revenue: 0,
      won: 0,
      lost: 0,
      open: 0,
      by_stage: [],
      by_priority: { low: 0, medium: 0, high: 0, urgent: 0 },
    },
    owners,
    pipelineStages,
    defaultPipeline,

    // Loading states
    isLoading,
    dealsError,

    // Filters
    searchQuery,
    setSearchQuery,
    ownerFilter,
    setOwnerFilter,
    stageFilter,
    setStageFilter,

    // Actions
    getStageDeals,
    getStageValue,
    moveDeal,
    isMoving: moveDealMutation.isPending,
  };
};

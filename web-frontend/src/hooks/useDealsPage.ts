/**
 * Custom hook for Deals Page business logic
 * Handles state management, filtering, and data transformation
 */
import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Deal } from '@/types';

interface DealsStats {
  total: number;
  active: number;
  won: number;
  totalValue: number;
}

export interface MappedDeal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdDate: string;
}

interface UseDealsPageReturn {
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stageFilter: string;
  setStageFilter: (stage: string) => void;
  
  // Data
  filteredDeals: Deal[];
  mappedDeals: MappedDeal[];
  stats: DealsStats;
  
  // Dialog state
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  
  // Utilities
  handleOpenNewDeal: () => void;
}

export const useDealsPage = (deals: Deal[]): UseDealsPageReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handle opening new deal dialog from route state
  useEffect(() => {
    if (location.state?.openNewDeal) {
      setIsCreateDialogOpen(true);
      // Clear the state so dialog doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Filter deals based on search and stage
  const filteredDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];
    
    return deals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesStage =
        stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [deals, searchQuery, stageFilter]);

  // Calculate statistics
  const stats = useMemo((): DealsStats => {
    if (!deals || deals.length === 0) {
      return { total: 0, active: 0, won: 0, totalValue: 0 };
    }

    const total = deals.length;
    const active = deals.filter(
      (d) => !['closed-won', 'closed-lost'].includes(d.stage || '')
    ).length;
    const won = deals.filter((d) => d.stage === 'closed-won').length;
    const totalValue = deals.reduce((sum, d) => {
      const value = typeof d.value === 'string' ? parseFloat(d.value) : d.value;
      if (d.stage === 'closed-won') return sum + value;
      return sum + (value * (d.probability || 0)) / 100;
    }, 0);

    return { total, active, won, totalValue };
  }, [deals]);

  // Map API deals to component format
  const mappedDeals = useMemo((): MappedDeal[] => {
    if (!deals || deals.length === 0) return [];
    
    return filteredDeals.map((deal) => ({
      id: deal.id.toString(),
      title: deal.title,
      customer: deal.customer_name || 'Unknown Customer',
      value: typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value,
      stage: deal.stage as 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
      probability: deal.probability || 0,
      expectedCloseDate: deal.expected_close_date || deal.created_at,
      owner: deal.assigned_to_name || 'Unassigned',
      createdDate: deal.created_at,
    }));
  }, [deals, filteredDeals]);

  const handleOpenNewDeal = () => {
    setIsCreateDialogOpen(true);
  };

  return {
    // Filters
    searchQuery,
    setSearchQuery,
    stageFilter,
    setStageFilter,
    
    // Data
    filteredDeals,
    mappedDeals,
    stats,
    
    // Dialog state
    isCreateDialogOpen,
    isEditDialogOpen,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    
    // Utilities
    handleOpenNewDeal,
  };
};

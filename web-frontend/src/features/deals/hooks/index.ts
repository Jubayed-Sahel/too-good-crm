/**
 * Deals Feature - Hooks
 * Barrel export for all deal-related hooks
 */

export { useDeals } from './useDeals';
export { useDealsPage } from './useDealsPage';
export { useDealActions } from './useDealActions';
export { 
  useCreateDeal, 
  useUpdateDeal, 
  useDeleteDeal,
  useMoveDealToStage,
  useMarkDealWon,
  useMarkDealLost,
  useReopenDeal
} from './useDealMutations';

// Re-export types if any
export type * from './useDealsPage';
export type * from './useDealActions';


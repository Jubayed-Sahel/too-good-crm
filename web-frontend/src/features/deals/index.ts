/**
 * Deals Feature - Public API
 * 
 * This file exports all public components, hooks, and utilities
 * from the deals feature module.
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export { dealService } from './services/deal.service';
export type { 
  DealCreateData, 
  DealFilters, 
  DealStats, 
  Pipeline, 
  PipelineStage,
  MoveStageData 
} from './services/deal.service';

// Schemas
export * from './schemas/deal.schema';

// Pages
export { default as SalesPage } from './pages/SalesPage';
export { default as DealDetailPage } from './pages/DealDetailPage';
export { default as EditDealPage } from './pages/EditDealPage';


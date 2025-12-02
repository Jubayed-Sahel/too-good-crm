/**
 * Export all custom hooks
 */

// Core hooks
export { useAuth } from './useAuth';
// Customer hooks - RE-EXPORTED from features/customers (MIGRATED)
export { 
  useCustomers, 
  useCustomer,
  useCustomersPage,
  useCustomerActions,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useActivateCustomer,
  useDeactivateCustomer,
} from '../features/customers';
// Deal hooks - RE-EXPORTED from features/deals (MIGRATED)
export {
  useDeals,
  useDealsPage,
  useDealActions,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useMoveDealToStage,
  useMarkDealWon,
  useMarkDealLost,
  useReopenDeal
} from '../features/deals';
export { useDashboardStats } from './useDashboardStats';
// Employee hooks - RE-EXPORTED from features/employees (MIGRATED)
export * from '../features/employees/hooks';
// Lead hooks - RE-EXPORTED from features/leads (MIGRATED)
export * from '../features/leads/hooks';
export * from './useSalesPage';

// Client/Vendor hooks
// Vendor hooks - RE-EXPORTED from features/vendors (MIGRATED - structure only)
export * from '../features/vendors/hooks';
// Order hooks - RE-EXPORTED from features/orders (MIGRATED)
export * from '../features/orders/hooks';
// Payment hooks - RE-EXPORTED from features/payments (MIGRATED)
export * from '../features/payments/hooks';
// Issue hooks - RE-EXPORTED from features/issues (MIGRATED)
export * from '../features/issues/hooks';

// Page-specific hooks (deals hooks moved above)

// React Query mutations - Employee (moved to features/employees re-export above)

// React Query mutations - Lead (moved to features/leads re-export above)

// React Query mutations - Deal (moved to features/deals re-export above)

// Multi-tenancy & RBAC hooks
export * from './useOrganization';
export * from './useRBAC';
export * from './useUser';
export { usePermissionActions } from './usePermissionActions';
export type { PermissionActions } from './usePermissionActions';

// AI & Automation hooks
// useGemini - RE-EXPORTED from features/messages (MIGRATED)
// Messages hooks - RE-EXPORTED from features/messages (MIGRATED)
export * from '../features/messages/hooks';
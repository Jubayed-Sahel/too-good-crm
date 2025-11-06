/**
 * Export all custom hooks
 */

// Core hooks
export { useAuth } from './useAuth';
export { useCustomers } from './useCustomers';
export { useDeals } from './useDeals';
export { useDashboardStats } from './useDashboardStats';
export { useEmployees } from './useEmployees';
export * from './useLeads';
export * from './useAnalytics';
export * from './useSalesPage';

// Page-specific hooks
export { useDealsPage } from './useDealsPage';
export { useDealActions } from './useDealActions';
export { useCustomersPage } from './useCustomersPage';
export { useCustomerActions } from './useCustomerActions';

// Multi-tenancy & RBAC hooks
export * from './useOrganization';
export * from './useRBAC';
export * from './useUser';

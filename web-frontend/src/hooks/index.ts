/**
 * Export all custom hooks
 */
export { useAuth } from './useAuth';
export { useCustomers } from './useCustomers';
export { useDeals } from './useDeals';
export { useDashboardStats } from './useDashboardStats';
export * from './useOrganization';
export * from './useRBAC';
export * from './useUser';
export * from './useLeads';

// Phase 1: Multi-tenancy, RBAC, User Settings
export * from './useOrganization';
export * from './useRBAC';
export * from './useUser';

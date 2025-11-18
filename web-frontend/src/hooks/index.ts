/**
 * Export all custom hooks
 */

// Core hooks
export { useAuth } from './useAuth';
export { useCustomers, useCustomer } from './useCustomers';
export { useDeals } from './useDeals';
export { useDashboardStats } from './useDashboardStats';
export { useEmployees } from './useEmployees';
export * from './useLeads';
export * from './useAnalytics';
export * from './useSalesPage';

// Client/Vendor hooks
export * from './useVendors';
export * from './useOrders';
export * from './usePayments';
export * from './useIssues';

// Page-specific hooks
export { useDealsPage } from './useDealsPage';
export { useDealActions } from './useDealActions';
export { useCustomersPage } from './useCustomersPage';
export { useCustomerActions } from './useCustomerActions';

// React Query mutations - Customer
export {
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useActivateCustomer,
  useDeactivateCustomer,
} from './useCustomerMutations';

// React Query mutations - Employee
export {
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useInviteEmployee,
  useTerminateEmployee,
  useActivateEmployee as useActivateEmployeeMutation,
  useDeactivateEmployee as useDeactivateEmployeeMutation,
} from './useEmployeeMutations';

// React Query mutations - Lead
export {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useConvertLeadToDeal,
  useQualifyLead,
  useDisqualifyLead,
  useAssignLead,
  useUpdateLeadScore,
} from './useLeadMutations';

// React Query mutations - Deal
export {
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useMoveDealToStage,
  useMarkDealWon,
  useMarkDealLost,
  useReopenDeal,
} from './useDealMutations';

// Multi-tenancy & RBAC hooks
export * from './useOrganization';
export * from './useRBAC';
export * from './useUser';
export { usePermissionActions } from './usePermissionActions';
export type { PermissionActions } from './usePermissionActions';

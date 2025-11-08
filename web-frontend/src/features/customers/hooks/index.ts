/**
 * Customers Feature - Hooks
 * Barrel export for all customer-related hooks
 */

export { useCustomers } from './useCustomers';
export { useCustomersPage } from './useCustomersPage';
export { useCustomerActions } from './useCustomerActions';
export { 
  useCreateCustomer, 
  useUpdateCustomer, 
  useDeleteCustomer 
} from './useCustomerMutations';

// Re-export types
export type { MappedCustomer, CustomerStats } from './useCustomersPage';
export type { UseCustomerActionsProps, UseCustomerActionsReturn } from './useCustomerActions';

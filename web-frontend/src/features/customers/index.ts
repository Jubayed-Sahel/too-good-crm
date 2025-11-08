/**
 * Customers Feature Module
 * 
 * This barrel export provides a clean public API for the customers feature.
 * Import everything you need from '@features/customers' instead of deep imports.
 * 
 * @example
 * ```ts
 * import { CustomersPage, useCustomers, Customer } from '@features/customers';
 * ```
 */

// Components
export { default as CreateCustomerDialog } from './components/CreateCustomerDialog';
export { default as CustomerDetailModal } from './components/CustomerDetailModal';
export { default as CustomerFilters } from './components/CustomerFilters';
export { CustomersPageContent } from './components/CustomersPageContent';
export { CustomersPageLoading } from './components/CustomersPageLoading';
export { default as CustomerStats } from './components/CustomerStats';
export { default as CustomerTable } from './components/CustomerTable';

// Hooks
export * from './hooks/useCustomers';
export * from './hooks/useCustomersPage';
export * from './hooks/useCustomerActions';

// Pages
export { default as CustomersPage } from './pages/CustomersPage';
export { default as CustomerDetailPage } from './pages/CustomerDetailPage';
export { default as EditCustomerPage } from './pages/EditCustomerPage';

// Services
export * from './services/customer.service';

// Types
export type * from './types/customer.types';

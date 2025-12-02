/**
 * Customers Feature - Public API
 * 
 * This file exports all public components, hooks, and utilities
 * from the customers feature module.
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export { customerService } from './services/customer.service';

// Types
export * from './types/customer.types';

// Schemas
export * from './schemas/customer.schema';

// Pages
export { default as CustomersPage } from './pages/CustomersPage';
export { default as CustomerDetailPage } from './pages/CustomerDetailPage';
export { default as EditCustomerPage } from './pages/EditCustomerPage';

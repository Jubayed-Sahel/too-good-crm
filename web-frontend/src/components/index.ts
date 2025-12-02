/**
 * Central barrel export for all components
 * Organized by category for better maintainability
 */

// Authentication components
export * from './auth';

// Common components
export * from './common';

// Dashboard components
export * from './dashboard';

// Customer components - RE-EXPORTED from features/customers (MIGRATED)
export * from '../features/customers/components';

// Deal components - RE-EXPORTED from features/deals (MIGRATED)
export * from '../features/deals/components';

// Lead components - RE-EXPORTED from features/leads (MIGRATED)
export * from '../features/leads/components';

// Activity components - RE-EXPORTED from features/activities (MIGRATED)
export * from '../features/activities/components';

// Issue components - RE-EXPORTED from features/issues (MIGRATED)
export * from '../features/issues/components';

// Order components - RE-EXPORTED from features/orders (MIGRATED)
export * from '../features/orders/components';

// Payment components - RE-EXPORTED from features/payments (MIGRATED)
export * from '../features/payments/components';

// Vendor components - RE-EXPORTED from features/vendors (MIGRATED - structure only)
export * from '../features/vendors/components';

// Messages components - RE-EXPORTED from features/messages (MIGRATED)
export * from '../features/messages/components';

// Settings components
export * from './settings';

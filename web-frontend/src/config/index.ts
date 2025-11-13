/**
 * Central configuration exports
 * All application configuration and constants
 */

// API Configuration
export { default as API_CONFIG, buildQueryString, buildUrl } from './api.config';
export type { EndpointParams } from './api.config';

// Legacy constants (for backward compatibility)
export * from './constants';

// Enhanced Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: (id: number | string) => `/customers/${id}`,
  CUSTOMER_EDIT: (id: number | string) => `/customers/${id}/edit`,
  DEALS: '/deals',
  DEAL_DETAIL: (id: number | string) => `/deals/${id}`,
  DEAL_EDIT: (id: number | string) => `/deals/${id}/edit`,
  LEADS: '/leads',
  LEAD_DETAIL: (id: number | string) => `/leads/${id}`,
  LEAD_EDIT: (id: number | string) => `/leads/${id}/edit`,
  SALES: '/sales',
  ACTIVITIES: '/activities',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'chakra-ui-color-mode',
  ACCOUNT_MODE: 'accountMode',
} as const;

// Lead Options
export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
] as const;

export const LEAD_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
] as const;

// Account Modes
export const ACCOUNT_MODES = {
  ADMIN: 'admin',
  CLIENT: 'client',
} as const;

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
} as const;

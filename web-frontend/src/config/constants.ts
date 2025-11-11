/**
 * Application constants
 * 
 * Note: API configuration is in api.config.ts
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  DEALS: '/deals',
  ANALYTICS: '/analytics',
  EMPLOYEES: '/employees',
  SETTINGS: '/settings',
  
  // Employee Routes
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_TASKS: '/employee/tasks',
  EMPLOYEE_ACTIVITIES: '/employee/activities',
  EMPLOYEE_CUSTOMERS: '/employee/customers',
  EMPLOYEE_DEALS: '/employee/deals',
  EMPLOYEE_LEADS: '/employee/leads',
  EMPLOYEE_SETTINGS: '/employee/settings',
  
  // Customer/Client Routes
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_VENDORS: '/client/vendors',
  CLIENT_ORDERS: '/client/orders',
  CLIENT_PAYMENTS: '/client/payments',
  CLIENT_ISSUES: '/client/issues',
  CLIENT_ACTIVITIES: '/client/activities',
  CLIENT_SETTINGS: '/client/settings',
} as const;

// Customer Status Options
export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
  { value: 'inactive', label: 'Inactive' },
] as const;

// Deal Stage Options
export const DEAL_STAGE_OPTIONS = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Date Formats
export const DATE_FORMAT = 'MMM DD, YYYY';
export const DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

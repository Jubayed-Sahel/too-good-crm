/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    PROFILE: '/auth/profile/',
  },
  CUSTOMERS: {
    LIST: '/customers/',
    DETAIL: (id: number) => `/customers/${id}/`,
    STATS: '/customers/stats/',
    ADD_NOTE: (id: number) => `/customers/${id}/add_note/`,
  },
  DEALS: {
    LIST: '/deals/',
    DETAIL: (id: number) => `/deals/${id}/`,
    PIPELINE_STATS: '/deals/pipeline_stats/',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard/',
  },
} as const;

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
  SETTINGS: '/settings',
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

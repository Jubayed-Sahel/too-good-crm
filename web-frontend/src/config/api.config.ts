/**
 * API Configuration
 * Central configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  TIMEOUT: 30000, // 30 seconds

  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login/',
      LOGOUT: '/auth/logout/',
      REGISTER: '/users/',
      REFRESH: '/auth/refresh/',
      ME: '/users/me/',
      CHANGE_PASSWORD: '/auth/change-password/',
    },

    // Users
    USERS: {
      LIST: '/users/',
      DETAIL: (id: number | string) => `/users/${id}/`,
      UPDATE_PROFILE: '/users/update_profile/',
    },

    // Organizations
    ORGANIZATIONS: {
      LIST: '/organizations/',
      DETAIL: (id: number | string) => `/organizations/${id}/`,
      MY_ORGANIZATIONS: '/organizations/my_organizations/',
      MEMBERS: (id: number | string) => `/organizations/${id}/members/`,
      ADD_MEMBER: (id: number | string) => `/organizations/${id}/add_member/`,
    },

    // Customers
    CUSTOMERS: {
      LIST: '/customers/',
      DETAIL: (id: number | string) => `/customers/${id}/`,
      STATS: '/customers/stats/',
      ACTIVATE: (id: number | string) => `/customers/${id}/activate/`,
      DEACTIVATE: (id: number | string) => `/customers/${id}/deactivate/`,
      ADD_NOTE: (id: number | string) => `/customers/${id}/add_note/`,
      NOTES: (id: number | string) => `/customers/${id}/notes/`,
      ACTIVITIES: (id: number | string) => `/customers/${id}/activities/`,
    },

    // Leads
    LEADS: {
      LIST: '/leads/',
      DETAIL: (id: number | string) => `/leads/${id}/`,
      STATS: '/leads/stats/',
      CONVERT: (id: number | string) => `/leads/${id}/convert/`,
      QUALIFY: (id: number | string) => `/leads/${id}/qualify/`,
      DISQUALIFY: (id: number | string) => `/leads/${id}/disqualify/`,
      ACTIVITIES: (id: number | string) => `/leads/${id}/activities/`,
      ADD_ACTIVITY: (id: number | string) => `/leads/${id}/add_activity/`,
      UPDATE_SCORE: (id: number | string) => `/leads/${id}/update_score/`,
      ASSIGN: (id: number | string) => `/leads/${id}/assign/`,
    },

    // Deals
    DEALS: {
      LIST: '/deals/',
      DETAIL: (id: number | string) => `/deals/${id}/`,
      STATS: '/deals/stats/',
      MOVE_STAGE: (id: number | string) => `/deals/${id}/move_stage/`,
      MARK_WON: (id: number | string) => `/deals/${id}/mark_won/`,
      MARK_LOST: (id: number | string) => `/deals/${id}/mark_lost/`,
      REOPEN: (id: number | string) => `/deals/${id}/reopen/`,
    },

    // Pipelines
    PIPELINES: {
      LIST: '/pipelines/',
      DETAIL: (id: number | string) => `/pipelines/${id}/`,
      SET_DEFAULT: (id: number | string) => `/pipelines/${id}/set_default/`,
      STAGES: '/pipeline-stages/',
      STAGE_DETAIL: (id: number | string) => `/pipeline-stages/${id}/`,
    },

    // Employees
    EMPLOYEES: {
      LIST: '/employees/',
      DETAIL: (id: number | string) => `/employees/${id}/`,
      DEPARTMENTS: '/employees/departments/',
      TERMINATE: (id: number | string) => `/employees/${id}/terminate/`,
    },

    // Vendors
    VENDORS: {
      LIST: '/vendors/',
      DETAIL: (id: number | string) => `/vendors/${id}/`,
      TYPES: '/vendors/types/',
    },

    // RBAC - Roles
    ROLES: {
      LIST: '/roles/',
      DETAIL: (id: number | string) => `/roles/${id}/`,
      PERMISSIONS: (id: number | string) => `/roles/${id}/permissions/`,
      USERS: (id: number | string) => `/roles/${id}/users/`,
      ASSIGN_PERMISSION: (id: number | string) => `/roles/${id}/assign_permission/`,
      REMOVE_PERMISSION: (id: number | string) => `/roles/${id}/remove_permission/`,
      UPDATE_PERMISSIONS: (id: number | string) => `/roles/${id}/update_permissions/`,
    },

    // RBAC - Permissions
    PERMISSIONS: {
      LIST: '/permissions/',
      DETAIL: (id: number | string) => `/permissions/${id}/`,
      BY_RESOURCE: '/permissions/by_resource/',
      AVAILABLE_RESOURCES: '/permissions/available_resources/',
      AVAILABLE_ACTIONS: '/permissions/available_actions/',
    },

    // RBAC - User Roles
    USER_ROLES: {
      LIST: '/user-roles/',
      DETAIL: (id: number | string) => `/user-roles/${id}/`,
      MY_ROLES: '/user-roles/my_roles/',
      BY_ROLE: '/user-roles/by_role/',
      BY_USER: '/user-roles/by_user/',
      BULK_ASSIGN: '/user-roles/bulk_assign/',
      BULK_REMOVE: '/user-roles/bulk_remove/',
      TOGGLE_ACTIVE: '/user-roles/toggle_active/',
    },

    // Activities
    ACTIVITIES: {
      LIST: '/activities/',
      DETAIL: (id: number | string) => `/activities/${id}/`,
      STATS: '/activities/stats/',
    },

    // Issues
    ISSUES: {
      LIST: '/issues/',
      DETAIL: (id: number | string) => `/issues/${id}/`,
      STATS: '/issues/stats/',
      RESOLVE: (id: number | string) => `/issues/${id}/resolve/`,
      CLOSE: (id: number | string) => `/issues/${id}/close/`,
      REOPEN: (id: number | string) => `/issues/${id}/reopen/`,
    },

    // Orders
    ORDERS: {
      LIST: '/orders/',
      DETAIL: (id: number | string) => `/orders/${id}/`,
      STATS: '/orders/stats/',
      CANCEL: (id: number | string) => `/orders/${id}/cancel/`,
      COMPLETE: (id: number | string) => `/orders/${id}/complete/`,
      ITEMS: (id: number | string) => `/orders/${id}/items/`,
    },

    // Payments
    PAYMENTS: {
      LIST: '/payments/',
      DETAIL: (id: number | string) => `/payments/${id}/`,
      STATS: '/payments/stats/',
      CONFIRM: (id: number | string) => `/payments/${id}/confirm/`,
      REFUND: (id: number | string) => `/payments/${id}/refund/`,
    },

    // Notifications
    NOTIFICATIONS: {
      LIST: '/notification-preferences/',
      DETAIL: (id: number | string) => `/notification-preferences/${id}/`,
      MY_PREFERENCES: '/notification-preferences/my_preferences/',
    },

    // User Profiles
    USER_PROFILES: {
      LIST: '/user-profiles/',
      DETAIL: (id: number | string) => `/user-profiles/${id}/`,
      MY_PROFILES: '/user-profiles/my_profiles/',
      ACTIVATE: (id: number | string) => `/user-profiles/${id}/activate/`,
      DEACTIVATE: (id: number | string) => `/user-profiles/${id}/deactivate/`,
      SUSPEND: (id: number | string) => `/user-profiles/${id}/suspend/`,
    },

    // Employee Invitations
    EMPLOYEE_INVITATIONS: {
      LIST: '/employee-invitations/',
      DETAIL: (id: number | string) => `/employee-invitations/${id}/`,
      SEND: '/employee-invitations/send/',
      ACCEPT: (token: string) => `/employee-invitations/${token}/accept/`,
      DECLINE: (token: string) => `/employee-invitations/${token}/decline/`,
    },

    // Role Selection
    ROLE_SELECTION: {
      AVAILABLE_ROLES: '/auth/role-selection/available_roles/',
      SELECT_ROLE: '/auth/role-selection/select_role/',
      CURRENT_ROLE: '/auth/role-selection/current_role/',
    },

    // Analytics
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard/',
      SALES_FUNNEL: '/analytics/sales_funnel/',
      REVENUE_BY_PERIOD: '/analytics/revenue_by_period/',
      EMPLOYEE_PERFORMANCE: '/analytics/employee_performance/',
      TOP_PERFORMERS: '/analytics/top_performers/',
    },
  },

  // Query Parameters
  PARAMS: {
    PAGE: 'page',
    PAGE_SIZE: 'page_size',
    SEARCH: 'search',
    ORDERING: 'ordering',
    STATUS: 'status',
    ORGANIZATION: 'organization',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 25,
    MAX_PAGE_SIZE: 100,
  },

  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Type for endpoint parameters
export type EndpointParams = Record<string, string | number | boolean | undefined>;

/**
 * Build query string from parameters
 */
export const buildQueryString = (params: EndpointParams): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Build full URL with query parameters
 */
export const buildUrl = (endpoint: string, params?: EndpointParams): string => {
  const baseUrl = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
  return params ? `${baseUrl}${buildQueryString(params)}` : baseUrl;
};

export default API_CONFIG;

/**
 * API Configuration
 * Central configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  // Base URLs
  // Use environment variable or empty string for relative URLs
  // All endpoints already include the /api prefix
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 30000, // 30 seconds

  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login/',
      LOGOUT: '/api/auth/logout/',
      REGISTER: '/api/users/',
      REFRESH: '/api/auth/refresh/',
      ME: '/api/users/me/',
      CHANGE_PASSWORD: '/api/auth/change-password/',
    },

    // Role Selection
    ROLE_SELECTION: {
      AVAILABLE_ROLES: '/api/auth/role-selection/available_roles/',
      SELECT_ROLE: '/api/auth/role-selection/select_role/',
      CURRENT_ROLE: '/api/auth/role-selection/current_role/',
    },

    // Users
    USERS: {
      LIST: '/api/users/',
      DETAIL: (id: number | string) => `/api/users/${id}/`,
      UPDATE_PROFILE: '/api/users/update_profile/',
    },

    // Organizations
    ORGANIZATIONS: {
      LIST: '/api/organizations/',
      DETAIL: (id: number | string) => `/api/organizations/${id}/`,
      MY_ORGANIZATIONS: '/api/organizations/my_organizations/',
      MEMBERS: (id: number | string) => `/api/organizations/${id}/members/`,
      ADD_MEMBER: (id: number | string) => `/api/organizations/${id}/add_member/`,
    },

    // Customers
    CUSTOMERS: {
      LIST: '/api/customers/',
      DETAIL: (id: number | string) => `/api/customers/${id}/`,
      STATS: '/api/customers/stats/',
      ACTIVATE: (id: number | string) => `/api/customers/${id}/activate/`,
      DEACTIVATE: (id: number | string) => `/api/customers/${id}/deactivate/`,
      ADD_NOTE: (id: number | string) => `/api/customers/${id}/add_note/`,
      NOTES: (id: number | string) => `/api/customers/${id}/notes/`,
      ACTIVITIES: (id: number | string) => `/api/customers/${id}/activities/`,
    },

    // Leads
    LEADS: {
      LIST: '/api/leads/',
      DETAIL: (id: number | string) => `/api/leads/${id}/`,
      STATS: '/api/leads/stats/',
      CONVERT: (id: number | string) => `/api/leads/${id}/convert/`,
      CONVERT_TO_DEAL: (id: number | string) => `/api/leads/${id}/convert_to_deal/`,
      QUALIFY: (id: number | string) => `/api/leads/${id}/qualify/`,
      DISQUALIFY: (id: number | string) => `/api/leads/${id}/disqualify/`,
      ACTIVITIES: (id: number | string) => `/api/leads/${id}/activities/`,
      ADD_ACTIVITY: (id: number | string) => `/api/leads/${id}/add_activity/`,
      UPDATE_SCORE: (id: number | string) => `/api/leads/${id}/update_score/`,
      ASSIGN: (id: number | string) => `/api/leads/${id}/assign/`,
    },

    // Deals
    DEALS: {
      LIST: '/api/deals/',
      DETAIL: (id: number | string) => `/api/deals/${id}/`,
      STATS: '/api/deals/stats/',
      MOVE_STAGE: (id: number | string) => `/api/deals/${id}/move_stage/`,
      MARK_WON: (id: number | string) => `/api/deals/${id}/mark_won/`,
      MARK_LOST: (id: number | string) => `/api/deals/${id}/mark_lost/`,
      REOPEN: (id: number | string) => `/api/deals/${id}/reopen/`,
    },

    // Pipelines
    PIPELINES: {
      LIST: '/api/pipelines/',
      DETAIL: (id: number | string) => `/api/pipelines/${id}/`,
      SET_DEFAULT: (id: number | string) => `/api/pipelines/${id}/set_default/`,
      STAGES: '/api/pipeline-stages/',
      STAGE_DETAIL: (id: number | string) => `/api/pipeline-stages/${id}/`,
    },

    // Employees
    EMPLOYEES: {
      LIST: '/api/employees/',
      DETAIL: (id: number | string) => `/api/employees/${id}/`,
      INVITE: '/api/employees/invite/',
      DEPARTMENTS: '/api/employees/departments/',
      TERMINATE: (id: number | string) => `/api/employees/${id}/terminate/`,
    },

    // Vendors
    VENDORS: {
      LIST: '/api/vendors/',
      DETAIL: (id: number | string) => `/api/vendors/${id}/`,
      TYPES: '/api/vendors/types/',
      STATS: '/api/vendors/stats/',
    },

    // RBAC - Roles
    ROLES: {
      LIST: '/api/roles/',
      DETAIL: (id: number | string) => `/api/roles/${id}/`,
      PERMISSIONS: (id: number | string) => `/api/roles/${id}/permissions/`,
      USERS: (id: number | string) => `/api/roles/${id}/users/`,
      ASSIGN_PERMISSION: (id: number | string) => `/api/roles/${id}/assign_permission/`,
      REMOVE_PERMISSION: (id: number | string) => `/api/roles/${id}/remove_permission/`,
      UPDATE_PERMISSIONS: (id: number | string) => `/api/roles/${id}/update_permissions/`,
      ENSURE_ALL_HAVE_PERMISSIONS: '/api/roles/ensure_all_roles_have_permissions/',
    },

    // RBAC - Permissions
    PERMISSIONS: {
      LIST: '/api/permissions/',
      DETAIL: (id: number | string) => `/api/permissions/${id}/`,
      BY_RESOURCE: '/api/permissions/by_resource/',
      AVAILABLE_RESOURCES: '/api/permissions/available_resources/',
      AVAILABLE_ACTIONS: '/api/permissions/available_actions/',
    },

    // RBAC - User Roles
    USER_ROLES: {
      BASE: '/api/user-roles',
      LIST: '/api/user-roles/',
      DETAIL: (id: number | string) => `/api/user-roles/${id}/`,
      MY_ROLES: '/api/user-roles/my_roles/',
      BY_ROLE: '/api/user-roles/by_role/',
      BY_USER: '/api/user-roles/by_user/',
      BULK_ASSIGN: '/api/user-roles/bulk_assign/',
      BULK_REMOVE: '/api/user-roles/bulk_remove/',
      TOGGLE_ACTIVE: '/api/user-roles/toggle_active/',
      USER_PERMISSIONS: '/api/user-roles/user_permissions/',
    },

    // Activities
    ACTIVITIES: {
      LIST: '/api/activities/',
      DETAIL: (id: number | string) => `/api/activities/${id}/`,
      STATS: '/api/activities/stats/',
    },

    // Issues
    ISSUES: {
      LIST: '/api/issues/',
      DETAIL: (id: number | string) => `/api/issues/${id}/`,
      STATS: '/api/issues/stats/',
      RESOLVE: (id: number | string) => `/api/issues/${id}/resolve/`,
      CLOSE: (id: number | string) => `/api/issues/${id}/close/`,
      REOPEN: (id: number | string) => `/api/issues/${id}/reopen/`,
    },

    // Orders
    ORDERS: {
      LIST: '/api/orders/',
      DETAIL: (id: number | string) => `/api/orders/${id}/`,
      STATS: '/api/orders/stats/',
      CANCEL: (id: number | string) => `/api/orders/${id}/cancel/`,
      COMPLETE: (id: number | string) => `/api/orders/${id}/complete/`,
      ITEMS: (id: number | string) => `/api/orders/${id}/items/`,
    },

    // Payments
    PAYMENTS: {
      LIST: '/api/payments/',
      DETAIL: (id: number | string) => `/api/payments/${id}/`,
      STATS: '/api/payments/stats/',
      CONFIRM: (id: number | string) => `/api/payments/${id}/confirm/`,
      REFUND: (id: number | string) => `/api/payments/${id}/refund/`,
    },

    // Notifications
    NOTIFICATIONS: {
      LIST: '/api/notification-preferences/',
      DETAIL: (id: number | string) => `/api/notification-preferences/${id}/`,
      MY_PREFERENCES: '/api/notification-preferences/my_preferences/',
    },

    // User Profiles
    USER_PROFILES: {
      LIST: '/api/user-profiles/',
      DETAIL: (id: number | string) => `/api/user-profiles/${id}/`,
      MY_PROFILES: '/api/user-profiles/my_profiles/',
      ACTIVATE: (id: number | string) => `/api/user-profiles/${id}/activate/`,
      DEACTIVATE: (id: number | string) => `/api/user-profiles/${id}/deactivate/`,
      SUSPEND: (id: number | string) => `/api/user-profiles/${id}/suspend/`,
    },

    // Employee Invitations
    EMPLOYEE_INVITATIONS: {
      LIST: '/api/employee-invitations/',
      DETAIL: (id: number | string) => `/api/employee-invitations/${id}/`,
      SEND: '/api/employee-invitations/send/',
      ACCEPT: (token: string) => `/api/employee-invitations/${token}/accept/`,
      DECLINE: (token: string) => `/api/employee-invitations/${token}/decline/`,
    },

    // Analytics
    ANALYTICS: {
      DASHBOARD: '/api/analytics/dashboard/',
      SALES_FUNNEL: '/api/analytics/sales_funnel/',
      REVENUE_BY_PERIOD: '/api/analytics/revenue_by_period/',
      EMPLOYEE_PERFORMANCE: '/api/analytics/employee_performance/',
      TOP_PERFORMERS: '/api/analytics/top_performers/',
    },

    // Jitsi Video Calls - COMMENTED OUT
    // JITSI: {
    //   BASE: '',
    //   CALLS: '/api/jitsi-calls/',
    //   CALL_DETAIL: (id: number | string) => `/api/jitsi-calls/${id}/`,
    //   INITIATE_CALL: '/api/jitsi-calls/initiate_call/',
    //   UPDATE_CALL_STATUS: (id: number | string) => `/api/jitsi-calls/${id}/update_status/`,
    //   ACTIVE_CALLS: '/api/jitsi-calls/active_calls/',
    //   MY_ACTIVE_CALL: '/api/jitsi-calls/my_active_call/',
    //   USER_PRESENCE: '/api/user-presence/',
    //   ONLINE_USERS: '/api/user-presence/online_users/',
    //   UPDATE_MY_STATUS: '/api/user-presence/update_my_status/',
    //   HEARTBEAT: '/api/user-presence/heartbeat/',
    // },
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

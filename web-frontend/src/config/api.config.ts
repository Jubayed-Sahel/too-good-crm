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
    },

    // Leads
    LEADS: {
      LIST: '/leads/',
      DETAIL: (id: number | string) => `/leads/${id}/`,
      STATS: '/leads/stats/',
      CONVERT: (id: number | string) => `/leads/${id}/convert/`,
      QUALIFY: (id: number | string) => `/leads/${id}/qualify/`,
      DISQUALIFY: (id: number | string) => `/leads/${id}/disqualify/`,
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

    // RBAC
    RBAC: {
      ROLES: '/roles/',
      ROLE_DETAIL: (id: number | string) => `/roles/${id}/`,
      PERMISSIONS: '/permissions/',
      PERMISSION_DETAIL: (id: number | string) => `/permissions/${id}/`,
      MY_ROLES: '/user-roles/my_roles/',
      ASSIGN_PERMISSION: (roleId: number | string) => `/roles/${roleId}/assign_permission/`,
      REMOVE_PERMISSION: (roleId: number | string) => `/roles/${roleId}/remove_permission/`,
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

/**
 * Enhanced API Client
 * Axios-based HTTP client with interceptors, error handling, and auth
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api.config';

// Response type for API errors
export interface APIError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Error response type
interface ErrorResponse {
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
  details?: Record<string, string[]>;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and transform responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh/`, {
          refresh: refreshToken
        });

        const { access, refresh } = response.data;

        // Store new tokens
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth data and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Permission Denied');
      // You can show a toast notification here
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('❌ Resource Not Found');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('❌ Server Error');
      // You can show a toast notification here
    }

    // Transform error to APIError format
    const apiError: APIError = {
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 0,
      errors: error.response?.data?.errors || error.response?.data?.details,
    };

    return Promise.reject(apiError);
  }
);

/**
 * API Client Methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get<T>(url, config).then(res => res.data);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post<T>(url, data, config).then(res => res.data);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put<T>(url, data, config).then(res => res.data);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch<T>(url, data, config).then(res => res.data);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete<T>(url, config).then(res => res.data);
  },

  /**
   * Request with full response (for pagination, headers, etc.)
   */
  request: <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.request<T>(config);
  },
};

export default api;

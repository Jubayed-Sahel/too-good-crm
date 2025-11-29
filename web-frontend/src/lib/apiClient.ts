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
    // Try JWT access token first (new), fallback to legacy token
    const jwtToken = localStorage.getItem('accessToken');
    const legacyToken = localStorage.getItem('authToken');
    
    if (jwtToken) {
      // Use JWT with Bearer authentication (new standard)
      config.headers.Authorization = `Bearer ${jwtToken}`;
    } else if (legacyToken) {
      // Fallback to legacy Token authentication
      config.headers.Authorization = `Token ${legacyToken}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        authType: jwtToken ? 'JWT (Bearer)' : legacyToken ? 'Token' : 'None',
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

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh JWT token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const response = await axios.post(
            `${API_CONFIG.BASE_URL || ''}/api/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          if (response.data.access) {
            // Store new access token
            localStorage.setItem('accessToken', response.data.access);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear all tokens and redirect to login
          console.error('❌ Token refresh failed:', refreshError);
        }
      }

      // Token refresh failed or no refresh token - clear auth data and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authToken'); // Legacy token
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
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
    // Check for detail field first (common in DRF ValidationError)
    const errorMessage = 
      error.response?.data?.detail || 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'An error occurred';
    
    // Extract field-specific errors from DRF response
    // DRF returns field errors at the root level: {name: ["error"], email: ["error"]}
    let fieldErrors: Record<string, string[]> = {};
    
    if (error.response?.data) {
      const responseData = error.response.data as any;
      
      // Check if data has 'errors' or 'details' wrapper
      if (responseData.errors) {
        fieldErrors = responseData.errors;
      } else if (responseData.details) {
        fieldErrors = responseData.details;
      } else {
        // Extract field-level errors directly from response (DRF format)
        // Skip non-field keys like 'detail', 'error', 'message'
        Object.keys(responseData).forEach(key => {
          if (!['detail', 'error', 'message'].includes(key) && Array.isArray(responseData[key])) {
            fieldErrors[key] = responseData[key];
          }
        });
      }
      
      // If we have a 'detail' string, add it as an error
      if (responseData.detail && typeof responseData.detail === 'string') {
        fieldErrors.detail = [responseData.detail];
      }
    }
    
    const apiError: APIError = {
      message: errorMessage,
      status: error.response?.status || 0,
      errors: fieldErrors,
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

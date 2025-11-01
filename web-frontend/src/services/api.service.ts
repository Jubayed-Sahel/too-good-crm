/**
 * Core API service with authentication and error handling
 */
import { API_BASE_URL, STORAGE_KEYS } from '@/config/constants';
import type { ApiError } from '@/types';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get default headers with authentication
   */
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: ApiError;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        detail: `HTTP Error ${response.status}: ${response.statusText}`,
      };
    }

    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }

    throw errorData;
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}

export const apiService = new ApiService();

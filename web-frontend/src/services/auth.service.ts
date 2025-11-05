/**
 * Authentication Service
 * Handles user authentication and session management
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
} as const;

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

interface RegisterResponse {
  token: string;
  user: User;
  message?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );

    // Store token and user
    this.setAuthData(response.token, response.user);

    return {
      token: response.token,
      user: response.user,
      message: response.message || 'Registration successful',
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Store token and user
    this.setAuthData(response.token, response.user);

    return {
      token: response.token,
      user: response.user,
      message: response.message || 'Login successful',
    };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();

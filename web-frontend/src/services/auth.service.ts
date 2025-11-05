/**
 * Authentication Service
 * Handles user authentication and session management
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterResponse {
  access: string;
  refresh: string;
  user: User;
  message?: string;
}

interface RefreshResponse {
  access: string;
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

    // Store tokens and user
    this.setAuthData(response.access, response.refresh, response.user);

    return {
      token: response.access,
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

    // Store tokens and user
    this.setAuthData(response.access, response.refresh, response.user);

    return {
      token: response.access,
      user: response.user,
      message: 'Login successful',
    };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
          refresh: refreshToken,
        });
      }
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<RefreshResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refresh: refreshToken }
    );

    // Update access token
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access);

    return response.access;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return api.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const user = await api.patch<User>(API_CONFIG.ENDPOINTS.AUTH.ME, data);
    
    // Update user in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return user;
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
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
  private setAuthData(accessToken: string, refreshToken: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();

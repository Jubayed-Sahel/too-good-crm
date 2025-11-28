/**
 * Authentication Service
 * Handles user authentication and session management
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { AuthResponse, LoginCredentials, RegisterData, User, UserProfile } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',  // Legacy token (backward compatibility)
  ACCESS_TOKEN: 'accessToken',  // JWT access token
  REFRESH_TOKEN: 'refreshToken',  // JWT refresh token
  USER: 'user',
} as const;

interface LoginResponse {
  // JWT response (new)
  access?: string;
  refresh?: string;
  token_type?: string;
  access_expires_in?: number;
  refresh_expires_in?: number;
  // Legacy response
  token?: string;
  legacy_token?: string;
  // Common
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

    // Process user data and store
    const processedUser = this.processUserData(response.user);
    this.setAuthData(response.token, processedUser);

    return {
      token: response.token,
      user: processedUser,
      message: response.message || 'Registration successful',
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Log request in development
      if (import.meta.env.DEV) {
        console.log('🔐 Login request:', {
          endpoint: API_CONFIG.ENDPOINTS.AUTH.LOGIN,
          baseUrl: API_CONFIG.BASE_URL,
          username: credentials.username,
          hasPassword: !!credentials.password,
        });
      }

      const response = await api.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Process user data and store
      const processedUser = this.processUserData(response.user);
      
      // Store JWT tokens (new) or legacy token
      if (response.access && response.refresh) {
        // JWT tokens
        this.setJWTAuthData(response.access, response.refresh, processedUser);
        
        // Also store legacy token for backward compatibility
        if (response.legacy_token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.legacy_token);
        }
        
        console.log('✅ JWT authentication successful');
      } else if (response.token) {
        // Legacy token only
        this.setAuthData(response.token, processedUser);
        console.log('✅ Legacy token authentication successful');
      }

      return {
        token: response.access || response.token || '',
        user: processedUser,
        message: response.message || 'Login successful',
      };
    } catch (error: any) {
      // Log error details in development
      if (import.meta.env.DEV) {
        console.error('🔐 Login error:', {
          error,
          errors: error.errors,
          message: error.message,
          status: error.status,
        });
      }
      throw error;
    }
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
   * Get auth token (tries JWT first, falls back to legacy)
   */
  getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) 
      || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  
  /**
   * Get JWT access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  
  /**
   * Get JWT refresh token
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
   * Refresh user data from API
   * Fetches the latest user data including updated profiles
   */
  async refreshUser(): Promise<User> {
    const response = await api.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
    
    // Process user data and update localStorage
    const processedUser = this.processUserData(response);
    this.updateUserData(processedUser);
    
    return processedUser;
  }

  /**
   * Update user data in localStorage without changing token
   */
  private updateUserData(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Process user data to add computed properties
   */
  private processUserData(user: User): User {
    // Find primary profile or first active profile
    const primaryProfile = user.profiles?.find((p: UserProfile) => p.is_primary && p.status === 'active') 
      || user.profiles?.find((p: UserProfile) => p.status === 'active');
    
    // Add computed properties
    (user as any).primaryProfile = primaryProfile;
    (user as any).primaryOrganizationId = primaryProfile?.organization;
    
    return user;
  }

  /**
   * Store JWT authentication data
   */
  private setJWTAuthData(accessToken: string, refreshToken: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
  
  /**
   * Store authentication data (legacy)
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();

/**
 * Authentication Service
 * Handles user authentication and session management
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { AuthResponse, LoginCredentials, RegisterData, User, UserProfile } from '@/types';

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
    const response = await api.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Process user data and store
    const processedUser = this.processUserData(response.user);
    this.setAuthData(response.token, processedUser);

    return {
      token: response.token,
      user: processedUser,
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

/**
 * Authentication service
 */
import { apiService } from './api.service';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/constants';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      false
    );

    // Store token and user
    this.setAuthData(response.token, response.user);

    return response;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      false
    );

    // Store token and user
    this.setAuthData(response.token, response.user);

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    return apiService.put(API_ENDPOINTS.AUTH.PROFILE, data);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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

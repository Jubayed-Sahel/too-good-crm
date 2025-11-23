/**
 * User Profile Service
 * Handles user profile and settings API calls
 */
import api from '@/lib/apiClient';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_image?: string;
  
  // Extended profile fields (stored in User model or as JSON)
  title?: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  
  // Security fields
  two_factor_enabled?: boolean;
  is_verified?: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  title?: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  active_sessions: ActiveSession[];
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

class UserProfileService {
  private readonly baseUrl = '/users';

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return api.get<UserProfile>(`${this.baseUrl}/me/`);
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return api.patch<UserProfile>(`${this.baseUrl}/update_profile/`, data);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return api.post<{ message: string }>(`${this.baseUrl}/change_password/`, data);
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<{ profile_image: string }> {
    const formData = new FormData();
    formData.append('profile_image', file);
    return api.post<{ profile_image: string }>(`${this.baseUrl}/upload_profile_picture/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const userProfileService = new UserProfileService();
export default userProfileService;

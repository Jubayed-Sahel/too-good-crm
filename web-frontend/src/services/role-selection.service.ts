/**
 * Role Selection Service
 * Handles role switching and profile management
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { UserProfile, User } from '@/types';

interface AvailableRolesResponse {
  profiles: UserProfile[];
  count: number;
}

interface SelectRoleResponse {
  message: string;
  user: User;
  active_profile: UserProfile;
}

interface CurrentRoleResponse {
  profile: UserProfile;
}

class RoleSelectionService {
  /**
   * Get all available roles/profiles for current user
   */
  async getAvailableRoles(): Promise<AvailableRolesResponse> {
    return api.get<AvailableRolesResponse>(API_CONFIG.ENDPOINTS.ROLE_SELECTION.AVAILABLE_ROLES);
  }

  /**
   * Select a specific role/profile
   */
  async selectRole(profileId: number): Promise<SelectRoleResponse> {
    return api.post<SelectRoleResponse>(API_CONFIG.ENDPOINTS.ROLE_SELECTION.SELECT_ROLE, {
      profile_id: profileId,
    });
  }

  /**
   * Get current active role/profile
   */
  async getCurrentRole(): Promise<CurrentRoleResponse> {
    return api.get<CurrentRoleResponse>(API_CONFIG.ENDPOINTS.ROLE_SELECTION.CURRENT_ROLE);
  }
}

export const roleSelectionService = new RoleSelectionService();

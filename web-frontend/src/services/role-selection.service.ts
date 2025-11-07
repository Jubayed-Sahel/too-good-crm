/**
 * Role Selection Service
 * Handles role switching and profile management
 */
import api from '@/lib/apiClient';
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
    return api.get<AvailableRolesResponse>('/auth/role-selection/available_roles/');
  }

  /**
   * Select a specific role/profile
   */
  async selectRole(profileId: number): Promise<SelectRoleResponse> {
    return api.post<SelectRoleResponse>('/auth/role-selection/select_role/', {
      profile_id: profileId,
    });
  }

  /**
   * Get current active role/profile
   */
  async getCurrentRole(): Promise<CurrentRoleResponse> {
    return api.get<CurrentRoleResponse>('/auth/role-selection/current_role/');
  }
}

export const roleSelectionService = new RoleSelectionService();

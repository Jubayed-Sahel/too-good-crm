/**
 * User Profile and Settings React Query Hooks
 * Updated to use only available userProfileService methods
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfileService } from '@/services';
import type { UpdateProfileData, ChangePasswordData } from '@/types';

/**
 * Query keys for user-related queries
 */
export const userKeys = {
  all: ['user'] as const,
  currentProfile: () => [...userKeys.all, 'currentProfile'] as const,
};

/**
 * Get current user profile
 * Uses the available getCurrentUser() method
 */
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: userKeys.currentProfile(),
    queryFn: () => userProfileService.getCurrentUser(),
  });
}

/**
 * Update profile mutation
 * Uses the available updateProfile(data) method
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      userProfileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
  });
}

/**
 * Upload profile picture mutation
 * Uses the available uploadProfilePicture(file) method
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      userProfileService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
  });
}

/**
 * Change password mutation
 * Uses the available changePassword(data) method
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) =>
      userProfileService.changePassword(data),
  });
}

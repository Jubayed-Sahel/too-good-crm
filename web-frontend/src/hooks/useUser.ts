/**
 * User Profile and Settings React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import type { UpdateProfileData, ChangePasswordData, UpdateSettingsData } from '@/types';

/**
 * Query keys for user-related queries
 */
export const userKeys = {
  all: ['user'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  settings: (userId: string) => [...userKeys.all, 'settings', userId] as const,
  sessions: (userId: string) => [...userKeys.all, 'sessions', userId] as const,
  currentProfile: () => [...userKeys.all, 'currentProfile'] as const,
  currentSettings: () => [...userKeys.all, 'currentSettings'] as const,
};

/**
 * Get user profile
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId,
  });
}

/**
 * Get current user profile
 */
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: userKeys.currentProfile(),
    queryFn: () => userService.getCurrentUser(),
  });
}

/**
 * Get user settings
 */
export function useUserSettings(userId: string) {
  return useQuery({
    queryKey: userKeys.settings(userId),
    queryFn: () => userService.getUserSettings(userId),
    enabled: !!userId,
  });
}

/**
 * Get current user settings
 */
export function useCurrentUserSettings() {
  return useQuery({
    queryKey: userKeys.currentSettings(),
    queryFn: () => userService.getCurrentUserSettings(),
  });
}

/**
 * Get user sessions
 */
export function useUserSessions(userId: string) {
  return useQuery({
    queryKey: userKeys.sessions(userId),
    queryFn: () => userService.getSessions(userId),
    enabled: !!userId,
  });
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileData }) =>
      userService.updateProfile(userId, data),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(updatedProfile.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
  });
}

/**
 * Upload avatar mutation
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      userService.uploadAvatar(userId, file),
    onSuccess: (_avatarUrl, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ChangePasswordData }) =>
      userService.changePassword(userId, data),
  });
}

/**
 * Update settings mutation
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateSettingsData }) =>
      userService.updateSettings(userId, data),
    onSuccess: (_updatedSettings, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentSettings() });
    },
  });
}

/**
 * Revoke session mutation
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) =>
      userService.revokeSession(userId, sessionId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions(variables.userId) });
    },
  });
}

/**
 * Revoke all sessions mutation
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.revokeAllSessions(userId),
    onSuccess: (_result, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions(userId) });
    },
  });
}

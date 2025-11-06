/**
 * Activity Service
 * API service for Activity-related operations
 */

import api from '@/lib/apiClient';
import type {
  Activity,
  CreateActivityData,
  UpdateActivityData,
  ActivityStats,
  ActivityFilters,
  PaginatedResponse,
} from '@/types';

export const activityService = {
  /**
   * Get all activities with optional filters
   */
  getAll: async (filters?: ActivityFilters): Promise<PaginatedResponse<Activity>> => {
    return api.get<PaginatedResponse<Activity>>('/activities/', { params: filters });
  },

  /**
   * Get single activity by ID
   */
  getById: async (id: number): Promise<Activity> => {
    return api.get<Activity>(`/activities/${id}/`);
  },

  /**
   * Create new activity
   */
  create: async (data: CreateActivityData): Promise<Activity> => {
    return api.post<Activity>('/activities/', data);
  },

  /**
   * Update existing activity
   */
  update: async (id: number, data: UpdateActivityData): Promise<Activity> => {
    return api.put<Activity>(`/activities/${id}/`, data);
  },

  /**
   * Partially update activity
   */
  partialUpdate: async (id: number, data: Partial<UpdateActivityData>): Promise<Activity> => {
    return api.patch<Activity>(`/activities/${id}/`, data);
  },

  /**
   * Delete activity
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/activities/${id}/`);
  },

  /**
   * Mark activity as completed
   */
  complete: async (id: number): Promise<Activity> => {
    return api.post<Activity>(`/activities/${id}/complete/`);
  },

  /**
   * Cancel activity
   */
  cancel: async (id: number): Promise<Activity> => {
    return api.post<Activity>(`/activities/${id}/cancel/`);
  },

  /**
   * Get activity statistics
   */
  getStats: async (): Promise<ActivityStats> => {
    return api.get<ActivityStats>('/activities/stats/');
  },

  /**
   * Get upcoming scheduled activities
   */
  getUpcoming: async (): Promise<Activity[]> => {
    return api.get<Activity[]>('/activities/upcoming/');
  },

  /**
   * Get overdue activities
   */
  getOverdue: async (): Promise<Activity[]> => {
    return api.get<Activity[]>('/activities/overdue/');
  },
};

// Legacy exports for backward compatibility (will be deprecated)
export const getActivities = async (filters?: ActivityFilters): Promise<Activity[]> => {
  const response = await activityService.getAll(filters);
  return response.results;
};

export const getActivity = async (id: number): Promise<Activity | undefined> => {
  try {
    return await activityService.getById(id);
  } catch {
    return undefined;
  }
};

export const createActivity = activityService.create;
export const deleteActivity = activityService.delete;
export const getActivityStats = activityService.getStats;

/**
 * Video Service
 * Handles all 8x8 Video (Jitsi) API calls for video calling functionality
 */

import apiClient from '../lib/apiClient';
import type {
  VideoCallSession,
  InitiateCallRequest,
  InitiateCallResponse,
  UpdateCallStatusRequest,
  UpdateCallStatusResponse,
  GetActiveCallResponse,
  SendHeartbeatResponse,
  GetOnlineUsersResponse,
} from '../types/video.types';

/**
 * Base URL for video call endpoints
 */
const JITSI_BASE_URL = '/api/jitsi-calls';

/**
 * Video Service
 * Manages video calling API interactions
 */
export const videoService = {
  /**
   * Initiate a video call to another user
   * @param recipientId - ID of the user to call
   * @param callType - Type of call (video or audio)
   * @returns Call session with JWT token for authentication
   */
  async initiateCall(
    recipientId: number,
    callType: 'video' | 'audio' = 'video'
  ): Promise<VideoCallSession> {
    const request: InitiateCallRequest = {
      recipient_id: recipientId,
      call_type: callType,
    };

    const response = await apiClient.post<InitiateCallResponse>(
      `${JITSI_BASE_URL}/initiate_call/`,
      request
    );

    return response.call_session;
  },

  /**
   * Initiate a call by looking up user by email
   * @param email - Email address of the user to call
   * @param callType - Type of call (video or audio)
   * @returns Call session with JWT token for authentication
   */
  async initiateCallByEmail(
    email: string,
    callType: 'video' | 'audio' = 'video'
  ): Promise<VideoCallSession> {
    const request = {
      recipient_email: email,
      call_type: callType,
    };

    const response = await apiClient.post<InitiateCallResponse>(
      `${JITSI_BASE_URL}/initiate_call_by_email/`,
      request
    );

    return response.call_session;
  },

  /**
   * Answer an incoming call
   * @param callId - ID of the call session
   * @returns Updated call session with JWT token
   */
  async answerCall(callId: number): Promise<VideoCallSession> {
    const request: UpdateCallStatusRequest = {
      action: 'answer',
    };

    const response = await apiClient.post<UpdateCallStatusResponse>(
      `${JITSI_BASE_URL}/${callId}/update_status/`,
      request
    );

    return response.call_session;
  },

  /**
   * Reject an incoming call
   * @param callId - ID of the call session
   * @returns Updated call session
   */
  async rejectCall(callId: number): Promise<VideoCallSession> {
    const request: UpdateCallStatusRequest = {
      action: 'reject',
    };

    const response = await apiClient.post<UpdateCallStatusResponse>(
      `${JITSI_BASE_URL}/${callId}/update_status/`,
      request
    );

    return response.call_session;
  },

  /**
   * End an active call
   * @param callId - ID of the call session
   * @returns Updated call session
   */
  async endCall(callId: number): Promise<VideoCallSession> {
    const request: UpdateCallStatusRequest = {
      action: 'end',
    };

    const response = await apiClient.post<UpdateCallStatusResponse>(
      `${JITSI_BASE_URL}/${callId}/update_status/`,
      request
    );

    return response.call_session;
  },

  /**
   * Get the current user's active or pending call
   * @returns Active call session or null if no active call
   */
  async getMyActiveCall(): Promise<VideoCallSession | null> {
    try {
      const response = await apiClient.get<VideoCallSession>(
        `${JITSI_BASE_URL}/my_active_call/`
      );

      // Backend returns the call session directly, or empty/null for 204 No Content
      // If response is empty/null/undefined, there's no active call
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        return null;
      }

      return response;
    } catch (error: any) {
      // Return null if no active call (404 Not Found)
      if (error.response?.status === 404) {
        return null;
      }
      // Also handle network errors gracefully
      if (!error.response) {
        console.warn('[VideoService] Network error checking for active call, assuming none');
        return null;
      }
      throw error;
    }
  },

  /**
   * Send heartbeat to mark user as online
   * @returns Success status
   */
  async sendHeartbeat(): Promise<void> {
    await apiClient.post<SendHeartbeatResponse>(
      `${JITSI_BASE_URL}/heartbeat/`
    );
  },

  /**
   * Get list of currently online users
   * @returns Array of online users
   */
  async getOnlineUsers(): Promise<GetOnlineUsersResponse> {
    const response = await apiClient.get<GetOnlineUsersResponse>(
      `${JITSI_BASE_URL}/online_users/`
    );

    return response;
  },

  /**
   * Get a specific call session by ID
   * @param callId - ID of the call session
   * @returns Call session details
   */
  async getCallSession(callId: number): Promise<VideoCallSession> {
    const response = await apiClient.get<VideoCallSession>(
      `${JITSI_BASE_URL}/${callId}/`
    );

    return response;
  },

  /**
   * Get call history (all calls - active, completed, missed, etc.)
   * @param filters - Optional filters (status, my_calls, etc.)
   * @returns Array of call sessions
   */
  async getCallHistory(filters?: { status?: string; my_calls?: boolean }): Promise<VideoCallSession[]> {
    try {
      console.log('[VideoService] Fetching call history with filters:', filters);
      const response = await apiClient.get<VideoCallSession[]>(
        `${JITSI_BASE_URL}/`,
        { params: filters }
      );

      console.log('[VideoService] Raw response:', response);
      console.log('[VideoService] Response type:', typeof response);
      console.log('[VideoService] Is array?', Array.isArray(response));
      console.log('[VideoService] Response keys:', response ? Object.keys(response) : 'null');
      console.log('[VideoService] Response as JSON:', JSON.stringify(response).substring(0, 500));

      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('[VideoService] Returning', response.length, 'calls (direct array)');
        return response;
      } else if (response && typeof response === 'object') {
        // Check for common pagination formats
        if ('results' in response && Array.isArray(response.results)) {
          console.log('[VideoService] Returning', response.results.length, 'calls (from results)');
          return response.results;
        } else if ('data' in response && Array.isArray(response.data)) {
          console.log('[VideoService] Returning', response.data.length, 'calls (from data)');
          return response.data;
        } else {
          // Response is an object but not paginated - might be a single item or error
          console.warn('[VideoService] Response is object but no array found:', response);
          return [];
        }
      } else {
        console.warn('[VideoService] Invalid response:', response);
        return [];
      }
    } catch (error) {
      console.error('[VideoService] Error fetching call history:', error);
      return [];
    }
  },
};

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
      const response = await apiClient.get<GetActiveCallResponse>(
        `${JITSI_BASE_URL}/my_active_call/`
      );

      return response.call || null;
    } catch (error: any) {
      // Return null if no active call (404)
      if (error.response?.status === 404) {
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
};

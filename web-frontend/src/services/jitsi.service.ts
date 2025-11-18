/**
 * Jitsi service for managing video/audio calls and user presence
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type {
  JitsiCallSession,
  UserPresence,
  OnlineUser,
  InitiateCallRequest,
  InitiateCallResponse,
  UpdateCallStatusRequest,
  UpdateCallStatusResponse,
  UpdatePresenceRequest,
  CallType,
} from '@/types/jitsi.types';

class JitsiService {
  /**
   * Get list of online users available for calls
   */
  async getOnlineUsers(): Promise<OnlineUser[]> {
    return api.get<OnlineUser[]>(
      API_CONFIG.ENDPOINTS.JITSI.ONLINE_USERS
    );
  }

  /**
   * Initiate a call to another user
   */
  async initiateCall(
    recipientId: number | null,
    callType: CallType = 'video'
  ): Promise<InitiateCallResponse> {
    const data: InitiateCallRequest = {
      recipient_id: recipientId,
      call_type: callType,
    };

    return api.post<InitiateCallResponse>(
      API_CONFIG.ENDPOINTS.JITSI.INITIATE_CALL,
      data
    );
  }

  /**
   * Answer an incoming call
   */
  async answerCall(callId: number): Promise<UpdateCallStatusResponse> {
    const data: UpdateCallStatusRequest = { action: 'answer' };
    return api.post<UpdateCallStatusResponse>(
      API_CONFIG.ENDPOINTS.JITSI.UPDATE_CALL_STATUS(callId),
      data
    );
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: number): Promise<UpdateCallStatusResponse> {
    const data: UpdateCallStatusRequest = { action: 'reject' };
    return api.post<UpdateCallStatusResponse>(
      API_CONFIG.ENDPOINTS.JITSI.UPDATE_CALL_STATUS(callId),
      data
    );
  }

  /**
   * End an active call
   */
  async endCall(callId: number): Promise<UpdateCallStatusResponse> {
    const data: UpdateCallStatusRequest = { action: 'end' };
    return api.post<UpdateCallStatusResponse>(
      API_CONFIG.ENDPOINTS.JITSI.UPDATE_CALL_STATUS(callId),
      data
    );
  }

  /**
   * Get all active calls
   */
  async getActiveCalls(): Promise<JitsiCallSession[]> {
    return api.get<JitsiCallSession[]>(
      API_CONFIG.ENDPOINTS.JITSI.ACTIVE_CALLS
    );
  }

  /**
   * Get current user's active call if any
   */
  async getMyActiveCall(): Promise<JitsiCallSession | null> {
    try {
      return await api.get<JitsiCallSession>(
        API_CONFIG.ENDPOINTS.JITSI.MY_ACTIVE_CALL
      );
    } catch (error: any) {
      // 204 No Content means no active call
      if (error.response?.status === 204) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a specific call session
   */
  async getCallSession(callId: number): Promise<JitsiCallSession> {
    return api.get<JitsiCallSession>(
      API_CONFIG.ENDPOINTS.JITSI.CALL_DETAIL(callId)
    );
  }

  /**
   * Update user presence status
   */
  async updatePresence(data: UpdatePresenceRequest): Promise<UserPresence> {
    return api.patch<UserPresence>(
      API_CONFIG.ENDPOINTS.JITSI.UPDATE_MY_STATUS,
      data
    );
  }

  /**
   * Send heartbeat to keep user online
   */
  async sendHeartbeat(): Promise<void> {
    await api.post(API_CONFIG.ENDPOINTS.JITSI.HEARTBEAT);
  }

  /**
   * Get user's current presence
   */
  async getMyPresence(): Promise<UserPresence> {
    return api.get<UserPresence>(
      API_CONFIG.ENDPOINTS.JITSI.USER_PRESENCE
    );
  }
}

export const jitsiService = new JitsiService();
export default jitsiService;

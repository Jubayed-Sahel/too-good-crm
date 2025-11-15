// JITSI IMPLEMENTATION COMMENTED OUT - NOT IN USE
/*
/**
 * Jitsi Video Call Service
 * Handles Jitsi Meet integration for in-app video/audio calls
 */
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';

export interface JitsiCallSession {
  id: number;
  session_id: string;
  room_name: string;
  call_type: 'audio' | 'video';
  status: 'pending' | 'ringing' | 'active' | 'completed' | 'missed' | 'rejected' | 'cancelled' | 'failed';
  initiator: number;
  initiator_name: string;
  recipient: number;
  recipient_name: string;
  participants: number[];
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  duration_formatted: string;
  is_active: boolean;
  participant_count: number;
  organization: number;
  recording_url: string | null;
  notes: string;
  jitsi_server: string;
  jitsi_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserPresence {
  user: number;
  username: string;
  full_name: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  is_online: boolean;
  is_available: boolean;
  last_seen: string;
  available_for_calls: boolean;
  status_message: string;
  current_call: number | null;
}

export interface OnlineUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  presence: UserPresence;
}

export interface InitiateCallRequest {
  recipient_id: number;
  call_type: 'audio' | 'video';
}

export interface InitiateCallResponse {
  message: string;
  call_session: JitsiCallSession;
}

export interface UpdateStatusRequest {
  action: 'answer' | 'reject' | 'end';
}

export interface UpdateStatusResponse {
  message: string;
  call_session: JitsiCallSession;
}

export interface UpdatePresenceRequest {
  status: 'online' | 'busy' | 'away' | 'offline';
  available_for_calls?: boolean;
  status_message?: string;
}

export interface UpdatePresenceResponse {
  message: string;
  presence: UserPresence;
}

class JitsiService {
  /**
   * Get list of online users available for calls
   */
  async getOnlineUsers(): Promise<OnlineUser[]> {
    const response = await api.get<OnlineUser[]>(
      API_CONFIG.ENDPOINTS.JITSI.ONLINE_USERS
    );
    return response;
  }

  /**
   * Get active call sessions
   */
  async getActiveCalls(): Promise<JitsiCallSession[]> {
    const response = await api.get<JitsiCallSession[]>(
      API_CONFIG.ENDPOINTS.JITSI.ACTIVE_CALLS
    );
    return response;
  }

  /**
   * Get current user's active call
   */
  async getMyActiveCall(): Promise<JitsiCallSession | null> {
    try {
      const response = await api.get<JitsiCallSession>(
        API_CONFIG.ENDPOINTS.JITSI.MY_ACTIVE_CALL
      );
      return response;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null; // No active call
      }
      throw error;
    }
  }

  /**
   * Initiate a call to another user
   */
  async initiateCall(data: InitiateCallRequest): Promise<InitiateCallResponse> {
    const response = await api.post<InitiateCallResponse>(
      API_CONFIG.ENDPOINTS.JITSI.INITIATE_CALL,
      data
    );
    return response;
  }

  /**
   * Update call status (answer, reject, end)
   */
  async updateCallStatus(callId: number, data: UpdateStatusRequest): Promise<UpdateStatusResponse> {
    const response = await api.post<UpdateStatusResponse>(
      API_CONFIG.ENDPOINTS.JITSI.UPDATE_CALL_STATUS(callId),
      data
    );
    return response;
  }

  /**
   * Answer an incoming call
   */
  async answerCall(callId: number): Promise<UpdateStatusResponse> {
    return this.updateCallStatus(callId, { action: 'answer' });
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: number): Promise<UpdateStatusResponse> {
    return this.updateCallStatus(callId, { action: 'reject' });
  }

  /**
   * End an active call
   */
  async endCall(callId: number): Promise<UpdateStatusResponse> {
    return this.updateCallStatus(callId, { action: 'end' });
  }

  /**
   * Update user presence status
   */
  async updateMyStatus(data: UpdatePresenceRequest): Promise<UpdatePresenceResponse> {
    const response = await api.post<UpdatePresenceResponse>(
      API_CONFIG.ENDPOINTS.JITSI.UPDATE_MY_STATUS,
      data
    );
    return response;
  }

  /**
   * Send heartbeat to keep presence alive
   */
  async heartbeat(): Promise<{ status: string }> {
    const response = await api.post<{ status: string }>(
      API_CONFIG.ENDPOINTS.JITSI.HEARTBEAT,
      {}
    );
    return response;
  }

  /**
   * Set user status to online
   */
  async setOnline(statusMessage: string = 'Available'): Promise<UpdatePresenceResponse> {
    return this.updateMyStatus({
      status: 'online',
      available_for_calls: true,
      status_message: statusMessage,
    });
  }

  /**
   * Set user status to offline
   */
  async setOffline(): Promise<UpdatePresenceResponse> {
    return this.updateMyStatus({
      status: 'offline',
      available_for_calls: false,
    });
  }

  /**
   * Set user status to busy
   */
  async setBusy(statusMessage: string = 'Busy'): Promise<UpdatePresenceResponse> {
    return this.updateMyStatus({
      status: 'busy',
      available_for_calls: false,
      status_message: statusMessage,
    });
  }
}

// Export singleton instance
export const jitsiService = new JitsiService();
export default jitsiService;
*/

// Placeholder exports to prevent import errors
export const jitsiService = {} as any;
export default jitsiService;

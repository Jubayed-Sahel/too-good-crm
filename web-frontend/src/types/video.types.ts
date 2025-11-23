/**
 * 8x8 Video (Jitsi) Types
 * Type definitions for 8x8 Video integration with JWT authentication
 */

// Call Types
export type CallType = 'audio' | 'video';

export type CallStatus =
  | 'pending'
  | 'ringing'
  | 'active'
  | 'completed'
  | 'missed'
  | 'rejected'
  | 'cancelled'
  | 'failed';

// Call Session
export interface VideoCallSession {
  id: number;
  session_id: string;
  room_name: string;
  call_type: CallType;
  status: CallStatus;
  initiator: number;
  initiator_name: string;
  recipient: number | null;
  recipient_name: string | null;
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
  jitsi_url: VideoUrlData;
  created_at: string;
  updated_at: string;
}

// 8x8 Video URL Data (returned by backend)
export interface VideoUrlData {
  video_url?: string;
  jwt_token?: string;
  room_name?: string;
  app_id?: string;
  server_domain?: string;
  error?: string; // Error message when JWT generation fails
}

// User Presence
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

// Online User (simplified)
export interface OnlineUser {
  id: number;
  username: string;
  full_name: string;
  status: string;
  available_for_calls: boolean;
  status_message: string;
  current_call_id: number | null;
}

// API Request/Response Types
export interface InitiateCallRequest {
  recipient_id: number | null;
  call_type: CallType;
}

export interface InitiateCallResponse {
  message: string;
  call_session: VideoCallSession;
}

export interface UpdateCallStatusRequest {
  action: 'answer' | 'reject' | 'end';
  status?: CallStatus;
}

export interface UpdateCallStatusResponse {
  message: string;
  call_session: VideoCallSession;
}

export interface GetActiveCallResponse {
  call: VideoCallSession | null;
}

export interface SendHeartbeatResponse {
  success: boolean;
  message?: string;
}

export interface GetOnlineUsersResponse {
  users: OnlineUser[];
}

export interface UpdatePresenceRequest {
  status?: 'online' | 'busy' | 'away' | 'offline';
  available_for_calls?: boolean;
  status_message?: string;
}

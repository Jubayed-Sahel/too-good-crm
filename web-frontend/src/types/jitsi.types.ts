/**
 * Jitsi call types and interfaces
 */

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

export type PresenceStatus = 'online' | 'busy' | 'away' | 'offline';

export interface JitsiCallSession {
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
  organization: number | null;
  recording_url: string | null;
  notes: string | null;
  jitsi_server: string;
  jitsi_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserPresence {
  id: number;
  user: number;
  user_name: string;
  status: PresenceStatus;
  available_for_calls: boolean;
  status_message: string | null;
  current_call: JitsiCallSession | null;
  last_seen_at: string;
}

export interface OnlineUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  presence: {
    status: PresenceStatus;
    available_for_calls: boolean;
    status_message: string | null;
  };
}

export interface InitiateCallRequest {
  recipient_id?: number | null;
  call_type?: CallType;
}

export interface InitiateCallResponse {
  message: string;
  call_session: JitsiCallSession;
}

export interface UpdateCallStatusRequest {
  action: 'answer' | 'reject' | 'end';
}

export interface UpdateCallStatusResponse {
  message: string;
  call_session: JitsiCallSession;
}

export interface UpdatePresenceRequest {
  status?: PresenceStatus;
  available_for_calls?: boolean;
  status_message?: string;
}

// Jitsi External API types
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export interface JitsiMeetExternalAPIOptions {
  roomName: string;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement | null;
  configOverwrite?: JitsiConfigOverwrite;
  interfaceConfigOverwrite?: JitsiInterfaceConfigOverwrite;
  jwt?: string;
  onload?: () => void;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

export interface JitsiConfigOverwrite {
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  toolbarButtons?: string[];
  filmstripEnabled?: boolean;
  hideConferenceSubject?: boolean;
  hideConferenceTimer?: boolean;
  disableInviteFunctions?: boolean;
  defaultLocalDisplayName?: string;
  defaultRemoteDisplayName?: string;
  prejoinPageEnabled?: boolean;
  enableWelcomePage?: boolean;
  enableClosePage?: boolean;
  [key: string]: any;
}

export interface JitsiInterfaceConfigOverwrite {
  SHOW_JITSI_WATERMARK?: boolean;
  SHOW_WATERMARK_FOR_GUESTS?: boolean;
  TOOLBAR_BUTTONS?: string[];
  SETTINGS_SECTIONS?: string[];
  VIDEO_LAYOUT_FIT?: 'nocrop' | 'height' | 'width';
  FILM_STRIP_MAX_HEIGHT?: number;
  SHOW_CHROME_EXTENSION_BANNER?: boolean;
  [key: string]: any;
}

export interface JitsiMeetExternalAPI {
  executeCommand: (command: string, ...args: any[]) => void;
  addEventListener: (event: string, listener: (...args: any[]) => void) => void;
  removeEventListener: (event: string, listener: (...args: any[]) => void) => void;
  dispose: () => void;
  getIFrame: () => HTMLIFrameElement;
  isAudioMuted: () => Promise<boolean>;
  isVideoMuted: () => Promise<boolean>;
  getRoomsInfo: () => Promise<any>;
  getParticipantsInfo: () => Promise<any[]>;
}

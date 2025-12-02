/**
 * VideoCallManager Component
 * Global video call state manager with real-time WebSocket notifications
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { videoService } from '../../services/video.service';
import VideoCallWindow from './VideoCallWindow';
import type { VideoCallSession, CallStatus } from '../../types/video.types';
import { toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { useVideoCallWebSocket, type VideoCallEvent } from '@/hooks/useVideoCallWebSocket';

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30 * 1000;

/**
 * VideoCallManager
 * Singleton component that manages video call state globally
 * - Sends heartbeat every 30 seconds to mark user as online
 * - Listens to real-time Pusher events for instant call notifications
 * - Renders VideoCallWindow when a call is active
 */
const VideoCallManager: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentCall, setCurrentCall] = useState<VideoCallSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentCallRef = useRef<VideoCallSession | null>(null);
  const userRef = useRef(user);

  // Keep refs in sync with state
  useEffect(() => {
    currentCallRef.current = currentCall;
    userRef.current = user;
  }, [currentCall, user]);

  // Get auth token from localStorage and update state
  useEffect(() => {
    // Skip if user object is not yet loaded
    if (!user && isAuthenticated) {
      console.log('[VideoCallManager] User data still loading, skipping token check');
      return;
    }
    
    console.log('[VideoCallManager] Token loading effect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated && user) {
      const storedTokens = localStorage.getItem('auth_tokens');
      console.log('[VideoCallManager] localStorage auth_tokens exists:', !!storedTokens);
      if (storedTokens) {
        try {
          const tokens = JSON.parse(storedTokens);
          const token = tokens.access || null;
          console.log('[VideoCallManager] ✅ Auth token loaded successfully, length:', token?.length);
          setAuthToken(token);
        } catch (error) {
          console.error('[VideoCallManager] ❌ Failed to parse auth tokens:', error);
          setAuthToken(null);
        }
      } else {
        console.warn('[VideoCallManager] ⚠️ No auth_tokens in localStorage - user may need to re-login');
        setAuthToken(null);
      }
    } else {
      if (!isAuthenticated) {
        console.log('[VideoCallManager] Not authenticated, clearing token');
      }
      setAuthToken(null);
    }
  }, [isAuthenticated, user]);

  // Only log if there's a current call or in development mode with user loaded
  if (currentCall || (process.env.NODE_ENV === 'development' && user)) {
    console.log('[VideoCallManager] Render - isAuthenticated:', isAuthenticated, 'user:', user?.id, 'hasToken:', !!authToken, 'isInitialized:', isInitialized, 'currentCall:', currentCall);
  }

  /**
   * Send heartbeat to mark user as online
   */
  const sendHeartbeat = useCallback(async () => {
    try {
      await videoService.sendHeartbeat();
      console.log('[VideoCallManager] Heartbeat sent');
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.error('[VideoCallManager] Authentication error in heartbeat');
      } else {
        console.error('[VideoCallManager] Failed to send heartbeat:', error);
      }
    }
  }, []);

  /**
   * Convert VideoCallEvent to VideoCallSession
   */
  const eventToSession = useCallback((event: VideoCallEvent): VideoCallSession => {
    return {
      id: event.data.id,
      session_id: event.data.room_name,
      room_name: event.data.room_name,
      call_type: event.data.call_type,
      status: event.data.status as CallStatus,
      initiator: event.data.initiator,
      initiator_name: event.data.initiator_name,
      recipient: event.data.recipient,
      recipient_name: event.data.recipient_name,
      jitsi_url: event.data.jitsi_url,
      jitsi_server: event.data.jitsi_url?.server_domain || '8x8.vc',
      created_at: event.data.created_at || '',
      updated_at: event.data.created_at || '',
      started_at: event.data.started_at,
      ended_at: event.data.ended_at,
      duration_seconds: event.data.duration_seconds,
      duration_formatted: '',
      participants: event.data.participants,
      organization: 0,
      is_active: event.data.status === 'active',
      participant_count: event.data.participants.length,
      recording_url: null,
      notes: '',
    };
  }, []);

  /**
   * Handle call initiated event from Pusher
   */
  const handleCallInitiated = useCallback((event: VideoCallEvent) => {
    const session = eventToSession(event);
    const currentUser = userRef.current;
    
    console.log('[VideoCallManager] Call initiated via Pusher:', session);
    setCurrentCall(session);

    // Show toast notification for incoming calls (only for recipients)
    if (session.status === 'pending' && currentUser && session.recipient === currentUser.id) {
      toaster.create({
        title: 'Incoming Call',
        description: `${session.initiator_name || 'Someone'} is calling you`,
        type: 'info',
        duration: 10000,
      });
    }
  }, [eventToSession]);

  /**
   * Handle call answered event from Pusher
   */
  const handleCallAnswered = useCallback((event: VideoCallEvent) => {
    const session = eventToSession(event);
    console.log('[VideoCallManager] Call answered via Pusher:', session);
    setCurrentCall(session);
  }, [eventToSession]);

  /**
   * Handle call rejected event from Pusher
   */
  const handleCallRejected = useCallback((event: VideoCallEvent) => {
    const session = eventToSession(event);
    const currentUser = userRef.current;
    
    console.log('[VideoCallManager] Call rejected via Pusher:', session);
    setCurrentCall(session);
    
    // Show toast for declined calls (only to initiator)
    if (currentUser && session.initiator === currentUser.id) {
      toaster.create({
        title: 'Call Declined',
        description: `${session.recipient_name || 'User'} declined your call`,
        type: 'warning',
        duration: 5000,
      });
    }

    // Auto-clear the declined call after 3 seconds
    setTimeout(() => {
      setCurrentCall(null);
    }, 3000);
  }, [eventToSession]);

  /**
   * Handle call ended event from Pusher
   */
  const handleCallEnded = useCallback((event: VideoCallEvent) => {
    console.log('[VideoCallManager.handleCallEnded] Received call-ended event:', event);
    console.log('[VideoCallManager.handleCallEnded] Current call before clearing:', currentCallRef.current);
    setCurrentCall(null);
    
    toaster.create({
      title: 'Call Ended',
      description: 'The call has ended.',
      type: 'info',
      duration: 3000,
    });
  }, []);

  /**
   * Subscribe to WebSocket video call events (only when authenticated)
   */
  useVideoCallWebSocket({
    userId: isAuthenticated ? user?.id ?? null : null,
    onCallInitiated: handleCallInitiated,
    onCallAnswered: handleCallAnswered,
    onCallRejected: handleCallRejected,
    onCallEnded: handleCallEnded,
    enabled: isAuthenticated,
  });

  /**
   * Check for existing active call on mount
   */
  const checkExistingCall = useCallback(async () => {
    console.log('[VideoCallManager.checkExistingCall] Checking for existing active call...');
    try {
      const activeCall = await videoService.getMyActiveCall();
      if (activeCall) {
        console.log('[VideoCallManager.checkExistingCall] Found existing active call:', activeCall);
        setCurrentCall(activeCall);
      } else {
        console.log('[VideoCallManager.checkExistingCall] No active call found');
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('[VideoCallManager.checkExistingCall] Failed to check for existing call:', error);
      } else {
        console.log('[VideoCallManager.checkExistingCall] No active call (404)');
      }
    }
  }, []);

  /**
   * Initialize heartbeat and check for existing calls
   */
  useEffect(() => {
    if (isInitialized || !isAuthenticated) {
      return;
    }

    console.log('[VideoCallManager] Initializing...');
    setIsInitialized(true);

    // Send initial heartbeat
    sendHeartbeat();

    // Check for existing active calls
    checkExistingCall();

    // Start heartbeat timer
    heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [isInitialized, isAuthenticated, sendHeartbeat, checkExistingCall]);

  /**
   * Handle call answer
   */
  const handleAnswer = useCallback(async (callId: number) => {
    try {
      const updatedCall = await videoService.answerCall(callId);
      setCurrentCall(updatedCall);
      console.log('[VideoCallManager] Call answered:', updatedCall);
    } catch (error) {
      console.error('[VideoCallManager] Failed to answer call:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to answer call. Please try again.',
        type: 'error',
        duration: 5000,
      });
    }
  }, []);

  /**
   * Handle call rejection
   */
  const handleReject = useCallback(async (callId: number) => {
    try {
      const updatedCall = await videoService.rejectCall(callId);
      // Keep the call in state to show "Call Declined" message
      setCurrentCall(updatedCall);
      console.log('[VideoCallManager] Call rejected');
      
      // Auto-clear the declined call after 3 seconds
      setTimeout(() => {
        setCurrentCall(null);
      }, 3000);
    } catch (error) {
      console.error('[VideoCallManager] Failed to reject call:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to decline call.',
        type: 'error',
        duration: 5000,
      });
    }
  }, []);

  /**
   * Handle call end
   */
  const handleEnd = useCallback(async (callId: number) => {
    console.log('[VideoCallManager.handleEnd] Called with callId:', callId);
    console.log('[VideoCallManager.handleEnd] Current call state before clear:', currentCall);
    
    // Clear the UI immediately to close the window
    setCurrentCall(null);
    console.log('[VideoCallManager.handleEnd] Call window closed, ending call in backend');
    
    try {
      const result = await videoService.endCall(callId);
      console.log('[VideoCallManager.handleEnd] Call ended successfully, result:', result);
      toaster.create({
        title: 'Call Ended',
        description: 'The call has ended.',
        type: 'info',
        duration: 3000,
      });
    } catch (error) {
      console.error('[VideoCallManager.handleEnd] Failed to end call:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to end call in backend.',
        type: 'error',
        duration: 5000,
      });
    }
  }, [currentCall]);

  // Show call window for:
  // - Active calls (both initiator and recipient)
  // - Pending calls (calling... for initiator, incoming for recipient)
  // - Declined/rejected calls (show "Call Declined" message)
  const shouldShowCallWindow = currentCall && (
    currentCall.status === 'active' ||
    currentCall.status === 'pending' ||
    currentCall.status === 'rejected' ||
    currentCall.status === 'cancelled'
  );

  return (
    <>
      {shouldShowCallWindow && currentCall && (
        <VideoCallWindow
          callSession={currentCall}
          onAnswer={handleAnswer}
          onReject={handleReject}
          onEnd={handleEnd}
          currentUserId={user?.id}
        />
      )}
    </>
  );
};

export default VideoCallManager;

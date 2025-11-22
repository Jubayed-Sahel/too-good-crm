/**
 * VideoCallManager Component
 * Global video call state manager with heartbeat and incoming call detection
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { videoService } from '../../services/video.service';
import VideoCallWindow from './VideoCallWindow';
import type { VideoCallSession } from '../../types/video.types';
import { toaster } from '@/components/ui/toaster';

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30 * 1000;

// Polling interval for incoming calls (5 seconds)
const POLL_INTERVAL = 5 * 1000;

/**
 * VideoCallManager
 * Singleton component that manages video call state globally
 * - Sends heartbeat every 30 seconds to mark user as online
 * - Polls for incoming calls every 5 seconds
 * - Renders VideoCallWindow when a call is active
 */
const VideoCallManager: React.FC = () => {
  const [currentCall, setCurrentCall] = useState<VideoCallSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Send heartbeat to mark user as online
   */
  const sendHeartbeat = useCallback(async () => {
    try {
      await videoService.sendHeartbeat();
      console.log('[VideoCallManager] Heartbeat sent');
    } catch (error) {
      console.error('[VideoCallManager] Failed to send heartbeat:', error);
    }
  }, []);

  /**
   * Poll for incoming or active calls
   */
  const pollForCalls = useCallback(async () => {
    try {
      const activeCall = await videoService.getMyActiveCall();

      if (activeCall) {
        // New incoming call or active call
        if (!currentCall || currentCall.id !== activeCall.id) {
          console.log('[VideoCallManager] New call detected:', activeCall);
          setCurrentCall(activeCall);

          // Show toast notification for incoming calls
          if (activeCall.status === 'pending') {
            toaster.create({
              title: 'Incoming Call',
              description: `${activeCall.initiator_name || 'Someone'} is calling you`,
              type: 'info',
              duration: 10000,
            });
          }
        } else if (currentCall && activeCall.status !== currentCall.status) {
          // Call status changed (e.g., answered, ended)
          console.log('[VideoCallManager] Call status changed:', activeCall.status);
          setCurrentCall(activeCall);
        }
      } else if (currentCall) {
        // Call ended
        console.log('[VideoCallManager] Call ended');
        setCurrentCall(null);
      }
    } catch (error) {
      console.error('[VideoCallManager] Failed to poll for calls:', error);
    }
  }, [currentCall]);

  /**
   * Initialize heartbeat and polling
   */
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    console.log('[VideoCallManager] Initializing...');
    setIsInitialized(true);

    // Send initial heartbeat
    sendHeartbeat();

    // Check for existing active calls
    pollForCalls();

    // Start heartbeat timer
    heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Start polling timer
    pollTimerRef.current = setInterval(pollForCalls, POLL_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isInitialized, sendHeartbeat, pollForCalls]);

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
      await videoService.rejectCall(callId);
      setCurrentCall(null);
      console.log('[VideoCallManager] Call rejected');
      toaster.create({
        title: 'Call Declined',
        description: 'You declined the call.',
        type: 'info',
        duration: 3000,
      });
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
    try {
      await videoService.endCall(callId);
      setCurrentCall(null);
      console.log('[VideoCallManager] Call ended');
      toaster.create({
        title: 'Call Ended',
        description: 'The call has ended.',
        type: 'info',
        duration: 3000,
      });
    } catch (error) {
      console.error('[VideoCallManager] Failed to end call:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to end call.',
        type: 'error',
        duration: 5000,
      });
    }
  }, []);

  return (
    <>
      {currentCall && (
        <VideoCallWindow
          callSession={currentCall}
          onAnswer={handleAnswer}
          onReject={handleReject}
          onEnd={handleEnd}
        />
      )}
    </>
  );
};

export default VideoCallManager;

/**
 * usePusherVideoCall Hook
 * Real-time video call notifications using Pusher
 */

import { useEffect, useCallback } from 'react';
import Pusher from 'pusher-js';
import type { VideoCallSession } from '../types/video.types';

// Pusher configuration
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '5ea9fef4e6e142b94ac4';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

// Create a singleton Pusher instance
let pusherInstance: Pusher | null = null;

const getPusher = (userId: number | undefined, authToken: string | null): Pusher | null => {
  if (!userId || !authToken) {
    return null;
  }

  if (!pusherInstance) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${baseUrl}/api/pusher/auth/`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

    console.log('[Pusher] Initialized with user:', userId, 'authEndpoint:', `${baseUrl}/api/pusher/auth/`);
  }

  return pusherInstance;
};

export interface VideoCallEvent {
  id: number;
  room_name: string;
  call_type: 'video' | 'audio';
  status: string;
  initiator: number;
  initiator_name: string;
  recipient: number | null;
  recipient_name: string | null;
  jitsi_url: any;
  created_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  participants: number[];
}

interface UsePusherVideoCallOptions {
  userId: number | undefined;
  authToken: string | null;
  onCallInitiated?: (call: VideoCallEvent) => void;
  onCallAnswered?: (call: VideoCallEvent) => void;
  onCallRejected?: (call: VideoCallEvent) => void;
  onCallEnded?: (call: VideoCallEvent) => void;
}

/**
 * Hook to subscribe to real-time video call events via Pusher
 */
export const usePusherVideoCall = ({
  userId,
  authToken,
  onCallInitiated,
  onCallAnswered,
  onCallRejected,
  onCallEnded,
}: UsePusherVideoCallOptions) => {
  const handleCallInitiated = useCallback(
    (data: VideoCallEvent) => {
      console.log('[Pusher] Call initiated:', data);
      onCallInitiated?.(data);
    },
    [onCallInitiated]
  );

  const handleCallAnswered = useCallback(
    (data: VideoCallEvent) => {
      console.log('[Pusher] Call answered:', data);
      onCallAnswered?.(data);
    },
    [onCallAnswered]
  );

  const handleCallRejected = useCallback(
    (data: VideoCallEvent) => {
      console.log('[Pusher] Call rejected:', data);
      onCallRejected?.(data);
    },
    [onCallRejected]
  );

  const handleCallEnded = useCallback(
    (data: VideoCallEvent) => {
      console.log('[Pusher] Call ended:', data);
      onCallEnded?.(data);
    },
    [onCallEnded]
  );

  useEffect(() => {
    if (!userId || !authToken) {
      console.log('[Pusher] No userId or authToken, skipping subscription. userId:', userId, 'hasToken:', !!authToken);
      return;
    }

    console.log('[Pusher] Starting subscription setup for user:', userId);
    const pusher = getPusher(userId, authToken);
    if (!pusher) {
      console.error('[Pusher] Failed to initialize Pusher instance');
      return;
    }

    // Subscribe to user's private channel
    const channelName = `private-user-${userId}`;
    console.log('[Pusher] Subscribing to channel:', channelName);
    const channel = pusher.subscribe(channelName);

    // Bind to video call events
    channel.bind('call-initiated', handleCallInitiated);
    channel.bind('call-answered', handleCallAnswered);
    channel.bind('call-rejected', handleCallRejected);
    channel.bind('call-ended', handleCallEnded);

    // Log subscription status
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] ✅ Successfully subscribed to:', channelName);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Pusher] ❌ Subscription error:', error);
    });

    // Connection state listeners
    pusher.connection.bind('connected', () => {
      console.log('[Pusher] ✅ Connected to Pusher');
    });

    pusher.connection.bind('error', (error: any) => {
      console.error('[Pusher] ❌ Connection error:', error);
    });

    pusher.connection.bind('disconnected', () => {
      console.warn('[Pusher] ⚠️ Disconnected from Pusher');
    });

    // Cleanup on unmount
    return () => {
      console.log('[Pusher] Cleaning up subscription for:', channelName);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [
    userId,
    authToken,
    handleCallInitiated,
    handleCallAnswered,
    handleCallRejected,
    handleCallEnded,
  ]);
};

/**
 * Disconnect Pusher (useful for logout)
 */
export const disconnectPusher = () => {
  if (pusherInstance) {
    console.log('[Pusher] Disconnecting');
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};

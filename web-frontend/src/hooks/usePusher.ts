/**
 * Pusher Hook for Real-Time Messaging
 */
import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './useAuth';
import api from '@/lib/apiClient';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '5ea9fef4e6e142b94ac4';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

let pusherInstance: Pusher | null = null;

export const getPusherInstance = () => {
  if (!pusherInstance && PUSHER_KEY) {
    // Try JWT token first, fallback to legacy token
    const jwtToken = localStorage.getItem('accessToken');
    const legacyToken = localStorage.getItem('authToken');
    const token = jwtToken || legacyToken;
    
    console.log('🔌 Initializing Pusher client...', {
      key: PUSHER_KEY.substring(0, 10) + '...',
      cluster: PUSHER_CLUSTER,
      hasToken: !!token,
      authType: jwtToken ? 'JWT' : 'Legacy',
    });
    
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: 'http://localhost:8000/api/pusher/auth/',
      auth: {
        headers: token ? {
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : `Token ${legacyToken}`,
        } : {},
      },
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });
    
    // Add global connection event listeners
    pusherInstance.connection.bind('state_change', (states: any) => {
      console.log('🔄 Pusher connection state changed:', states.previous, '->', states.current);
    });
    
    pusherInstance.connection.bind('error', (err: any) => {
      console.error('❌ Pusher connection error:', err);
    });
  }
  return pusherInstance;
};

export const usePusherChannel = (
  channelName: string | null,
  eventName: string,
  callback: (data: any) => void
) => {
  const { user } = useAuth();
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const callbackRef = useRef(callback);
  const [isConnected, setIsConnected] = useState(false);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!channelName || !user || !user.id) {
      if (import.meta.env.DEV) {
        console.log('⏸️ Pusher: Skipping subscription', { 
          channelName, 
          hasUser: !!user, 
          userId: user?.id 
        });
      }
      return;
    }

    const pusher = getPusherInstance();
    if (!pusher) {
      console.warn('⚠️ Pusher: Not initialized');
      return;
    }

    pusherRef.current = pusher;

    // Handle connection events
    const handleConnected = () => {
      setIsConnected(true);
      console.log('✅ Pusher: Connected');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      console.log('❌ Pusher: Disconnected');
    };

    const handleError = (err: any) => {
      console.error('❌ Pusher: Connection error', err);
    };

    pusher.connection.bind('connected', handleConnected);
    pusher.connection.bind('disconnected', handleDisconnected);
    pusher.connection.bind('error', handleError);

    // Subscribe to private channel
    console.log(`📡 Pusher: Subscribing to channel: ${channelName}`);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Handle subscription events
    const handleSubscriptionSucceeded = () => {
      console.log(`✅ Pusher: Subscribed to channel: ${channelName}`);
    };

    const handleSubscriptionError = (err: any) => {
      console.error(`❌ Pusher: Subscription error for ${channelName}:`, err);
    };

    channel.bind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
    channel.bind('pusher:subscription_error', handleSubscriptionError);

    // Bind to event with wrapper that uses latest callback
    const eventHandler = (data: any) => {
      console.log(`📨 Pusher: Event '${eventName}' received on ${channelName}:`, data);
      callbackRef.current(data);
    };

    channel.bind(eventName, eventHandler);
    console.log(`👂 Pusher: Listening for event '${eventName}' on ${channelName}`);

    return () => {
      console.log(`🧹 Pusher: Cleaning up subscription to ${channelName}`);
      if (channelRef.current) {
        channelRef.current.unbind(eventName, eventHandler);
        channelRef.current.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
        channelRef.current.unbind('pusher:subscription_error', handleSubscriptionError);
        pusher.unsubscribe(channelName);
      }
      pusher.connection.unbind('connected', handleConnected);
      pusher.connection.unbind('disconnected', handleDisconnected);
      pusher.connection.unbind('error', handleError);
    };
  }, [channelName, eventName, user?.id]); // Only depend on user.id, not entire user object

  return { pusher: pusherRef.current, channel: channelRef.current, isConnected };
};

export const usePusherMessages = (onNewMessage?: (data: any) => void) => {
  const { user } = useAuth();
  const channelName = user ? `private-user-${user.id}` : null;

  usePusherChannel(channelName, 'new-message', (data: any) => {
    console.log('New message received via Pusher:', data);
    if (onNewMessage) {
      onNewMessage(data);
    }
  });

  usePusherChannel(channelName, 'conversation-updated', (data: any) => {
    console.log('Conversation updated via Pusher:', data);
    if (onNewMessage) {
      onNewMessage(data);
    }
  });

  usePusherChannel(channelName, 'unread-count-updated', (data: any) => {
    console.log('Unread count updated via Pusher:', data);
  });
};


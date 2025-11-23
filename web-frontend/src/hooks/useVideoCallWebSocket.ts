/**
 * WebSocket Hook for Video Call Real-time Notifications
 * Replaces Pusher with self-hosted WebSocket using Django Channels
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export interface VideoCallEvent {
  event: 'call-initiated' | 'call-answered' | 'call-rejected' | 'call-ended';
  data: {
    id: number;
    room_name: string;
    call_type: 'video' | 'audio';
    status: 'pending' | 'active' | 'ended' | 'rejected';
    initiator: number;
    initiator_name: string;
    recipient: number | null;
    recipient_name: string | null;
    jitsi_url: {
      url: string;
      token: string;
      room_name: string;
    };
    created_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    duration_seconds: number | null;
    participants: number[];
  };
}

interface UseVideoCallWebSocketProps {
  userId: number | null;
  onCallInitiated?: (event: VideoCallEvent) => void;
  onCallAnswered?: (event: VideoCallEvent) => void;
  onCallRejected?: (event: VideoCallEvent) => void;
  onCallEnded?: (event: VideoCallEvent) => void;
  enabled?: boolean;
}

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
const RECONNECT_INTERVAL = 3000; // 3 seconds
const PING_INTERVAL = 30000; // 30 seconds

export const useVideoCallWebSocket = ({
  userId,
  onCallInitiated,
  onCallAnswered,
  onCallRejected,
  onCallEnded,
  enabled = true,
}: UseVideoCallWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!userId || !enabled) {
      console.log('[VideoCallWS] Not connecting: userId=', userId, 'enabled=', enabled);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[VideoCallWS] Already connected');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/video-call/${userId}/`;
    console.log('[VideoCallWS] Connecting to:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[VideoCallWS] Connected successfully');
        setIsConnected(true);
        
        // Start ping interval for keep-alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[VideoCallWS] Received message:', message);

          // Handle connection confirmation
          if (message.type === 'connection_established') {
            console.log('[VideoCallWS] Connection confirmed:', message.message);
            return;
          }

          // Handle pong responses
          if (message.type === 'pong') {
            return;
          }

          // Handle video call events
          const videoEvent = message as VideoCallEvent;
          
          switch (videoEvent.event) {
            case 'call-initiated':
              console.log('[VideoCallWS] Call initiated:', videoEvent.data);
              onCallInitiated?.(videoEvent);
              break;
            case 'call-answered':
              console.log('[VideoCallWS] Call answered:', videoEvent.data);
              onCallAnswered?.(videoEvent);
              break;
            case 'call-rejected':
              console.log('[VideoCallWS] Call rejected:', videoEvent.data);
              onCallRejected?.(videoEvent);
              break;
            case 'call-ended':
              console.log('[VideoCallWS] Call ended:', videoEvent.data);
              onCallEnded?.(videoEvent);
              break;
            default:
              console.log('[VideoCallWS] Unknown event:', message);
          }
        } catch (error) {
          console.error('[VideoCallWS] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[VideoCallWS] WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('[VideoCallWS] Disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection if enabled
        if (shouldReconnectRef.current && enabled) {
          console.log(`[VideoCallWS] Reconnecting in ${RECONNECT_INTERVAL}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[VideoCallWS] Connection error:', error);
    }
  }, [userId, enabled, onCallInitiated, onCallAnswered, onCallRejected, onCallEnded]);

  const disconnect = useCallback(() => {
    console.log('[VideoCallWS] Disconnecting...');
    shouldReconnectRef.current = false;

    // Clear timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (enabled && userId) {
      shouldReconnectRef.current = true;
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, enabled, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
};

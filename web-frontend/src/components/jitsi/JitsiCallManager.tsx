/**
 * Jitsi Call Manager
 * Manages active call state and renders the video toast UI
 */
import { useState, useEffect } from 'react';
import { jitsiService } from '@/services/jitsi.service';
import { JitsiVideoToast } from './JitsiVideoToast';
import { toaster } from '@/components/ui/toaster';
import type { JitsiCallSession, CallType } from '@/types/jitsi.types';

/**
 * Global call manager state
 */
let globalCallManager: {
  activeCall: JitsiCallSession | null;
  listeners: Set<(call: JitsiCallSession | null) => void>;
} = {
  activeCall: null,
  listeners: new Set(),
};

/**
 * Subscribe to call state changes
 */
function subscribeToCallState(listener: (call: JitsiCallSession | null) => void) {
  globalCallManager.listeners.add(listener);
  return () => {
    globalCallManager.listeners.delete(listener);
  };
}

/**
 * Update global call state and notify listeners
 */
function setGlobalActiveCall(call: JitsiCallSession | null) {
  globalCallManager.activeCall = call;
  globalCallManager.listeners.forEach((listener) => listener(call));
}

/**
 * Initiate a call to a user
 */
export async function initiateCall(
  recipientId: number | null,
  recipientName: string,
  callType: CallType = 'audio'
): Promise<JitsiCallSession | null> {
  try {
    const response = await jitsiService.initiateCall(recipientId, callType);
    const callSession = response.call_session;

    setGlobalActiveCall(callSession);

    toaster.create({
      title: 'Call Initiated',
      description: `Calling ${recipientName}...`,
      type: 'success',
      duration: 3000,
    });

    return callSession;
  } catch (error: any) {
    console.error('Error initiating call:', error);
    toaster.create({
      title: 'Call Failed',
      description: error.response?.data?.error || 'Failed to initiate call',
      type: 'error',
      duration: 5000,
    });
    return null;
  }
}

/**
 * End the active call
 */
export async function endActiveCall(): Promise<void> {
  if (!globalCallManager.activeCall) return;

  try {
    await jitsiService.endCall(globalCallManager.activeCall.id);
    setGlobalActiveCall(null);

    toaster.create({
      title: 'Call Ended',
      type: 'info',
      duration: 2000,
    });
  } catch (error: any) {
    console.error('Error ending call:', error);
    toaster.create({
      title: 'Error',
      description: 'Failed to end call properly',
      type: 'error',
      duration: 3000,
    });
    // Clear the call anyway
    setGlobalActiveCall(null);
  }
}

/**
 * JitsiCallManager Component
 * Renders the active call UI if there's an active call
 */
export const JitsiCallManager: React.FC = () => {
  const [activeCall, setActiveCall] = useState<JitsiCallSession | null>(
    globalCallManager.activeCall
  );

  useEffect(() => {
    // Subscribe to global call state
    const unsubscribe = subscribeToCallState(setActiveCall);

    // Check for existing active call on mount
    const checkActiveCall = async () => {
      try {
        const call = await jitsiService.getMyActiveCall();
        if (call) {
          setGlobalActiveCall(call);
        }
      } catch (error) {
        console.error('Error checking active call:', error);
      }
    };

    checkActiveCall();

    // Send initial heartbeat
    jitsiService.sendHeartbeat().catch((error) => {
      console.error('Error sending initial heartbeat:', error);
    });

    // Send heartbeat every 30 seconds to maintain online status
    const heartbeatInterval = setInterval(() => {
      jitsiService.sendHeartbeat().catch((error) => {
        console.error('Error sending heartbeat:', error);
      });
    }, 30000);

    // Poll for incoming calls every 5 seconds
    const callCheckInterval = setInterval(() => {
      jitsiService.getMyActiveCall()
        .then((call) => {
          // Only update if we don't have an active call or the call ID changed
          if (call && !globalCallManager.activeCall) {
            // New incoming call detected (only when we don't have an active call)
            setGlobalActiveCall(call);
            
            // Show notification for incoming call
            if (call.status === 'pending' || call.status === 'ringing') {
              toaster.create({
                title: 'Incoming Call',
                description: `${call.initiator_name} is calling...`,
                type: 'info',
                duration: 10000,
              });
            }
          } else if (!call && globalCallManager.activeCall) {
            // Call ended remotely
            setGlobalActiveCall(null);
          }
        })
        .catch((error) => {
          // Ignore 204 No Content responses (no active call)
          if (error?.response?.status !== 204) {
            console.error('Error polling for calls:', error);
          }
        });
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(heartbeatInterval);
      clearInterval(callCheckInterval);
    };
  }, []);

  if (!activeCall) {
    return null;
  }

  return (
    <JitsiVideoToast
      callSession={activeCall}
      onEndCall={endActiveCall}
      userName={activeCall.initiator_name}
    />
  );
};

export default JitsiCallManager;

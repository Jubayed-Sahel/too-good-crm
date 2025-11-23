/**
 * Video Call Helpers
 * Helper functions for initiating video calls from anywhere in the app
 */

import { videoService } from '../services/video.service';
import { toaster } from '@/components/ui/toaster';
import type { CallType } from '../types/video.types';

/**
 * Initiate a video call to a user
 * @param recipientId - ID of the user to call
 * @param callType - Type of call ('video' or 'audio')
 * @returns Promise that resolves when call is initiated
 */
export const initiateCall = async (
  recipientId: number,
  callType: CallType = 'video'
): Promise<void> => {
  try {
    console.log(`[VideoCall] Initiating ${callType} call to user ${recipientId}`);
    
    const callSession = await videoService.initiateCall(recipientId, callType);
    
    console.log('[VideoCall] Call initiated successfully:', callSession);
    
    toaster.create({
      title: 'Call Initiated',
      description: `${callType === 'video' ? 'Video' : 'Audio'} call started to ${callSession.recipient_name || 'user'}`,
      type: 'success',
      duration: 3000,
    });
  } catch (error: any) {
    console.error('[VideoCall] Failed to initiate call:', error);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Failed to initiate call. Please try again.';
    
    toaster.create({
      title: 'Call Failed',
      description: errorMessage,
      type: 'error',
      duration: 5000,
    });
    
    throw error;
  }
};

/**
 * Initiate a video call
 */
export const initiateVideoCall = (recipientId: number) => 
  initiateCall(recipientId, 'video');

/**
 * Initiate an audio call
 */
export const initiateAudioCall = (recipientId: number) => 
  initiateCall(recipientId, 'audio');

/**
 * Initiate an audio call by looking up user by email
 * @param email - Email address of the user to call
 * @param displayName - Display name for better UX
 * @returns Promise that resolves when call is initiated
 */
export const initiateAudioCallByEmail = async (
  email: string,
  displayName?: string
): Promise<void> => {
  try {
    console.log(`[VideoCall] Looking up user by email: ${email}`);
    
    // Look up user by email via backend
    const callSession = await videoService.initiateCallByEmail(email, 'audio');
    
    console.log('[VideoCall] Call initiated successfully:', callSession);
    
    // Dispatch custom event to trigger immediate poll in VideoCallManager
    console.log('[VideoCall] Dispatching videoCallInitiated event');
    const event = new CustomEvent('videoCallInitiated', { detail: callSession });
    window.dispatchEvent(event);
    console.log('[VideoCall] Event dispatched');
    
    toaster.create({
      title: 'Call Initiated',
      description: `Audio call started to ${displayName || callSession.recipient_name || 'user'}`,
      type: 'success',
      duration: 3000,
    });
  } catch (error: any) {
    console.error('[VideoCall] Failed to initiate call:', error);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Failed to initiate call. User may not be registered or available.';
    
    toaster.create({
      title: 'Call Failed',
      description: errorMessage,
      type: 'error',
      duration: 5000,
    });
    
    throw error;
  }
};


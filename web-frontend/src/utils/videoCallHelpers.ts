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

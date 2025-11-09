/**
 * Jitsi Call Manager Component
 * Handles incoming call notifications, call state management, and toast notifications
 */
import { useEffect, useState, useCallback } from 'react';
import { Box, Button, Flex, Text, Stack, HStack } from '@chakra-ui/react';
import { LuPhone, LuPhoneOff, LuVideo, LuX } from 'react-icons/lu';
import { toaster } from '@/components/ui/toaster';
import jitsiService, { type JitsiCallSession } from '@/services/jitsi.service';

interface JitsiCallManagerProps {
  userId: number;
  onCallStart?: (call: JitsiCallSession) => void;
  onCallEnd?: () => void;
}

export const JitsiCallManager: React.FC<JitsiCallManagerProps> = ({
  userId,
  onCallStart,
  onCallEnd,
}) => {
  const [activeCall, setActiveCall] = useState<JitsiCallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<JitsiCallSession | null>(null);

  /**
   * Check for active calls and incoming calls
   */
  const checkForCalls = useCallback(async () => {
    try {
      const myCall = await jitsiService.getMyActiveCall();
      
      if (myCall) {
        // Check if this is a new call
        if (!activeCall || activeCall.id !== myCall.id) {
          if (myCall.status === 'pending' && myCall.recipient === userId) {
            // Incoming call notification
            setIncomingCall(myCall);
            showIncomingCallToast(myCall);
          } else if (myCall.status === 'active') {
            // Call is active
            setActiveCall(myCall);
            setIncomingCall(null);
            if (onCallStart) {
              onCallStart(myCall);
            }
            showCallActiveToast(myCall);
          }
        }
      } else {
        // No active call
        if (activeCall) {
          // Call ended
          setActiveCall(null);
          setIncomingCall(null);
          if (onCallEnd) {
            onCallEnd();
          }
        }
      }
    } catch (error: any) {
      // Silently handle errors - if it's a 500 error, the service may not be available
      // Only log non-500 errors (like network issues)
      if (error?.status !== 500 && error?.status !== 204) {
        console.error('Error checking for calls:', error);
      }
    }
  }, [activeCall, userId, onCallStart, onCallEnd]);

  /**
   * Show incoming call toast notification
   */
  const showIncomingCallToast = (call: JitsiCallSession) => {
    toaster.create({
      title: '📞 Incoming Call',
      description: `${call.initiator_name} is calling you`,
      type: 'info',
      duration: 30000, // 30 seconds
      action: {
        label: 'Answer',
        onClick: () => handleAnswerCall(call.id),
      },
    });
  };

  /**
   * Show call active toast notification
   */
  const showCallActiveToast = (call: JitsiCallSession) => {
    const otherUser = call.initiator === userId ? call.recipient_name : call.initiator_name;
    toaster.create({
      title: '✅ Call Active',
      description: `You are now in a call with ${otherUser}`,
      type: 'success',
      duration: 5000,
    });
  };

  /**
   * Show call ended toast notification
   */
  const showCallEndedToast = () => {
    toaster.create({
      title: 'Call Ended',
      description: 'The call has been ended',
      type: 'info',
      duration: 3000,
    });
  };

  /**
   * Answer an incoming call
   */
  const handleAnswerCall = async (callId: number) => {
    try {
      const response = await jitsiService.answerCall(callId);
      setIncomingCall(null);
      setActiveCall(response.call_session);
      
      toaster.create({
        title: 'Call Answered',
        description: 'Connecting to call...',
        type: 'success',
        duration: 3000,
      });

      // Open Jitsi URL
      if (response.call_session.jitsi_url) {
        window.open(response.call_session.jitsi_url, '_blank');
      }
      
      if (onCallStart) {
        onCallStart(response.call_session);
      }
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error?.response?.data?.error || 'Failed to answer call',
        type: 'error',
        duration: 5000,
      });
    }
  };

  /**
   * Reject an incoming call
   */
  const handleRejectCall = async (callId: number) => {
    try {
      await jitsiService.rejectCall(callId);
      setIncomingCall(null);
      
      toaster.create({
        title: 'Call Rejected',
        description: 'You rejected the call',
        type: 'info',
        duration: 3000,
      });
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error?.response?.data?.error || 'Failed to reject call',
        type: 'error',
        duration: 5000,
      });
    }
  };

  /**
   * End active call
   */
  const handleEndCall = async (callId: number) => {
    try {
      await jitsiService.endCall(callId);
      setActiveCall(null);
      showCallEndedToast();
      
      if (onCallEnd) {
        onCallEnd();
      }
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error?.response?.data?.error || 'Failed to end call',
        type: 'error',
        duration: 5000,
      });
    }
  };

  /**
   * Poll for calls every 3 seconds
   */
  useEffect(() => {
    // Initial check
    checkForCalls();

    // Start polling
    const interval = setInterval(checkForCalls, 3000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [checkForCalls]);

  /**
   * Send heartbeat every 60 seconds to keep presence alive
   */
  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      try {
        await jitsiService.heartbeat();
      } catch (error: any) {
        // Silently handle heartbeat errors - service may not be available
        // Only log if it's not a 500 error
        if (error?.status !== 500) {
          console.error('Heartbeat failed:', error);
        }
      }
    }, 60000); // 60 seconds

    return () => clearInterval(heartbeatInterval);
  }, []);

  /**
   * Set user online on mount
   */
  useEffect(() => {
    const setOnline = async () => {
      try {
        await jitsiService.setOnline('Available for calls');
      } catch (error: any) {
        // Silently handle errors - presence service may not be available
        // Only log if it's not a 500 error (which indicates missing tables)
        if (error?.status !== 500) {
          console.error('Failed to set online status:', error);
        }
      }
    };

    setOnline();

    // Set offline on unmount
    return () => {
      jitsiService.setOffline().catch((error: any) => {
        // Silently handle errors on unmount
        if (error?.status !== 500) {
          console.error('Failed to set offline status:', error);
        }
      });
    };
  }, []);

  return (
    <>
      {/* Incoming Call Notification */}
      {incomingCall && (
        <Box
          position="fixed"
          top="20px"
          right="20px"
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          p={4}
          minW="300px"
          zIndex={9999}
          border="2px solid"
          borderColor="blue.500"
        >
          <Stack gap={3}>
            <Flex align="center" justify="space-between">
              <HStack>
                <LuVideo size={24} color="var(--chakra-colors-blue-500)" />
                <Text fontWeight="bold" fontSize="lg">Incoming Call</Text>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRejectCall(incomingCall.id)}
              >
                <LuX size={18} />
              </Button>
            </Flex>
            
            <Text color="gray.600">
              {incomingCall.initiator_name} is calling you
            </Text>
            
            <HStack gap={2}>
              <Button
                colorScheme="green"
                size="md"
                flex={1}
                onClick={() => handleAnswerCall(incomingCall.id)}
              >
                <LuPhone size={18} />
                <Text ml={2}>Answer</Text>
              </Button>
              <Button
                colorScheme="red"
                size="md"
                flex={1}
                onClick={() => handleRejectCall(incomingCall.id)}
              >
                <LuPhoneOff size={18} />
                <Text ml={2}>Decline</Text>
              </Button>
            </HStack>
          </Stack>
        </Box>
      )}

      {/* Active Call Indicator */}
      {activeCall && (
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          bg="green.500"
          color="white"
          borderRadius="full"
          p={4}
          boxShadow="lg"
          zIndex={9998}
        >
          <HStack gap={3}>
            <LuVideo size={20} />
            <Text fontWeight="medium">
              Call with {activeCall.initiator === userId ? activeCall.recipient_name : activeCall.initiator_name}
            </Text>
            <Button
              size="sm"
              colorScheme="red"
              borderRadius="full"
              onClick={() => handleEndCall(activeCall.id)}
            >
              <LuPhoneOff size={16} />
            </Button>
          </HStack>
        </Box>
      )}
    </>
  );
};

export default JitsiCallManager;

/**
 * Helper function to initiate a call and show toast
 */
export const initiateCall = async (
  recipientId: number,
  recipientName: string,
  callType: 'audio' | 'video' = 'video'
) => {
  try {
    const response = await jitsiService.initiateCall({
      recipient_id: recipientId,
      call_type: callType,
    });

    toaster.create({
      title: '📞 Call Initiated',
      description: `Calling ${recipientName}...`,
      type: 'success',
      duration: 5000,
    });

    // Open Jitsi URL in new window
    if (response.call_session.jitsi_url) {
      window.open(response.call_session.jitsi_url, '_blank', 'width=1200,height=800');
    }

    return response.call_session;
  } catch (error: any) {
    toaster.create({
      title: 'Call Failed',
      description: error?.response?.data?.error || 'Failed to initiate call',
      type: 'error',
      duration: 5000,
    });
    throw error;
  }
};

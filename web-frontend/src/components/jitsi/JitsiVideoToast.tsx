/**
 * JitsiVideoToast - Floating, draggable video call UI
 * Implements a toast-style picture-in-picture interface for Jitsi calls
 */
import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, HStack, Text, VStack, Button } from '@chakra-ui/react';
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhone,
  FiPhoneIncoming,
  FiPhoneOff,
  FiMinimize2,
  FiMaximize2,
  FiMove,
} from 'react-icons/fi';
import { jitsiService } from '@/services/jitsi.service';
import { toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks';
import type { JitsiMeetExternalAPI, JitsiCallSession } from '@/types/jitsi.types';

interface JitsiVideoToastProps {
  callSession: JitsiCallSession;
  onEndCall: () => void;
  userName?: string;
}

export const JitsiVideoToast: React.FC<JitsiVideoToastProps> = ({
  callSession,
  onEndCall,
  userName,
}) => {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [callAccepted, setCallAccepted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiMeetExternalAPI | null>(null);

  // Determine if this is an incoming call (recipient sees it as incoming)
  const isIncomingCall = (callSession.status === 'pending' || callSession.status === 'ringing') 
    && callSession.recipient === user?.id;
  const shouldShowJitsi = callAccepted || !isIncomingCall;

  // Handle answer call
  const handleAnswer = async () => {
    try {
      await jitsiService.answerCall(callSession.id);
      setCallAccepted(true);
      toaster.create({
        title: 'Call Answered',
        type: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error answering call:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to answer call',
        type: 'error',
        duration: 3000,
      });
    }
  };

  // Handle reject call
  const handleReject = async () => {
    try {
      await jitsiService.rejectCall(callSession.id);
      onEndCall();
      toaster.create({
        title: 'Call Rejected',
        type: 'info',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error rejecting call:', error);
      onEndCall(); // Close anyway
    }
  };

  // Initialize Jitsi only when call is accepted or outgoing
  useEffect(() => {
    // Don't initialize Jitsi for incoming unanswered calls
    if (!shouldShowJitsi) {
      return;
    }

    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
      console.error('Jitsi External API not loaded');
      return;
    }

    const domain = 'meet.jit.si';
    const options = {
      roomName: callSession.room_name,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        toolbarButtons: [], // Hide default toolbar
        filmstripEnabled: false,
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        disableInviteFunctions: true,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        enableClosePage: false,
        // Disable features that cause CORS issues
        disableDeepLinking: true,
        enableInsecureRoomNameWarning: false,
        p2p: {
          enabled: false, // Disable P2P to avoid connection issues
        },
        // Disable analytics that cause CORS errors
        analytics: {
          disabled: true,
        },
        // Disable features that require server communication
        disableProfile: true,
        disableRemoteMute: true,
        remoteVideoMenu: {
          disabled: true,
        },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [],
        SETTINGS_SECTIONS: [],
        VIDEO_LAYOUT_FIT: 'nocrop',
        FILM_STRIP_MAX_HEIGHT: 0,
        SHOW_CHROME_EXTENSION_BANNER: false,
        DISABLE_FOCUS_INDICATOR: true,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      },
      userInfo: {
        displayName: userName || 'User',
      },
    };

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Event listeners
      api.addEventListener('videoConferenceJoined', () => {
        console.log('Joined Jitsi conference');
      });

      api.addEventListener('videoConferenceLeft', () => {
        console.log('Left Jitsi conference');
        onEndCall();
      });

      api.addEventListener('audioMuteStatusChanged', (event: any) => {
        setIsMuted(event.muted);
      });

      api.addEventListener('videoMuteStatusChanged', (event: any) => {
        setIsVideoOff(event.muted);
      });
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [callSession, userName, onEndCall, shouldShowJitsi]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport
      const maxX = window.innerWidth - (isMinimized ? 200 : 400);
      const maxY = window.innerHeight - (isMinimized ? 100 : 300);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized]);

  // Control handlers
  const toggleMute = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    onEndCall();
  };

  return (
    <Box
      ref={containerRef}
      position="fixed"
      left={`${position.x}px`}
      top={`${position.y}px`}
      width={isMinimized ? '200px' : '400px'}
      height={isMinimized ? '80px' : '300px'}
      borderRadius="12px"
      overflow="hidden"
      boxShadow="0 4px 12px rgba(0,0,0,0.3)"
      zIndex={9999}
      bg="gray.900"
      transition="width 0.3s, height 0.3s"
    >
      {/* Header - Draggable */}
      <HStack
        bg="gray.800"
        p={2}
        cursor="move"
        onMouseDown={handleMouseDown}
        justify="space-between"
      >
        <HStack gap={2}>
          <FiMove size={16} />
          <Text fontSize="sm" fontWeight="medium" color="white">
            {isIncomingCall && !callAccepted 
              ? `Incoming call from ${callSession.initiator_name}` 
              : callSession.recipient_name || callSession.initiator_name || 'Call in Progress'}
          </Text>
        </HStack>
        {!isIncomingCall || callAccepted ? (
          <IconButton
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            size="xs"
            variant="ghost"
            color="white"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
          </IconButton>
        ) : null}
      </HStack>

      {/* Incoming Call UI */}
      {isIncomingCall && !callAccepted && !isMinimized ? (
        <VStack
          width="100%"
          height="calc(100% - 48px)"
          bg="gray.900"
          justify="center"
          align="center"
          gap={6}
          p={6}
        >
          <FiPhoneIncoming size={64} color="white" />
          <VStack gap={2}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              {callSession.initiator_name}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {callSession.call_type === 'video' ? 'Video Call' : 'Audio Call'}
            </Text>
          </VStack>
          <HStack gap={4}>
            <Button
              colorScheme="red"
              size="lg"
              borderRadius="full"
              onClick={handleReject}
            >
              <FiPhoneOff style={{ marginRight: '8px' }} />
              Decline
            </Button>
            <Button
              colorScheme="green"
              size="lg"
              borderRadius="full"
              onClick={handleAnswer}
            >
              <FiPhone style={{ marginRight: '8px' }} />
              Answer
            </Button>
          </HStack>
        </VStack>
      ) : null}

      {/* Video Container - Only show when call is active */}
      {!isMinimized && shouldShowJitsi && (
        <Box
          ref={jitsiContainerRef}
          width="100%"
          height="calc(100% - 96px)" // Header + controls
          bg="black"
        />
      )}

      {/* Controls - Only show when call is active */}
      {shouldShowJitsi && (
        <HStack
          p={2}
          bg="gray.800"
        justify="center"
        gap={2}
        position="absolute"
        bottom={0}
        left={0}
        right={0}
      >
        <IconButton
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          size="sm"
          colorScheme={isMuted ? 'red' : 'gray'}
          onClick={toggleMute}
          borderRadius="full"
        >
          {isMuted ? <FiMicOff /> : <FiMic />}
        </IconButton>
        <IconButton
          aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
          size="sm"
          colorScheme={isVideoOff ? 'red' : 'gray'}
          onClick={toggleVideo}
          borderRadius="full"
        >
          {isVideoOff ? <FiVideoOff /> : <FiVideo />}
        </IconButton>
        <IconButton
          aria-label="End call"
          size="sm"
          colorScheme="red"
          onClick={handleEndCall}
          borderRadius="full"
        >
          <FiPhone />
        </IconButton>
      </HStack>
      )}
    </Box>
  );
};

export default JitsiVideoToast;

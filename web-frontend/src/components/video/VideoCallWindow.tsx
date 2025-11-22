/**
 * VideoCallWindow Component
 * Floating video call UI using @jitsi/react-sdk with 8x8 Video authentication
 */

import React, { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { FaPhone, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import type { VideoCallSession } from '../../types/video.types';

interface VideoCallWindowProps {
  callSession: VideoCallSession;
  onAnswer: (callId: number) => void;
  onReject: (callId: number) => void;
  onEnd: (callId: number) => void;
}

/**
 * VideoCallWindow
 * Displays the video call interface
 * - Shows Answer/Decline buttons for incoming calls (status='pending')
 * - Shows active video call with @jitsi/react-sdk for active calls (status='active')
 * - Floating, draggable window with controls
 */
const VideoCallWindow: React.FC<VideoCallWindowProps> = ({
  callSession,
  onAnswer,
  onReject,
  onEnd,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const isPending = callSession.status === 'pending';
  const isActive = callSession.status === 'active';

  // Extract JWT token and room info from jitsi_url
  const { jwt_token, room_name, app_id, server_domain } = callSession.jitsi_url;

  /**
   * Handle answering an incoming call
   */
  const handleAnswer = () => {
    onAnswer(callSession.id);
  };

  /**
   * Handle rejecting an incoming call
   */
  const handleReject = () => {
    onReject(callSession.id);
  };

  /**
   * Handle ending an active call
   */
  const handleEnd = () => {
    onEnd(callSession.id);
  };

  return (
    <Box
      position="fixed"
      top="80px"
      right="20px"
      width="400px"
      height={isPending ? 'auto' : '600px'}
      bg="white"
      borderRadius="lg"
      boxShadow="2xl"
      zIndex={9999}
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Incoming Call UI */}
      {isPending && (
        <Box p={6}>
          <Box fontSize="xl" fontWeight="bold" mb={2}>
            Incoming Call
          </Box>
          <Box fontSize="md" mb={6} color="gray.600">
            {callSession.initiator_name} is calling you...
          </Box>
          <HStack gap={4}>
            <Button
              colorScheme="green"
              size="lg"
              flex={1}
              onClick={handleAnswer}
            >
              <FaPhone style={{ marginRight: '8px' }} />
              Answer
            </Button>
            <Button
              colorScheme="red"
              size="lg"
              flex={1}
              onClick={handleReject}
            >
              <FaPhoneSlash style={{ marginRight: '8px' }} />
              Decline
            </Button>
          </HStack>
        </Box>
      )}

      {/* Active Call UI */}
      {isActive && (
        <>
          {/* Video Container */}
          <Box height="540px" bg="black">
            <JitsiMeeting
              domain={server_domain}
              roomName={`${app_id}/${room_name}`}
              jwt={jwt_token}
              configOverwrite={{
                startWithAudioMuted: isMuted,
                startWithVideoMuted: isVideoOff,
                enableWelcomePage: false,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
              }}
              interfaceConfigOverwrite={{
                TOOLBAR_BUTTONS: [
                  'microphone',
                  'camera',
                  'hangup',
                  'desktop',
                  'fullscreen',
                  'fodeviceselection',
                  'chat',
                  'recording',
                  'tileview',
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '540px';
                iframeRef.style.width = '100%';
              }}
            />
          </Box>

          {/* Control Bar */}
          <HStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="60px"
            bg="gray.800"
            justifyContent="center"
            gap={4}
            px={4}
          >
            <IconButton
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              colorScheme={isMuted ? 'red' : 'gray'}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </IconButton>
            <IconButton
              aria-label={isVideoOff ? 'Enable Video' : 'Disable Video'}
              colorScheme={isVideoOff ? 'red' : 'gray'}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            </IconButton>
            <Button
              colorScheme="red"
              onClick={handleEnd}
            >
              <FaPhoneSlash style={{ marginRight: '8px' }} />
              End Call
            </Button>
          </HStack>
        </>
      )}
    </Box>
  );
};

export default VideoCallWindow;

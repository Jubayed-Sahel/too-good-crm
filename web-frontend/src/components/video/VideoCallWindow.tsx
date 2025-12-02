/**
 * VideoCallWindow Component
 * Floating video call UI using @jitsi/react-sdk with 8x8 Video authentication
 * Redesigned to match Too Good CRM theme
 */

import React, { useState, useRef, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Box, Button, HStack, IconButton, Text, VStack, Badge, Circle } from '@chakra-ui/react';
import { FaPhone, FaPhoneSlash, FaExpand, FaCompress, FaUser, FaGripVertical } from 'react-icons/fa';
import type { VideoCallSession } from '../../types/video.types';

interface VideoCallWindowProps {
  callSession: VideoCallSession;
  onAnswer: (callId: number) => void;
  onReject: (callId: number) => void;
  onEnd: (callId: number) => void;
  currentUserId?: number;
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
  currentUserId,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 440, y: 80 });
  const [size, setSize] = useState({ width: 420, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const isPending = callSession.status === 'pending';
  const isActive = callSession.status === 'active';
  const isDeclined = callSession.status === 'rejected' || callSession.status === 'cancelled';
  const isInitiator = currentUserId === callSession.initiator;
  
  // Get display name for the other party
  const otherPartyName = isInitiator 
    ? (callSession.recipient_name || 'User')
    : (callSession.initiator_name || 'User');

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ 
      x: e.clientX, 
      y: e.clientY, 
      width: size.width, 
      height: size.height 
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - (isMinimized ? 80 : size.height);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        // Min: 320x400, Max: 800x900
        const newWidth = Math.max(320, Math.min(800, resizeStart.width + deltaX));
        const newHeight = Math.max(400, Math.min(900, resizeStart.height + deltaY));
        
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, position, size, resizeStart, isMinimized]);

  // Extract JWT token and room info from jitsi_url
  // Handle error case where JWT generation failed
  const jitsiUrl = callSession.jitsi_url as any;
  const hasJwtError = jitsiUrl?.error;
  const jwt_token = jitsiUrl?.jwt_token || '';
  const room_name = jitsiUrl?.room_name || callSession.room_name;
  const app_id = jitsiUrl?.app_id || '';
  const server_domain = jitsiUrl?.server_domain || callSession.jitsi_server || '8x8.vc';

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
      ref={windowRef}
      position="fixed"
      left={`${position.x}px`}
      top={`${position.y}px`}
      width={isMinimized ? "320px" : `${size.width}px`}
      height={isPending ? 'auto' : (isMinimized ? '80px' : `${size.height}px`)}
      bg="white"
      borderRadius="xl"
      boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      zIndex={9999}
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      transition={isDragging || isResizing ? 'none' : 'width 0.3s ease-in-out, height 0.3s ease-in-out'}
      cursor={isDragging ? 'grabbing' : 'default'}
      onMouseDown={handleMouseDown}
    >
      {/* Calling/Incoming Call UI */}
      {isPending && (
        <Box 
          bgGradient="linear(to-br, purple.50, blue.50)" 
          p={8}
        >
          <VStack gap={6} align="stretch">
            {/* Avatar and Name */}
            <VStack gap={4}>
              <Circle
                size="100px"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                boxShadow="0 8px 16px rgba(102, 126, 234, 0.2)"
              >
                <FaUser size="40px" />
              </Circle>
              <VStack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  {otherPartyName}
                </Text>
                <Badge
                  colorPalette={isInitiator ? "orange" : "purple"}
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {isInitiator ? 'Calling...' : 'Incoming Call'}
                </Badge>
              </VStack>
            </VStack>

            {/* Action Buttons */}
            {isInitiator ? (
              <Button
                bg="red.500"
                color="white"
                size="lg"
                height="56px"
                borderRadius="xl"
                fontSize="md"
                fontWeight="bold"
                onClick={handleEnd}
                _hover={{
                  bg: 'red.600',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)',
                }}
                transition="all 0.2s"
              >
                <FaPhoneSlash style={{ marginRight: '8px' }} />
                Cancel Call
              </Button>
            ) : (
              <HStack gap={3}>
                <Button
                  bg="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  color="white"
                  size="lg"
                  height="56px"
                  flex={1}
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="bold"
                  onClick={handleAnswer}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)',
                  }}
                  transition="all 0.2s"
                >
                  <FaPhone style={{ marginRight: '8px' }} />
                  Answer
                </Button>
                <Button
                  bg="red.500"
                  color="white"
                  size="lg"
                  height="56px"
                  flex={1}
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="bold"
                  onClick={handleReject}
                  _hover={{
                    bg: 'red.600',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)',
                  }}
                  transition="all 0.2s"
                >
                  <FaPhoneSlash style={{ marginRight: '8px' }} />
                  Decline
                </Button>
              </HStack>
            )}
          </VStack>
        </Box>
      )}

      {/* Call Declined UI */}
      {isDeclined && (
        <Box 
          bgGradient="linear(to-br, red.50, orange.50)" 
          p={8}
        >
          <VStack gap={6} align="stretch">
            <VStack gap={4}>
              <Circle
                size="80px"
                bg="red.100"
                color="red.600"
              >
                <FaPhoneSlash size="32px" />
              </Circle>
              <VStack gap={2}>
                <Text fontSize="xl" fontWeight="bold" color="red.600">
                  Call Declined
                </Text>
                <Text fontSize="md" color="gray.600" textAlign="center">
                  {isInitiator 
                    ? `${callSession.recipient_name || 'User'} declined the call.`
                    : 'You declined the call.'
                  }
                </Text>
              </VStack>
            </VStack>
            <Button
              bg="gray.100"
              color="gray.700"
              size="lg"
              height="48px"
              borderRadius="xl"
              onClick={handleEnd}
              _hover={{
                bg: 'gray.200',
              }}
            >
              Close
            </Button>
          </VStack>
        </Box>
      )}

      {/* Active Call UI */}
      {isActive && (
        <>
          {/* Header Bar with Drag Handle */}
          {!isMinimized && (
            <HStack
              className="drag-handle"
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="56px"
              bgGradient="linear(to-b, rgba(0,0,0,0.8), transparent)"
              backdropFilter="blur(10px)"
              px={6}
              justifyContent="space-between"
              zIndex={10}
              cursor="grab"
              _active={{ cursor: 'grabbing' }}
            >
              <HStack gap={3}>
                <FaGripVertical color="rgba(255,255,255,0.5)" />
                <Circle size="10px" bg="green.400" />
                <Text color="white" fontWeight="semibold" fontSize="sm">
                  {otherPartyName}
                </Text>
              </HStack>
              <Badge colorPalette="green" variant="solid" px={2} py={1} borderRadius="md">
                Active
              </Badge>
            </HStack>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <HStack
              className="drag-handle"
              height="80px"
              px={6}
              justifyContent="space-between"
              align="center"
              bg="gray.900"
              cursor="grab"
              _active={{ cursor: 'grabbing' }}
            >
              <HStack gap={3}>
                <FaGripVertical color="rgba(255,255,255,0.3)" />
                <Circle size="40px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
                  <FaUser size="16px" />
                </Circle>
                <VStack align="start" gap={0}>
                  <Text color="white" fontWeight="semibold" fontSize="sm">
                    {otherPartyName}
                  </Text>
                  <HStack gap={2}>
                    <Circle size="6px" bg="green.400" />
                    <Text color="gray.400" fontSize="xs">
                      Active call
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
              <IconButton
                aria-label="Expand"
                bg="whiteAlpha.200"
                color="white"
                size="sm"
                borderRadius="full"
                onClick={() => setIsMinimized(false)}
                _hover={{
                  bg: 'whiteAlpha.300',
                }}
              >
                <FaExpand />
              </IconButton>
            </HStack>
          )}

          {/* Video Container */}
          {!isMinimized && (
            <Box 
              height={`${size.height}px`}
              bg="black" 
              position="relative"
            >
            {hasJwtError ? (
              <Box
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                p={6}
                textAlign="center"
                color="white"
              >
                <Box fontSize="xl" fontWeight="bold" mb={2}>
                  Video Call Active
                </Box>
                <Box fontSize="md" mb={4} color="gray.300">
                  {callSession.recipient_name || callSession.initiator_name}
                </Box>
                <Box fontSize="sm" color="red.300" mb={4}>
                  Video interface unavailable: {jitsiUrl.error}
                </Box>
                <Box fontSize="xs" color="gray.400">
                  The call is active but video streaming is not configured.
                  Please contact your administrator to set up the video service.
                </Box>
              </Box>
            ) : (
              <Box height="100%" width="100%" position="relative">
                <JitsiMeeting
                  domain={server_domain}
                  roomName={`${app_id}/${room_name}`}
                  jwt={jwt_token}
                  configOverwrite={{
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
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
                    DISABLE_VIDEO_BACKGROUND: true,
                  }}
                  // Automatically start server-side recording when call starts
                  // Recording will be saved on the server (8x8 Video cloud or your Jibri server)
                  // Only the initiator (moderator) should start recording to avoid duplicates
                  onApiReady={(externalApi) => {
                    externalApi.addEventListener('videoConferenceJoined', () => {
                      // Only start recording if user is the initiator (moderator)
                      // This prevents multiple participants from starting separate recordings
                      if (isInitiator) {
                        try {
                          // Try server-side recording first (saves on server)
                          externalApi.executeCommand('startRecording', {
                            mode: 'file', // Server-side recording mode
                          });
                          // eslint-disable-next-line no-console
                          console.log('Server-side recording started');
                        } catch (e) {
                          // If server-side recording fails, try local recording as fallback
                          try {
                            externalApi.executeCommand('startRecording', {
                              mode: 'local', // Local recording fallback
                            });
                            // eslint-disable-next-line no-console
                            console.warn('Server-side recording not available, using local recording', e);
                          } catch (localError) {
                            // eslint-disable-next-line no-console
                            console.warn('Failed to start any recording', localError);
                          }
                        }
                      }
                    });

                    externalApi.addEventListener('recordingStatusChanged', (status: any) => {
                      // eslint-disable-next-line no-console
                      console.log('Recording status changed:', status);
                      // If recording stopped and we have a URL, we could upload it here
                      // But server-side recordings are handled by 8x8/Jitsi server
                    });

                    externalApi.addEventListener('readyToClose', () => {
                      if (isInitiator) {
                        try {
                          externalApi.executeCommand('stopRecording', {
                            mode: 'file',
                          });
                          // eslint-disable-next-line no-console
                          console.log('Server-side recording stopped');
                        } catch (e) {
                          try {
                            externalApi.executeCommand('stopRecording', {
                              mode: 'local',
                            });
                          } catch (localError) {
                            // eslint-disable-next-line no-console
                            console.warn('Failed to stop recording', localError);
                          }
                        }
                      }
                    });
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                  }}
                  onReadyToClose={() => {
                    handleEnd();
                  }}
                />
              </Box>
            )}
            
            {/* Minimize Button Overlay */}
            <IconButton
              aria-label="Minimize"
              position="absolute"
              top={3}
              right={3}
              bg="blackAlpha.700"
              color="white"
              size="sm"
              borderRadius="full"
              onClick={() => setIsMinimized(true)}
              _hover={{
                bg: 'blackAlpha.800',
                transform: 'scale(1.1)',
              }}
              transition="all 0.2s"
              zIndex={10}
            >
              <FaCompress />
            </IconButton>

            {/* Resize Handle */}
            <Box
              position="absolute"
              bottom={0}
              right={0}
              width="20px"
              height="20px"
              cursor="nwse-resize"
              onMouseDown={handleResizeMouseDown}
              zIndex={11}
              _hover={{
                bg: 'whiteAlpha.200',
              }}
            >
              <Box
                position="absolute"
                bottom="2px"
                right="2px"
                width="12px"
                height="12px"
                borderRight="3px solid rgba(255,255,255,0.5)"
                borderBottom="3px solid rgba(255,255,255,0.5)"
              />
            </Box>
          </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default VideoCallWindow;

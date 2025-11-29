/**
 * Voice-Enabled Gemini Chat Component
 * Integrates Web Speech API for voice input and text-to-speech for voice output
 * 
 * Features:
 * - Voice input with real-time transcript display
 * - Automatic sending of recognized speech
 * - Text-to-speech for bot responses
 * - Language selection (English, Bengali, etc.)
 * - Fallback UI for unsupported browsers
 */

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Spinner,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import CustomSelect from '@/components/ui/CustomSelect';
import { 
  FiSend, 
  FiRefreshCw, 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiVolumeX,
  FiSettings,
} from 'react-icons/fi';
import { useGemini } from '@/hooks/useGemini';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface VoiceGeminiChatWindowProps {
  /** Auto-speak bot responses */
  autoSpeak?: boolean;
  /** Default language */
  defaultLanguage?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'bn-BD', label: 'Bengali', flag: '🇧🇩' },
  { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es-ES', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'French', flag: '🇫🇷' },
  { code: 'de-DE', label: 'German', flag: '🇩🇪' },
  { code: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
];

export const VoiceGeminiChatWindow: React.FC<VoiceGeminiChatWindowProps> = ({
  autoSpeak = true,
  defaultLanguage = 'en-US',
}) => {
  const { messages, isLoading, isStreaming, error, status, sendMessage, clearMessages } = useGemini();
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(autoSpeak);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string>('');

  // Speech-to-Text hook
  const {
    isListening,
    transcript,
    finalTranscript,
    interimTranscript,
    isSupported: isSpeechRecognitionSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage: setSpeechLanguage,
  } = useSpeechToText({
    lang: selectedLanguage,
    interimResults: true,
    continuous: false,
    onTranscript: (text) => {
      // Automatically send message when speech is finalized
      if (text.trim()) {
        handleVoiceInput(text);
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
    },
  });

  // Text-to-Speech hook
  const {
    isSpeaking,
    isSupported: isSpeechSynthesisSupported,
    voices,
    selectedVoice,
    speak,
    cancel: cancelSpeech,
    setLanguage: setSpeechSynthesisLanguage,
    setVoice,
  } = useTextToSpeech({
    lang: selectedLanguage,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update interim transcript to input field
  useEffect(() => {
    if (isListening && interimTranscript) {
      setInput(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  // Auto-speak bot responses
  useEffect(() => {
    if (!autoSpeakEnabled || !isSpeechSynthesisSupported) {
      return;
    }

    // Find the last assistant message
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'assistant' && !msg.isStreaming);

    if (lastAssistantMessage && 
        lastAssistantMessage.id !== lastSpokenMessageId && 
        lastAssistantMessage.content.trim()) {
      
      // Speak the message
      speak(lastAssistantMessage.content);
      setLastSpokenMessageId(lastAssistantMessage.id);
    }
  }, [messages, autoSpeakEnabled, isSpeechSynthesisSupported, speak, lastSpokenMessageId]);

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setSpeechLanguage(lang);
    setSpeechSynthesisLanguage(lang);
    
    // Auto-select voice for new language
    const voiceForLang = voices.find(v => v.lang === lang) || 
                        voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (voiceForLang) {
      setVoice(voiceForLang.name);
    }
  };

  // Handle voice input
  const handleVoiceInput = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setInput('');
    resetTranscript();
    await sendMessage(text);
  };

  // Handle text input send
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const textToSend = input;
    setInput('');
    resetTranscript();
    await sendMessage(textToSend);
  };

  // Toggle voice recording
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      // If we have text, send it
      if (input.trim()) {
        handleVoiceInput(input);
      }
    } else {
      setInput('');
      resetTranscript();
      startListening();
    }
  };

  // Toggle auto-speak
  const handleToggleAutoSpeak = () => {
    if (isSpeaking) {
      cancelSpeech();
    }
    setAutoSpeakEnabled(!autoSpeakEnabled);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend();
    }
  };

  return (
    <Box
      flex={1}
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Header */}
      <Box p={4} borderBottomWidth="1px" borderColor="gray.200">
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <HStack>
              <Text fontSize="xl" fontWeight="bold">
                🎤 Voice AI Assistant
              </Text>
              {status?.available && (
                <Badge colorScheme="green" fontSize="xs">
                  ● Online
                </Badge>
              )}
              {isListening && (
                <Badge colorScheme="red" fontSize="xs">
                  ● Recording
                </Badge>
              )}
              {isSpeaking && (
                <Badge colorScheme="purple" fontSize="xs">
                  🔊 Speaking
                </Badge>
              )}
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Powered by Gemini + Web Speech API
            </Text>
          </VStack>
          <HStack gap={2}>
            {/* Language Selector */}
            <CustomSelect
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={SUPPORTED_LANGUAGES.map(lang => ({
                value: lang.code,
                label: `${lang.flag} ${lang.label}`,
              }))}
              width="auto"
              minWidth="140px"
              height="32px"
            />

            {/* Auto-Speak Toggle */}
            {isSpeechSynthesisSupported && (
              <Tooltip content={autoSpeakEnabled ? 'Auto-speak enabled' : 'Auto-speak disabled'}>
                <IconButton
                  size="sm"
                  variant={autoSpeakEnabled ? 'solid' : 'outline'}
                  colorScheme={autoSpeakEnabled ? 'purple' : 'gray'}
                  onClick={handleToggleAutoSpeak}
                  aria-label="Toggle auto-speak"
                >
                  {autoSpeakEnabled ? <FiVolume2 /> : <FiVolumeX />}
                </IconButton>
              </Tooltip>
            )}

            {/* Clear Chat */}
            {messages.length > 0 && (
              <Tooltip content="Clear chat">
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={clearMessages}
                  aria-label="Clear chat"
                >
                  <FiRefreshCw />
                </IconButton>
              </Tooltip>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Browser Support Warnings */}
      {(!isSpeechRecognitionSupported || !isSpeechSynthesisSupported) && (
        <Box p={4} bg="orange.50" borderBottomWidth="1px" borderColor="orange.200">
          <HStack gap={2} align="start">
            <Text fontSize="lg">⚠️</Text>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="semibold" mb={1}>Limited Browser Support</Text>
              <Text fontSize="xs" color="orange.800">
                {!isSpeechRecognitionSupported && (
                  <>Voice input is not supported in this browser. Please use Chrome, Edge, or Safari. </>
                )}
                {!isSpeechSynthesisSupported && (
                  <>Voice output is not supported in this browser.</>
                )}
              </Text>
            </Box>
          </HStack>
        </Box>
      )}

      {/* Messages Area */}
      <Box flex={1} overflowY="auto" p={4} bg="white">
        {!status?.available && (
          <Box p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200" mb={4}>
            <HStack gap={2} align="start">
              <Text fontSize="lg">⚠️</Text>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="orange.900" mb={1}>AI Assistant Unavailable</Text>
                <Text fontSize="xs" color="orange.800">
                  Please check your Gemini API configuration.
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {error && (
          <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200" mb={4}>
            <HStack gap={2} align="start">
              <Text fontSize="lg">❌</Text>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="red.900" mb={1}>Error</Text>
                <Text fontSize="xs" color="red.800">{error}</Text>
              </Box>
            </HStack>
          </Box>
        )}

        {speechError && (
          <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200" mb={4}>
            <HStack gap={2} align="start">
              <Text fontSize="lg">🎤</Text>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="red.900" mb={1}>Voice Recognition Error</Text>
                <Text fontSize="xs" color="red.800">{speechError}</Text>
              </Box>
            </HStack>
          </Box>
        )}

        {messages.length === 0 && !error && (
          <VStack justify="center" py={12} gap={4}>
            <Text fontSize="6xl">🎤</Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.600">
              Hi! I'm your Voice-Enabled AI Assistant
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center" maxW="500px">
              Click the microphone button to speak, or type your message. 
              I'll respond with both text and voice.
            </Text>
            <VStack align="stretch" gap={2} mt={4} w="full" maxW="400px">
              <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                Try asking:
              </Text>
              <Box
                p={2}
                bg="gray.50"
                borderRadius="md"
                fontSize="sm"
                color="gray.700"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => setInput('Show me my customer statistics')}
              >
                🎤 "Show me my customer statistics"
              </Box>
              <Box
                p={2}
                bg="gray.50"
                borderRadius="md"
                fontSize="sm"
                color="gray.700"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => setInput('List all high-priority leads')}
              >
                🎤 "List all high-priority leads"
              </Box>
              <Box
                p={2}
                bg="gray.50"
                borderRadius="md"
                fontSize="sm"
                color="gray.700"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => setInput('What are my open deals?')}
              >
                🎤 "What are my open deals?"
              </Box>
            </VStack>
          </VStack>
        )}

        <VStack align="stretch" gap={3}>
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
              maxW="75%"
            >
              {message.role === 'assistant' && (
                <HStack gap={1} mb={1} ml={1}>
                  <Text fontSize="sm">🤖</Text>
                  <Text fontSize="xs" fontWeight="semibold" color="purple.600">
                    AI Assistant
                  </Text>
                  {isSpeaking && lastSpokenMessageId === message.id && (
                    <Badge colorScheme="purple" fontSize="xs">
                      🔊 Speaking
                    </Badge>
                  )}
                </HStack>
              )}
              <Box
                p={3}
                borderRadius="lg"
                bg={message.role === 'user' ? 'purple.500' : 'gray.100'}
                color={message.role === 'user' ? 'white' : 'gray.900'}
              >
                <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.5">
                  {message.content}
                  {message.isStreaming && (
                    <Box as="span" ml={1} display="inline-block" animation="pulse 1.5s infinite">
                      ▋
                    </Box>
                  )}
                </Text>
                <HStack justify="space-between" mt={1.5}>
                  <Text 
                    fontSize="xs" 
                    opacity={0.6}
                    color={message.role === 'user' ? 'whiteAlpha.900' : 'gray.600'}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {message.role === 'assistant' && !message.isStreaming && isSpeechSynthesisSupported && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        if (isSpeaking && lastSpokenMessageId === message.id) {
                          cancelSpeech();
                        } else {
                          speak(message.content);
                          setLastSpokenMessageId(message.id);
                        }
                      }}
                      aria-label={isSpeaking && lastSpokenMessageId === message.id ? 'Stop speaking' : 'Speak message'}
                      title={isSpeaking && lastSpokenMessageId === message.id ? 'Stop speaking' : 'Speak message'}
                    >
                      {isSpeaking && lastSpokenMessageId === message.id ? <FiVolumeX /> : <FiVolume2 />}
                    </IconButton>
                  )}
                </HStack>
              </Box>
            </Box>
          ))}
        </VStack>

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box 
        p={4} 
        borderTopWidth="1px" 
        borderColor="gray.200"
        bg="white"
      >
        <VStack align="stretch" gap={2}>
          {/* Voice Recording Indicator */}
          {isListening && (
            <HStack 
              p={3} 
              bg="red.50" 
              borderRadius="lg" 
              borderWidth="2px" 
              borderColor="red.400"
              animation="pulse 2s infinite"
            >
              <Box 
                w="10px" 
                h="10px" 
                borderRadius="full" 
                bg="red.500"
                animation="pulse 1s infinite"
              />
              <Text fontSize="sm" fontWeight="medium" color="red.700">
                Listening... Speak now
              </Text>
              <Text fontSize="xs" color="red.600" ml="auto">
                Click mic to stop
              </Text>
            </HStack>
          )}

          <HStack align="flex-end" gap={3}>
            {/* Voice Button */}
            {isSpeechRecognitionSupported && (
              <Tooltip 
                content={isListening ? 'Stop recording' : 'Start voice input'}
                positioning={{ placement: 'top' }}
              >
                <IconButton
                  size="lg"
                  colorScheme={isListening ? 'red' : 'purple'}
                  variant={isListening ? 'solid' : 'outline'}
                  onClick={handleVoiceToggle}
                  disabled={isLoading || !status?.available}
                  aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                  h="44px"
                  minW="44px"
                >
                  {isListening ? <FiMicOff /> : <FiMic />}
                </IconButton>
              </Tooltip>
            )}

            {/* Text Input */}
            <Textarea
              placeholder={
                isListening 
                  ? 'Listening...' 
                  : isSpeechRecognitionSupported 
                    ? 'Click 🎤 to speak, or type here...'
                    : 'Type your message...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              minH="44px"
              maxH="120px"
              resize="vertical"
              disabled={isLoading || !status?.available || isListening}
              bg={isListening ? 'red.50' : 'white'}
              borderWidth="1px"
              borderColor={isListening ? 'red.400' : 'gray.300'}
              borderRadius="lg"
              _hover={{ borderColor: isListening ? 'red.500' : 'purple.400' }}
              _focus={{ 
                borderColor: isListening ? 'red.500' : 'purple.500', 
                boxShadow: `0 0 0 1px var(--chakra-colors-${isListening ? 'red' : 'purple'}-500)`,
                outline: 'none'
              }}
              _disabled={{ bg: 'gray.100', cursor: 'not-allowed' }}
              fontSize="sm"
              px={4}
              py={3}
              flex={1}
            />

            {/* Send Button */}
            <Button
              colorPalette="purple"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !status?.available || isListening}
              loading={isLoading}
              size="md"
              px={5}
              h="44px"
              minW="80px"
            >
              {isStreaming ? (
                <Spinner size="sm" />
              ) : (
                <HStack gap={2}>
                  <FiSend />
                  <Text>Send</Text>
                </HStack>
              )}
            </Button>
          </HStack>

          {/* Status Messages */}
          {isStreaming && (
            <HStack gap={2} fontSize="xs" color="purple.600" pl={1}>
              <Spinner size="xs" />
              <Text fontWeight="medium">AI is typing...</Text>
            </HStack>
          )}
          {!isStreaming && !isListening && (
            <Text fontSize="xs" color="gray.500" pl={1}>
              💡 {isSpeechRecognitionSupported ? 'Click 🎤 to speak or' : ''} Press Ctrl+Enter to send
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

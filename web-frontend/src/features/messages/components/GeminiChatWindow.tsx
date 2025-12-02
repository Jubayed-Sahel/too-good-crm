/**
 * Gemini AI Assistant Chat Window
 * Displays AI chat interface with streaming responses
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
} from '@chakra-ui/react';
import { FiSend, FiRefreshCw } from 'react-icons/fi';
import { useGemini } from '../hooks/useGemini';

export const GeminiChatWindow = () => {
  const { messages, isLoading, isStreaming, error, status, sendMessage, clearMessages } = useGemini();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
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
                🤖 AI Assistant
              </Text>
              {status?.available && (
                <Text fontSize="xs" color="green.500" fontWeight="medium">
                  ● Online
                </Text>
              )}
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Powered by Gemini - Ask me anything about your CRM data
            </Text>
          </VStack>
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiRefreshCw />}
              onClick={clearMessages}
            >
              Clear Chat
            </Button>
          )}
        </HStack>
      </Box>

      {/* Messages Area */}
      <Box flex={1} overflowY="auto" p={4} bg="white">
        {!status?.available && (
          <Box
            p={4}
            bg="orange.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="orange.200"
          >
            <Text color="orange.800" fontSize="sm">
              ⚠️ AI Assistant is not available. Please check your Gemini API configuration.
            </Text>
          </Box>
        )}

        {error && (
          <Box
            p={4}
            bg="red.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="red.200"
            mb={4}
          >
            <Text color="red.800" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        {messages.length === 0 && !error && (
          <VStack justify="center" py={12} gap={4}>
            <Text fontSize="6xl">🤖</Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.600">
              Hi! I'm your CRM AI Assistant
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center" maxW="400px">
              Ask me anything about your customers, leads, deals, issues, or get analytics reports.
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
                • "Show me my customer statistics"
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
                • "List all high-priority leads"
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
                <Text 
                  fontSize="xs" 
                  opacity={0.6} 
                  mt={1.5}
                  color={message.role === 'user' ? 'whiteAlpha.900' : 'gray.600'}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
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
          <HStack align="flex-end" gap={3}>
            <Textarea
              placeholder="Ask me anything about your CRM..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              minH="44px"
              maxH="120px"
              resize="vertical"
              disabled={isLoading || !status?.available}
              bg="white"
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="lg"
              _hover={{ borderColor: 'purple.400' }}
              _focus={{ 
                borderColor: 'purple.500', 
                boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                outline: 'none'
              }}
              _disabled={{ bg: 'gray.100', cursor: 'not-allowed' }}
              fontSize="sm"
              px={4}
              py={3}
              flex={1}
            />
            <Button
              colorPalette="purple"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !status?.available}
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
          {isStreaming && (
            <HStack gap={2} fontSize="xs" color="purple.600" pl={1}>
              <Spinner size="xs" />
              <Text fontWeight="medium">AI is typing...</Text>
            </HStack>
          )}
          {!isStreaming && (
            <Text fontSize="xs" color="gray.500" pl={1}>
              💡 Press Ctrl+Enter to send
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};


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
import { useGemini } from '@/hooks/useGemini';

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
      h="calc(100vh - 200px)"
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
      <Box flex={1} overflowY="auto" p={4}>
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
                • "What are my open deals?"
              </Box>
            </VStack>
          </VStack>
        )}

        <VStack align="stretch" gap={4}>
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
              maxW="80%"
            >
              <Box
                p={3}
                borderRadius="lg"
                bg={message.role === 'user' ? 'purple.500' : 'gray.100'}
                color={message.role === 'user' ? 'white' : 'gray.900'}
              >
                {message.role === 'assistant' && (
                  <Text fontSize="xs" fontWeight="semibold" mb={1} opacity={0.7}>
                    AI Assistant
                  </Text>
                )}
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {message.content}
                  {message.isStreaming && (
                    <Box as="span" ml={1} display="inline-block" animation="pulse 1.5s infinite">
                      ▋
                    </Box>
                  )}
                </Text>
                <Text fontSize="xs" opacity={0.7} mt={1}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Box>
            </Box>
          ))}
        </VStack>

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box p={4} borderTopWidth="1px" borderColor="gray.200">
        <VStack align="stretch" gap={2}>
          <HStack align="end" gap={2}>
            <Textarea
              placeholder="Ask me anything about your CRM..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
              resize="none"
              disabled={isLoading || !status?.available}
            />
            <Button
              colorPalette="purple"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !status?.available}
              loading={isLoading}
              leftIcon={isStreaming ? <Spinner size="sm" /> : <FiSend />}
              h="full"
            >
              Send
            </Button>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Press Ctrl+Enter to send
            {isStreaming && ' • AI is typing...'}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};


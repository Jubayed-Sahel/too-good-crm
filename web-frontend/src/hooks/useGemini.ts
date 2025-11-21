/**
 * Gemini AI Hook
 * React hook for interacting with Gemini AI assistant
 */

import { useState, useCallback, useEffect } from 'react';
import { geminiService } from '@/services/gemini.service';
import type { GeminiMessage, GeminiStatusResponse } from '@/types/gemini.types';

export interface UseGeminiReturn {
  messages: GeminiMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  status: GeminiStatusResponse | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  checkStatus: () => Promise<void>;
}

export function useGemini(): UseGeminiReturn {
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<GeminiStatusResponse | null>(null);

  // Check Gemini service status on mount
  const checkStatus = useCallback(async () => {
    try {
      const statusData = await geminiService.checkStatus();
      setStatus(statusData);
    } catch (err) {
      console.error('Error checking Gemini status:', err);
      setError('Failed to check Gemini service status');
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: GeminiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: GeminiMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(true);

    try {
      // Build conversation history
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Stream the response
      for await (const event of geminiService.streamChat({
        message: content.trim(),
        history,
      })) {
        if (event.type === 'message' && event.content) {
          // Append to assistant message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + event.content }
                : msg
            )
          );
        } else if (event.type === 'error') {
          setError(event.error || 'An error occurred');
          break;
        } else if (event.type === 'completed') {
          // Mark streaming as complete
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          break;
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    status,
    sendMessage,
    clearMessages,
    checkStatus,
  };
}


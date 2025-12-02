/**
 * Gemini AI Service
 * Handles communication with Gemini AI backend
 */

import { api } from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { GeminiChatRequest, GeminiStatusResponse, GeminiStreamEvent } from '@/types/gemini.types';

const GEMINI_BASE_URL = '/api/gemini';

// Get API base URL - use environment variable or default to empty for relative URLs
const getApiBaseUrl = (): string => {
  // Check for VITE_API_URL first (legacy support)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use API_CONFIG BASE_URL if set
  if (API_CONFIG.BASE_URL) {
    return API_CONFIG.BASE_URL;
  }
  // Default to empty string for relative URLs (uses same origin)
  return '';
};

export const geminiService = {
  /**
   * Check Gemini service status
   */
  async checkStatus(): Promise<GeminiStatusResponse> {
    try {
      return await api.get<GeminiStatusResponse>(`${GEMINI_BASE_URL}/status/`);
    } catch (error) {
      console.error('Failed to check Gemini status:', error);
      throw new Error('Failed to connect to Gemini service. Please ensure the backend server is running.');
    }
  },

  /**
   * Stream chat with Gemini AI
   * Returns an async iterator for Server-Sent Events
   */
  async* streamChat(request: GeminiChatRequest): AsyncGenerator<GeminiStreamEvent> {
    // Try JWT token first, fallback to legacy token
    const jwtToken = localStorage.getItem('accessToken');
    const legacyToken = localStorage.getItem('authToken');
    const token = jwtToken || legacyToken;
    
    if (!token) {
      throw new Error('Not authenticated. Please log in to use the AI assistant.');
    }

    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}${GEMINI_BASE_URL}/chat/`;
    
    console.log('Gemini API URL:', url);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : `Token ${legacyToken}`,
        },
        body: JSON.stringify(request),
      });
    } catch (error) {
      // Network error (fetch failed)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Failed to connect to backend server. Please ensure the server is running at ${apiBaseUrl || window.location.origin}.`);
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      let buffer = '';
      console.log('🎯 Starting SSE stream...');
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ SSE stream completed');
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Split by double newline to handle complete events
        const events = buffer.split('\n\n');
        
        // Keep the last incomplete event in the buffer
        buffer = events.pop() || '';
        
        for (const event of events) {
          const lines = event.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring(6).trim();
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  console.log('📨 SSE Event:', data.type, data.content?.substring(0, 50));
                  yield data as GeminiStreamEvent;
                }
              } catch (e) {
                console.error('❌ Error parsing SSE data:', line, e);
              }
            }
          }
        }
      }
      
      // Process any remaining buffered data
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                console.log('📨 SSE Event (final):', data.type);
                yield data as GeminiStreamEvent;
              }
            } catch (e) {
              console.error('❌ Error parsing final SSE data:', line, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ SSE stream error:', error);
      throw error;
    } finally {
      reader.releaseLock();
      console.log('🔒 SSE reader released');
    }
  },

  /**
   * Send a chat message and get the complete response (non-streaming)
   */
  async chat(request: GeminiChatRequest): Promise<string> {
    const chunks: string[] = [];
    
    for await (const event of this.streamChat(request)) {
      if (event.type === 'message' && event.content) {
        chunks.push(event.content);
      } else if (event.type === 'error') {
        throw new Error(event.error || 'Unknown error');
      }
    }
    
    return chunks.join('');
  },

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<any> {
    return await api.get(`${GEMINI_BASE_URL}/conversations/${conversationId}/`);
  },

  /**
   * List all conversations for current user
   */
  async listConversations(): Promise<any[]> {
    return await api.get(`${GEMINI_BASE_URL}/conversations/`);
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`${GEMINI_BASE_URL}/conversations/${conversationId}/`);
  },
};


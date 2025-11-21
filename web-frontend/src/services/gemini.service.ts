/**
 * Gemini AI Service
 * Handles communication with Gemini AI backend
 */

import { api } from '@/lib/apiClient';
import type { GeminiChatRequest, GeminiStatusResponse, GeminiStreamEvent } from '@/types/gemini.types';

const GEMINI_BASE_URL = '/api/gemini';

export const geminiService = {
  /**
   * Check Gemini service status
   */
  async checkStatus(): Promise<GeminiStatusResponse> {
    return await api.get<GeminiStatusResponse>(`${GEMINI_BASE_URL}/status/`);
  },

  /**
   * Stream chat with Gemini AI
   * Returns an async iterator for Server-Sent Events
   */
  async* streamChat(request: GeminiChatRequest): AsyncGenerator<GeminiStreamEvent> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${GEMINI_BASE_URL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Split by newlines to handle multiple events
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              yield data as GeminiStreamEvent;
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
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
};


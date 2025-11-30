/**
 * Gemini AI Assistant Types
 */

export interface GeminiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface GeminiConversation {
  id: string;
  messages: GeminiMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeminiChatRequest {
  message: string;
  conversation_id?: string;
  history?: Array<{
    role: string;
    content: string;
  }>;
}

export interface GeminiStatusResponse {
  available: boolean;
  model: string;
  api_key_configured: boolean;
  user_context: {
    user_id: number;
    organization_id: number;
    role: string;
    permissions_count: number;
  } | null;
}

export interface GeminiStreamEvent {
  type: 'connected' | 'message' | 'completed' | 'error';
  content?: string;
  error?: string;
  conversation_id?: string;
}


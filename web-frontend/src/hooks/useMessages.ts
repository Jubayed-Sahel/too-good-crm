/**
 * Messages Hook with Pusher Real-Time Integration
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import api from '@/lib/apiClient';
import { usePusherChannel } from './usePusher';
import { useAuth } from './useAuth';

export interface Message {
  id: number;
  sender: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  recipient: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  content: string;
  subject?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  organization?: number;
  related_lead?: number;
  related_deal?: number;
  related_customer?: number;
  attachments?: any[];
}

export interface Conversation {
  id: number;
  participant1: any;
  participant2: any;
  other_participant: any;
  last_message?: Message;
  last_message_at?: string;
  unread_count: number;
  organization?: number;
}

export interface SendMessageData {
  recipient_id: number;
  content: string;
  subject?: string;
  related_lead_id?: number;
  related_deal_id?: number;
  related_customer_id?: number;
  attachments?: any[];
}

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await api.get<Message[]>('/api/messages/');
      return response;
    },
    enabled: !!user,
  });
  
  // Subscribe to real-time updates via Pusher
  usePusherChannel(
    user ? `private-user-${user.id}` : null,
    'new-message',
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message-unread-count'] });
    }, [queryClient])
  );
  
  return messagesQuery;
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendMessageData) => 
      api.post<Message>('/api/messages/send/', data),
    onSuccess: async (newMessage, variables) => {
      // Instead of optimistic update, just refetch everything from server
      // This ensures we get the complete message history without losing any messages
      await queryClient.refetchQueries({ 
        queryKey: ['messages', 'with-user', variables.recipient_id],
        exact: true 
      });
      
      // Also refetch conversations to update last message
      await queryClient.refetchQueries({ queryKey: ['conversations'] });
      
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: ['message-unread-count'] });
    },
  });
};

export const useRecipients = () => {
  return useQuery({
    queryKey: ['message-recipients'],
    queryFn: async () => {
      const response = await api.get<any[]>('/api/messages/recipients/');
      return response;
    },
  });
};

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      console.log('🔍 Fetching conversations...');
      try {
        const response = await api.get<Conversation[] | { results: Conversation[] }>('/api/conversations/');
        console.log('📨 Conversations response:', response);
        
        // Handle paginated response or direct array
        if (Array.isArray(response)) {
          console.log(`✅ Loaded ${response.length} conversations (array format)`);
          return response;
        }
        if (response && typeof response === 'object' && 'results' in response) {
          const conversations = (response as { results: Conversation[] }).results;
          console.log(`✅ Loaded ${conversations.length} conversations (paginated format)`);
          return conversations;
        }
        console.warn('⚠️ Unexpected response format:', response);
        return [];
      } catch (error: any) {
        console.error('❌ Error loading conversations:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Never refetch on mount
    refetchOnReconnect: false, // Never refetch on reconnect
    refetchOnWindowFocus: false, // Never refetch on window focus
    refetchInterval: 10000, // Poll every 10 seconds (reduced from 5s to minimize API calls)
  });
  
  // Subscribe to real-time conversation updates
  usePusherChannel(
    user ? `private-user-${user.id}` : null,
    'new-message',
    () => {
      console.log('🔄 Invalidating conversations due to new message');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  );
  
  usePusherChannel(
    user ? `private-user-${user.id}` : null,
    'conversation-updated',
    () => {
      console.log('🔄 Invalidating conversations due to conversation update');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  );
  
  return conversationsQuery;
};

// AI Assistant constant
const AI_ASSISTANT_ID = -1;

export const useMessagesWithUser = (userId: number | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const messagesQuery = useQuery({
    queryKey: ['messages', 'with-user', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('⏭️ Skipping message fetch - no userId');
        return [];
      }
      
      console.log(`🔍 Fetching messages for user ${userId}...`);
      
      try {
        const response = await api.get<Message[]>(`/api/messages/with_user/?user_id=${userId}`);
        console.log(`✅ Successfully loaded ${response?.length || 0} messages for user ${userId}`);
        
        if (response && Array.isArray(response)) {
          console.log('📦 Message data sample:', response.slice(0, 2));
          return response;
        }
        
        console.warn('⚠️ Response is not an array:', response);
        return [];
      } catch (error: any) {
        console.error('❌ Error loading messages:', {
          userId,
          error: error.message,
          status: error.status,
          response: error.response?.data,
        });
        // Throw error to show error state in UI
        throw error;
      }
    },
    enabled: !!userId && userId !== AI_ASSISTANT_ID,
    retry: 2,
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Never refetch on mount
    refetchOnReconnect: false, // Never refetch on reconnect
    refetchOnWindowFocus: false, // Never refetch on window focus
    refetchInterval: 5000, // Poll every 5 seconds (reduced from 3s to minimize API calls)
  });
  
  // Subscribe to real-time message updates for this conversation
  usePusherChannel(
    user ? `private-user-${user.id}` : null,
    'new-message',
    useCallback((data: any) => {
      console.log('📨 Pusher new-message event:', data);
      
      if (!userId || !data.message) {
        console.log('⏭️ Skipping - no userId or message data', { userId, hasMessage: !!data.message });
        return;
      }
      
      const message = data.message;
      const isForThisConversation = 
        (message.sender_id === userId && message.recipient_id === user?.id) ||
        (message.sender_id === user?.id && message.recipient_id === userId);
      
      console.log('🔍 Checking conversation match:', {
        isForThisConversation,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        currentUserId: user?.id,
        selectedUserId: userId,
      });
      
      if (isForThisConversation) {
        console.log('✅ Message is for current conversation, updating cache immediately');
        
        // Update cache directly with new message - this triggers immediate re-render
        queryClient.setQueryData<Message[]>(['messages', 'with-user', userId], (oldMessages = []) => {
          console.log('📦 Current messages in cache:', oldMessages?.length || 0);
          
          // Check if message already exists
          const exists = oldMessages.some(m => m.id === message.id);
          if (exists) {
            console.log('⚠️ Message already in cache, skipping');
            return oldMessages;
          }
          
          console.log(`➕ Adding new message to cache (current count: ${oldMessages.length})`);
          console.log('📨 Message data:', {
            id: message.id,
            content: message.content?.substring(0, 50) + '...',
            sender_id: message.sender_id,
            recipient_id: message.recipient_id,
          });
          
          // Add new message to the list
          const newMessage: Message = {
            id: message.id,
            sender: data.sender || { id: message.sender_id, email: '', first_name: '', last_name: '' },
            recipient: { id: message.recipient_id, email: '', first_name: '', last_name: '' },
            content: message.content,
            subject: message.subject || undefined,
            is_read: message.is_read || false,
            created_at: message.created_at,
            organization: message.organization_id,
          };
          
          // Add to end of array (messages are ordered oldest first, newest last)
          const updated = [...oldMessages, newMessage];
          console.log(`✅ Cache updated! Old count: ${oldMessages.length}, New count: ${updated.length}`);
          return updated;
        });
        
        // Also update conversations list
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['message-unread-count'] });
        
        console.log('🔄 Invalidated conversations and unread count');
      }
    }, [userId, user?.id, queryClient])
  );
  
  // Also listen for conversation updates
  usePusherChannel(
    user ? `private-user-${user.id}` : null,
    'conversation-updated',
    useCallback((data: any) => {
      console.log('💬 Pusher conversation-updated event:', data);
      // Just invalidate - the new-message handler already does the cache update
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message-unread-count'] });
    }, [queryClient])
  );
  
  return messagesQuery;
};

export const useUnreadCount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Subscribe to unread count updates
  const channelName = user ? `private-user-${user.id}` : null;
  
  usePusherChannel(channelName, 'unread-count-updated', () => {
    queryClient.invalidateQueries({ queryKey: ['message-unread-count'] });
  });
  
  return useQuery({
    queryKey: ['message-unread-count'],
    queryFn: async () => {
      const response = await api.get<{ unread_count: number }>('/api/messages/unread_count/');
      return response.unread_count;
    },
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds as backup
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: number) =>
      api.post(`/api/messages/${messageId}/mark_read/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message-unread-count'] });
    },
  });
};


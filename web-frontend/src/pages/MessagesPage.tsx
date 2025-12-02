import { useState } from 'react';
import * as React from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button,
  Input,
  Textarea,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '../components/ui/dialog';
import { FiMessageSquare, FiSend, FiPlus, FiSearch, FiExternalLink } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useMessages, useConversations, useSendMessage, useRecipients, useMessagesWithUser, useUnreadCount, useMarkMessageRead } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/contexts/PermissionContext';
import { toaster } from '@/components/ui/toaster';
import { VoiceGeminiChatWindow } from '@/components/messages/VoiceGeminiChatWindow';
import { TelegramLinkButton } from '@/components/messages/TelegramLinkButton';

// Add CSS for select element
const styles = document.createElement('style');
styles.textContent = `
  .chakra-select {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #E2E8F0;
    font-size: 14px;
    background: white;
    cursor: pointer;
  }
  .chakra-select:focus {
    outline: 2px solid #805AD5;
    outline-offset: 2px;
  }
`;
if (!document.head.querySelector('style[data-select-styles]')) {
  styles.setAttribute('data-select-styles', 'true');
  document.head.appendChild(styles);
}

// Simple date formatting function
const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return then.toLocaleDateString();
};

// Special ID for AI Assistant
const AI_ASSISTANT_ID = -1;

const MessagesPage = () => {
  const { user } = useAuth();
  const { isVendor, isEmployee } = usePermissions();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');

  const { data: conversations, isLoading: conversationsLoading, error: conversationsError } = useConversations();
  // Only fetch messages for real users (not AI Assistant)
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useMessagesWithUser(
    selectedUserId === AI_ASSISTANT_ID ? null : selectedUserId
  );

  // Debug logging - detailed
  React.useEffect(() => {
    console.log('===== MESSAGES PAGE STATE =====');
    console.log('User:', { id: user?.id, email: user?.email });
    console.log('Conversations Loading:', conversationsLoading);
    console.log('Conversations Error:', conversationsError);
    console.log('Conversations Count:', conversations?.length || 0);
    console.log('Conversations Sample:', conversations?.slice(0, 2));
    console.log('---');
    console.log('Selected User ID:', selectedUserId);
    console.log('Is AI Assistant:', selectedUserId === AI_ASSISTANT_ID);
    console.log('Messages Loading:', messagesLoading);
    console.log('Has Error:', !!messagesError);
    console.log('Messages Data Type:', typeof messages);
    console.log('Messages Is Array:', Array.isArray(messages));
    console.log('Messages Count:', messages?.length || 0);
    console.log('Messages Sample:', messages?.slice(0, 3));
    console.log('==============================');
  }, [user, conversations, conversationsLoading, conversationsError, selectedUserId, messages, messagesLoading, messagesError]);
  const { data: recipients } = useRecipients();
  const { data: unreadCount } = useUnreadCount();
  const sendMessage = useSendMessage();
  const markRead = useMarkMessageRead();

  // Ensure conversations is an array
  const conversationsList = Array.isArray(conversations) ? conversations : [];

  const selectedConversation = conversationsList.find(conv => 
    conv.other_participant?.id === selectedUserId
  );

  const handleSendMessage = async () => {
    // Don't send regular messages to AI Assistant
    if (selectedUserId === AI_ASSISTANT_ID) {
      return;
    }
    
    if (!selectedUserId || !messageContent.trim()) {
      toaster.create({
        title: 'Error',
        description: 'Please select a recipient and enter a message',
        type: 'error',
      });
      return;
    }

    try {
      const newMessage = await sendMessage.mutateAsync({
        recipient_id: selectedUserId,
        content: messageContent,
      });
      
      // Clear form immediately
      setMessageContent('');
      
      // Message will appear via Pusher real-time update, but we can also optimistically add it
      // The sendMessage mutation already handles cache updates
      
      toaster.create({
        title: 'Success',
        description: 'Message sent successfully',
        type: 'success',
      });
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to send message',
        type: 'error',
      });
    }
  };

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleStartNewConversation = () => {
    if (selectedRecipientId) {
      const recipientId = parseInt(selectedRecipientId);
      setSelectedUserId(recipientId);
      setIsNewMessageDialogOpen(false);
      setSelectedRecipientId('');
      // Focus on message input
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  };

  // Mark messages as read when messages change and conversation is selected (skip for AI Assistant)
  React.useEffect(() => {
    if (messages && selectedUserId && selectedUserId !== AI_ASSISTANT_ID && user) {
      messages.forEach(msg => {
        if (!msg.is_read && msg.recipient.id === user.id && msg.sender.id === selectedUserId) {
          markRead.mutate(msg.id);
        }
      });
    }
  }, [messages, selectedUserId, user]);

  const filteredConversations = conversationsList.filter(conv => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const participant = conv.other_participant;
    const name = `${participant?.first_name || ''} ${participant?.last_name || ''}`.toLowerCase();
    const email = participant?.email?.toLowerCase() || '';
    return name.includes(search) || email.includes(search);
  });

  const selectedParticipant = selectedConversation?.other_participant;

  // Debug selected participant
  React.useEffect(() => {
    if (selectedUserId) {
      console.log('👤 Selected Participant:', {
        userId: selectedUserId,
        conversation: selectedConversation,
        participant: selectedParticipant
      });
    }
  }, [selectedUserId, selectedConversation, selectedParticipant]);

  return (
    <DashboardLayout title="Messages">
      <HStack align="stretch" gap={4} h="calc(100vh - 80px)" minH="600px">
        {/* Conversations List */}
        <Box
          w="350px"
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <Box p={4} borderBottomWidth="1px" borderColor="gray.200">
            <HStack justify="space-between" mb={3}>
              <Heading size="lg">Messages</Heading>
              <HStack gap={2}>
                {unreadCount !== undefined && unreadCount > 0 && (
                  <Badge colorPalette="red" size="lg">
                    {unreadCount}
                  </Badge>
                )}
                {/* Vendors and employees can initiate new conversations */}
                {(isVendor || isEmployee) && (
                  <Button
                    size="sm"
                    colorPalette="purple"
                    onClick={() => setIsNewMessageDialogOpen(true)}
                    leftIcon={<FiPlus />}
                  >
                    New Message
                  </Button>
                )}
              </HStack>
            </HStack>
            
            {/* Search */}
            <Box position="relative">
              <Box
                position="absolute"
                left="12px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
                pointerEvents="none"
              >
                <FiSearch size={18} />
              </Box>
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl="40px"
                h="40px"
                borderRadius="lg"
              />
            </Box>
          </Box>

          {/* Conversations */}
          <Box flex={1} overflowY="auto">
            {conversationsLoading ? (
              <VStack justify="center" py={8}>
                <Spinner size="lg" />
                <Text color="gray.500">Loading conversations...</Text>
              </VStack>
            ) : (
              <VStack align="stretch" gap={0}>
                {/* Telegram Bot - Show for all users */}
                <Box
                  p={4}
                  bg="blue.50"
                  borderBottomWidth="1px"
                  borderBottomColor="gray.100"
                  borderRadius="md"
                  mb={2}
                >
                  <HStack justify="space-between" mb={1}>
                    <HStack>
                      <Text fontSize="lg">📱</Text>
                      <Text fontWeight="semibold" fontSize="sm">
                        Telegram Bot
                      </Text>
                    </HStack>
                  </HStack>
                  <Text fontSize="xs" color="gray.600" mb={2} noOfLines={2}>
                    Connect with LeadGrid Bot on Telegram for quick access to your CRM
                  </Text>
                  <Button
                    size="xs"
                    colorPalette="blue"
                    variant="outline"
                    onClick={() => window.open('https://t.me/LeadGrid_bot', '_blank')}
                    leftIcon={<FiExternalLink size={12} />}
                    width="100%"
                  >
                    Open LeadGrid Bot
                  </Button>
                </Box>

                {/* AI Assistant - Show for Vendors and Employees */}
                {(isVendor || isEmployee) && (
                  <Box
                    p={4}
                    cursor="pointer"
                    bg={selectedUserId === AI_ASSISTANT_ID ? 'purple.50' : 'white'}
                    borderLeftWidth={selectedUserId === AI_ASSISTANT_ID ? '3px' : '0'}
                    borderLeftColor={selectedUserId === AI_ASSISTANT_ID ? 'purple.500' : 'transparent'}
                    borderBottomWidth="1px"
                    borderBottomColor="gray.100"
                    _hover={{ bg: selectedUserId === AI_ASSISTANT_ID ? 'purple.50' : 'gray.50' }}
                    onClick={() => setSelectedUserId(AI_ASSISTANT_ID)}
                  >
                    <HStack justify="space-between" mb={1}>
                      <HStack>
                        <Text fontSize="lg">🤖</Text>
                        <Text fontWeight="semibold" fontSize="sm">
                          AI Assistant
                        </Text>
                        <Badge colorPalette="purple" size="sm">
                          NEW
                        </Badge>
                      </HStack>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" noOfLines={1}>
                      Ask me about your CRM data, analytics, and more
                    </Text>
                  </Box>
                )}

                {/* Regular Conversations */}
                {filteredConversations.length === 0 && !isVendor && !isEmployee ? (
                  <VStack justify="center" py={12} px={4}>
                    <FiMessageSquare size={48} color="var(--gray-400)" />
                    <Text color="gray.500" textAlign="center">
                      No conversations yet
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Start a conversation by sending a message
                    </Text>
                  </VStack>
                ) : (
                  filteredConversations.map((conversation) => {
                  const participant = conversation.other_participant;
                  const isSelected = selectedUserId === participant?.id;
                  
                  return (
                    <Box
                      key={conversation.id}
                      p={4}
                      cursor="pointer"
                      bg={isSelected ? 'purple.50' : 'white'}
                      borderLeftWidth={isSelected ? '3px' : '0'}
                      borderLeftColor={isSelected ? 'purple.500' : 'transparent'}
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleSelectConversation(participant.id)}
                    >
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {participant?.first_name && participant?.last_name
                            ? `${participant.first_name} ${participant.last_name}`
                            : participant?.email || 'Unknown User'}
                        </Text>
                        {conversation.unread_count > 0 && (
                          <Badge colorPalette="red" size="sm">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </HStack>
                      
                      {conversation.last_message && (
                        <HStack justify="space-between" align="start">
                          <Text fontSize="xs" color="gray.600" noOfLines={1} flex={1} wordBreak="break-word">
                            {conversation.last_message.content}
                          </Text>
                          <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>
                            {conversation.last_message_at
                              ? formatTimeAgo(conversation.last_message_at)
                              : ''}
                          </Text>
                        </HStack>
                      )}
                    </Box>
                  );
                  })
                )}
              </VStack>
            )}
          </Box>
        </Box>

        {/* Chat Window */}
        {selectedUserId === AI_ASSISTANT_ID ? (
          /* AI Assistant Chat Window with Voice + Telegram Link */
          <VStack flex={1} gap={3} align="stretch">
            {/* Telegram Bot Connection */}
            <Box px={4} pt={4}>
              <TelegramLinkButton />
            </Box>
            
            {/* AI Chat */}
            <Box flex={1}>
              <VoiceGeminiChatWindow autoSpeak={true} defaultLanguage="en-US" />
            </Box>
          </VStack>
        ) : (
          /* Regular User Chat Window */
          <Box
          flex={1}
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
          display="flex"
          flexDirection="column"
        >
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <Box p={4} borderBottomWidth="1px" borderColor="gray.200">
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">
                    {selectedParticipant?.first_name && selectedParticipant?.last_name
                      ? `${selectedParticipant.first_name} ${selectedParticipant.last_name}`
                      : selectedParticipant?.email || 'Unknown User'}
                  </Text>
                </HStack>
              </Box>

              {/* Messages */}
              <Box 
                flex={1} 
                overflowY="auto" 
                p={4}
                display="flex"
                flexDirection="column"
              >
                {messagesLoading ? (
                  <VStack justify="center" py={8}>
                    <Spinner size="lg" />
                    <Text color="gray.500">Loading messages...</Text>
                  </VStack>
                ) : messagesError ? (
                  <VStack justify="center" py={8}>
                    <Text color="red.500" fontWeight="semibold">Failed to load messages</Text>
                    <Text fontSize="sm" color="gray.500">{(messagesError as any)?.message || 'Unknown error'}</Text>
                    <Button size="sm" onClick={() => window.location.reload()}>Retry</Button>
                  </VStack>
                ) : !messages || messages.length === 0 ? (
                  <VStack justify="center" py={12}>
                    <FiMessageSquare size={48} color="var(--gray-400)" />
                    <Text color="gray.500">No messages yet</Text>
                    <Text fontSize="sm" color="gray.400">
                      Start the conversation!
                    </Text>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={2} flex={1}>
                    {messages.map((message: any, index: number) => {
                      const isFromMe = user && message.sender?.id === user.id;
                      const senderName = message.sender?.first_name && message.sender?.last_name
                        ? `${message.sender.first_name} ${message.sender.last_name}`
                        : message.sender?.email || 'Unknown';
                      
                      // Show sender name only if different from previous message
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showSenderName = !prevMessage || prevMessage.sender?.id !== message.sender?.id;
                      
                      return (
                        <Box
                          key={message.id}
                          display="flex"
                          flexDirection="column"
                          alignItems={isFromMe ? 'flex-end' : 'flex-start'}
                          w="full"
                          mt={showSenderName ? 2 : 0}
                        >
                          {showSenderName && (
                            <Text fontSize="xs" color="gray.500" mb={1} px={1}>
                              {isFromMe ? 'You' : senderName}
                            </Text>
                          )}
                          <Box
                            maxW="70%"
                            p={3}
                            borderRadius="lg"
                            bg={isFromMe ? 'purple.500' : 'gray.100'}
                            color={isFromMe ? 'white' : 'gray.900'}
                          >
                            <Text fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-word">
                              {message.content}
                            </Text>
                            <Text fontSize="xs" opacity={0.7} mt={1}>
                              {formatTimeAgo(message.created_at)}
                            </Text>
                          </Box>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>

              {/* Message Input */}
              <Box p={4} borderTopWidth="1px" borderColor="gray.200">
                <VStack align="stretch" gap={3}>
                  <HStack align="end" gap={2}>
                    <Textarea
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={3}
                      resize="none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      colorPalette="purple"
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessage.isPending}
                      loading={sendMessage.isPending}
                      leftIcon={<FiSend />}
                    >
                      Send
                    </Button>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Press Ctrl+Enter to send
                  </Text>
                </VStack>
              </Box>
            </>
          ) : (
            <VStack justify="center" h="full" py={12}>
              <FiMessageSquare size={64} color="var(--gray-400)" />
              <Text fontSize="lg" color="gray.600" fontWeight="semibold">
                Select a conversation
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center" maxW="400px">
                {isVendor 
                  ? 'Choose a conversation from the list to start messaging, or send a new message to start a conversation.'
                  : isEmployee
                  ? 'Choose a conversation from the list to reply, or send a new message to your vendor.'
                  : 'Choose a conversation from the list to reply. Only vendors and employees can initiate new conversations.'}
              </Text>
            </VStack>
          )}
          </Box>
        )}
      </HStack>

      {/* New Message Dialog */}
      <DialogRoot 
        open={isNewMessageDialogOpen} 
        onOpenChange={(details: any) => !details.open && setIsNewMessageDialogOpen(false)}
        size="md"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack align="stretch" gap={4}>
              <Field label="Select Recipient" required>
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  title="Select a recipient"
                  className="chakra-select"
                >
                  <option value="">Select a recipient...</option>
                  {recipients && Array.isArray(recipients) && recipients.map((recipient: any) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.first_name && recipient.last_name
                        ? `${recipient.first_name} ${recipient.last_name} (${recipient.email})`
                        : recipient.email || `User ${recipient.id}`}
                    </option>
                  ))}
                </select>
              </Field>
              {recipients && Array.isArray(recipients) && recipients.length === 0 && (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  {isVendor 
                    ? 'No recipients available. Make sure you have employees or customers in your organization.'
                    : isEmployee
                    ? 'No vendor found. Contact your administrator to set up your organization.'
                    : 'No recipients available.'}
                </Text>
              )}
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewMessageDialogOpen(false);
                setSelectedRecipientId('');
              }}
            >
              Cancel
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleStartNewConversation}
              disabled={!selectedRecipientId}
            >
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </DashboardLayout>
  );
};

export default MessagesPage;


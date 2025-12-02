/**
 * Telegram Link Button
 * Generates and displays a link to open Telegram bot with auto-authorization
 */
import { useState } from 'react';
import { Box, Button, Text, VStack, HStack, Spinner, Code } from '@chakra-ui/react';
import { FiExternalLink, FiCopy, FiCheck } from 'react-icons/fi';
import { toaster } from '@/components/ui/toaster';
import api from '@/lib/apiClient';

interface TelegramLinkData {
  telegram_link: string;
  bot_username: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
  profile: {
    id: number;
    profile_type: string;
    organization: {
      id: number;
      name: string;
    } | null;
  };
}

export const TelegramLinkButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkData, setLinkData] = useState<TelegramLinkData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);

    try {
      const response = await api.get('/telegram/generate-link/');
      const data = response.data as TelegramLinkData;
      
      setLinkData(data);
      
      toaster.create({
        title: 'Link Generated!',
        description: `Click to open @${data.bot_username} in Telegram`,
        type: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error generating Telegram link:', error);
      
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to generate Telegram link',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!linkData) return;

    try {
      await navigator.clipboard.writeText(linkData.telegram_link);
      setIsCopied(true);
      
      toaster.create({
        title: 'Copied!',
        description: 'Telegram link copied to clipboard',
        type: 'success',
        duration: 2000,
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const openTelegram = () => {
    if (!linkData) return;
    window.open(linkData.telegram_link, '_blank');
  };

  if (!linkData) {
    return (
      <Box
        p={4}
        bg="blue.50"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="blue.200"
      >
        <VStack align="stretch" gap={3}>
          <HStack>
            <Box
              p={2}
              bg="blue.500"
              borderRadius="md"
              color="white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontWeight="bold" fontSize="sm" color="blue.900">
                Connect to Telegram Bot
              </Text>
              <Text fontSize="xs" color="blue.700">
                Get instant CRM notifications and manage tasks on the go
              </Text>
            </VStack>
          </HStack>

          <Button
            onClick={generateLink}
            colorPalette="blue"
            size="sm"
            loading={isGenerating}
            loadingText="Generating..."
            w="full"
          >
            Generate Telegram Link
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      bg="green.50"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="green.200"
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between">
          <HStack>
            <Box
              p={2}
              bg="green.500"
              borderRadius="md"
              color="white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontWeight="bold" fontSize="sm" color="green.900">
                Link Ready!
              </Text>
              <Text fontSize="xs" color="green.700">
                @{linkData.bot_username}
              </Text>
            </VStack>
          </HStack>

          <Text fontSize="xs" color="green.600">
            Expires in {linkData.expires_in}s
          </Text>
        </HStack>

        <Box
          p={3}
          bg="white"
          borderRadius="md"
          borderWidth="1px"
          borderColor="green.300"
        >
          <VStack align="start" gap={2}>
            <HStack w="full" justify="space-between">
              <Text fontSize="xs" fontWeight="medium" color="gray.700">
                Profile: {linkData.profile.profile_type}
              </Text>
              {linkData.profile.organization && (
                <Text fontSize="xs" color="gray.600">
                  {linkData.profile.organization.name}
                </Text>
              )}
            </HStack>
          </VStack>
        </Box>

        <HStack gap={2}>
          <Button
            onClick={openTelegram}
            colorPalette="green"
            size="sm"
            flex={1}
            rightIcon={<FiExternalLink />}
          >
            Open in Telegram
          </Button>

          <Button
            onClick={copyLink}
            variant="outline"
            colorPalette="green"
            size="sm"
            px={3}
          >
            {isCopied ? <FiCheck /> : <FiCopy />}
          </Button>
        </HStack>

        <Text fontSize="xs" color="green.700" textAlign="center">
          Click the link to authenticate with your {linkData.profile.profile_type} role
        </Text>
      </VStack>
    </Box>
  );
};

export default TelegramLinkButton;


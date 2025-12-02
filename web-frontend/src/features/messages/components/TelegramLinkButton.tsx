/**
 * Telegram Link Button
 * Direct authentication code for linking Telegram account to CRM
 */
import { useState } from 'react';
import { Box, Button, Text, VStack, HStack, Code, Link, Spinner, Separator } from '@chakra-ui/react';
import { FiPhone, FiCopy, FiCheck, FiExternalLink, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toaster } from '@/components/ui/toaster';
import { PhoneVerificationDialog } from './PhoneVerificationDialog';
import api from '@/lib/apiClient';

interface VerificationInfo {
  phoneNumber: string;
  code: string;
  url: string;
}

interface AuthCodeInfo {
  authCode: string;
  botUsername: string;
  telegramLink: string;
  expiresIn: number;
}

export const TelegramLinkButton = () => {
  const navigate = useNavigate();
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [authCodeInfo, setAuthCodeInfo] = useState<AuthCodeInfo | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  const handleVerificationSent = (phoneNumber: string, code: string, url: string) => {
    setVerificationInfo({ phoneNumber, code, url });
    toaster.create({
      title: 'Code Sent!',
      description: `Verification code sent to ${phoneNumber}. You can verify directly here or via SMS link.`,
      type: 'success',
      duration: 5000,
    });
  };

  const handleVerifyNow = () => {
    if (verificationInfo) {
      navigate(`/verify-telegram?code=${verificationInfo.code}&phone=${verificationInfo.phoneNumber}`);
    }
  };

  const copyCode = async () => {
    if (!verificationInfo) return;
    try {
      await navigator.clipboard.writeText(verificationInfo.code);
      setIsCodeCopied(true);
      toaster.create({
        title: 'Copied!',
        description: 'Verification code copied to clipboard',
        type: 'success',
        duration: 2000,
      });
      setTimeout(() => setIsCodeCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const copyLink = async () => {
    if (!verificationInfo) return;
    try {
      await navigator.clipboard.writeText(verificationInfo.url);
      toaster.create({
        title: 'Copied!',
        description: 'Verification link copied to clipboard',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleGenerateAuthCode = async () => {
    setIsLoadingCode(true);
    try {
      const response = await api.get<any>('/api/telegram/generate-link/');
      
      if (response.auth_code) {
        setAuthCodeInfo({
          authCode: response.auth_code,
          botUsername: response.bot_username || 'LeadGrid_bot',
          telegramLink: response.telegram_link,
          expiresIn: response.expires_in || 300,
        });
        toaster.create({
          title: 'Authentication Code Generated!',
          description: `Code valid for ${Math.floor((response.expires_in || 300) / 60)} minutes`,
          type: 'success',
          duration: 5000,
        });
      } else {
        throw new Error(response.error || 'Failed to generate code');
      }
    } catch (error: any) {
      console.error('Error generating auth code:', error);
      toaster.create({
        title: 'Error',
        description: error.errors?.detail?.[0] || error.message || 'Failed to generate authentication code',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoadingCode(false);
    }
  };

  const copyAuthCode = async () => {
    if (!authCodeInfo) return;
    try {
      await navigator.clipboard.writeText(authCodeInfo.authCode);
      setIsCodeCopied(true);
      toaster.create({
        title: 'Copied!',
        description: 'Authentication code copied to clipboard',
        type: 'success',
        duration: 2000,
      });
      setTimeout(() => setIsCodeCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const openTelegram = () => {
    if (!authCodeInfo) return;
    window.open(authCodeInfo.telegramLink, '_blank');
  };

  // Show auth code if generated
  if (authCodeInfo) {
    return (
      <Box
        p={4}
        bg="green.50"
        borderRadius="lg"
        borderWidth="2px"
        borderColor="green.300"
      >
        <VStack align="stretch" gap={4}>
          <HStack justify="center">
            <Box
              p={2}
              bg="green.500"
              borderRadius="md"
              color="white"
            >
              <FiSend size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" fontSize="sm" color="green.900">
                Authentication Code Generated!
              </Text>
              <Text fontSize="xs" color="green.700">
                Code expires in {Math.floor(authCodeInfo.expiresIn / 60)} minutes
              </Text>
            </VStack>
          </HStack>

          {/* Code Display */}
          <Box
            p={4}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="green.300"
          >
            <VStack align="stretch" gap={3}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.700" textAlign="center">
                Your Authentication Code
              </Text>
              <HStack gap={2} justify="center">
                <Code
                  fontSize="3xl"
                  fontWeight="bold"
                  letterSpacing="0.3em"
                  px={6}
                  py={4}
                  bg="gray.100"
                  color="gray.900"
                  borderRadius="md"
                >
                  {authCodeInfo.authCode}
                </Code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAuthCode}
                  px={3}
                >
                  {isCodeCopied ? <FiCheck /> : <FiCopy />}
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Instructions */}
          <Box
            p={3}
            bg="blue.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="blue.200"
          >
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="semibold" color="blue.900">
                How to authenticate:
              </Text>
              <VStack align="start" gap={1} fontSize="sm" color="blue.800">
                <Text>1. Open Telegram and find <strong>@{authCodeInfo.botUsername}</strong></Text>
                <Text>2. Type: <Code>/start {authCodeInfo.authCode}</Code></Text>
                <Text>3. You'll be authenticated automatically!</Text>
              </VStack>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <HStack gap={2}>
            <Button
              colorPalette="green"
              size="sm"
              flex={1}
              onClick={openTelegram}
            >
              <HStack gap={2}>
                <Text>Open Telegram</Text>
                <FiExternalLink />
              </HStack>
            </Button>
            <Button
              variant="outline"
              size="sm"
              flex={1}
              onClick={() => setAuthCodeInfo(null)}
            >
              New Code
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  // Show phone verification info if code was sent
  if (verificationInfo) {
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
              <VStack align="start" gap={0}>
                <Text fontWeight="bold" fontSize="sm" color="green.900">
                  Verification Code Sent!
                </Text>
                <Text fontSize="xs" color="green.700">
                  Code sent to {verificationInfo.phoneNumber}
                </Text>
              </VStack>
            </HStack>
          </HStack>

          <Box
            p={3}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="green.300"
          >
            <VStack align="stretch" gap={3}>
              <VStack align="stretch" gap={2}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Verification Code
                </Text>
                <HStack gap={2}>
                  <Code
                    fontSize="xl"
                    fontWeight="bold"
                    letterSpacing="0.2em"
                    px={3}
                    py={2}
                    bg="gray.100"
                    color="gray.900"
                    flex={1}
                    textAlign="center"
                  >
                    {verificationInfo.code}
                  </Code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyCode}
                    px={3}
                  >
                    {isCodeCopied ? <FiCheck /> : <FiCopy />}
                  </Button>
                </HStack>
              </VStack>

              <Box pt={2} borderTopWidth="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={2}>
                  Verify Now
                </Text>
                <Button
                  colorPalette="green"
                  size="sm"
                  w="full"
                  onClick={handleVerifyNow}
                >
                  <HStack gap={2}>
                    <Text>Click to Verify Telegram Account</Text>
                    <FiExternalLink />
                  </HStack>
                </Button>
              </Box>

              <Box pt={2} borderTopWidth="1px" borderColor="gray.200">
                <VStack align="stretch" gap={2}>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Or use verification link
                  </Text>
                  <HStack gap={2}>
                    <Link
                      href={verificationInfo.url}
                      fontSize="xs"
                      color="blue.600"
                      wordBreak="break-all"
                      flex={1}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {verificationInfo.url}
                    </Link>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={copyLink}
                      px={2}
                    >
                      <FiCopy size={14} />
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          <Text fontSize="xs" color="gray.600" textAlign="center">
            Code expires in 15 minutes. You can also check your SMS for the verification link.
          </Text>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setVerificationInfo(null);
              setIsPhoneDialogOpen(true);
            }}
            colorPalette="gray"
          >
            Send New Code
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <>
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
                Quick authentication or phone verification
              </Text>
            </VStack>
          </HStack>

          {/* Direct Auth Code Button */}
          <Button
            onClick={handleGenerateAuthCode}
            colorPalette="blue"
            size="sm"
            w="full"
            disabled={isLoadingCode}
          >
            <HStack gap={2}>
              {isLoadingCode ? <Spinner size="sm" /> : <FiSend />}
              <Text>{isLoadingCode ? 'Generating...' : 'Get Authentication Code'}</Text>
            </HStack>
          </Button>

          <Separator />

          {/* Phone Verification Button */}
          <Button
            onClick={() => setIsPhoneDialogOpen(true)}
            variant="outline"
            size="sm"
            w="full"
            disabled={isLoadingCode}
          >
            <HStack gap={2}>
              <FiPhone />
              <Text>Verify via Phone Number</Text>
            </HStack>
          </Button>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Or use phone verification as alternative method
          </Text>
        </VStack>
      </Box>

      <PhoneVerificationDialog
        isOpen={isPhoneDialogOpen}
        onClose={() => setIsPhoneDialogOpen(false)}
        onVerificationSent={handleVerificationSent}
      />
    </>
  );
};

export default TelegramLinkButton;


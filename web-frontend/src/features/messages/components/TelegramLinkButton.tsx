/**
 * Telegram Link Button
 * Phone number verification for linking Telegram account to CRM
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Text, VStack, HStack, Code, Link } from '@chakra-ui/react';
import { FiPhone, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import { toaster } from '@/components/ui/toaster';
import { PhoneVerificationDialog } from './PhoneVerificationDialog';

interface VerificationInfo {
  phoneNumber: string;
  code: string;
  url: string;
}

export const TelegramLinkButton = () => {
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const navigate = useNavigate();

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

  // Show verification info if code was sent
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
                  rightIcon={<FiExternalLink />}
                >
                  Click to Verify Telegram Account
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
                      isExternal
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
                Verify your phone number to link your Telegram account
              </Text>
            </VStack>
          </HStack>

          <Button
            onClick={() => setIsPhoneDialogOpen(true)}
            colorPalette="blue"
            size="sm"
            w="full"
            leftIcon={<FiPhone />}
          >
            Verify via Phone Number
          </Button>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Receive verification code via SMS
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


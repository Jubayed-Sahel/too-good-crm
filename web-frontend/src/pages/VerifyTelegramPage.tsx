/**
 * Verify Telegram Page
 * Public page where users can verify their phone number code to link Telegram
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Heading,
  Spinner,
  Container,
} from '@chakra-ui/react';
import { FiCheck, FiX, FiPhone } from 'react-icons/fi';
import { toaster } from '@/components/ui/toaster';
import api from '@/lib/apiClient';

const VerifyTelegramPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';
  const phoneFromUrl = searchParams.get('phone') || '';

  const [phoneNumber, setPhoneNumber] = useState(phoneFromUrl);
  const [verificationCode, setVerificationCode] = useState(codeFromUrl);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Check if Telegram is available (user came from Telegram)
  useEffect(() => {
    // Check if Telegram WebApp is available (Telegram Mini App context)
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      // Get Telegram user info
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTelegramChatId(String(user.id));
      }
    }
  }, []);

  const handleVerify = async () => {
    if (!phoneNumber.trim() || !verificationCode.trim()) {
      toaster.create({
        title: 'Error',
        description: 'Please enter phone number and verification code',
        type: 'error',
      });
      return;
    }

    if (!telegramChatId) {
      toaster.create({
        title: 'Error',
        description: 'Telegram chat ID is required. Please open this page from Telegram.',
        type: 'error',
        duration: 7000,
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.post('/telegram/verify-phone-code/', {
        phone_number: phoneNumber,
        verification_code: verificationCode,
        telegram_chat_id: parseInt(telegramChatId),
      });

      if (response.data.success) {
        setIsVerified(true);
        
        toaster.create({
          title: 'Success!',
          description: 'Your Telegram account has been linked to your CRM profile.',
          type: 'success',
          duration: 5000,
        });

        // Redirect to Telegram after a delay
        setTimeout(() => {
          window.location.href = 'https://t.me/LeadGrid_bot';
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Verification failed';
      
      // Extract remaining attempts from error message if available
      const attemptsMatch = errorMessage.match(/(\d+) attempt\(s\) remaining/);
      if (attemptsMatch) {
        setRemainingAttempts(parseInt(attemptsMatch[1]));
      }
      
      toaster.create({
        title: 'Verification Failed',
        description: errorMessage,
        type: 'error',
        duration: 7000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckCode = async () => {
    if (!phoneNumber.trim() || !verificationCode.trim()) {
      return;
    }

    try {
      const response = await api.get('/telegram/check-verification-code/', {
        params: {
          phone: phoneNumber,
          code: verificationCode,
        },
      });

      setRemainingAttempts(response.data.remaining_attempts);

      if (response.data.is_expired) {
        toaster.create({
          title: 'Code Expired',
          description: 'This verification code has expired. Please request a new one.',
          type: 'warning',
        });
      }
    } catch (error) {
      // Silently fail - this is just a pre-check
    }
  };

  // Auto-check code when it changes
  useEffect(() => {
    if (verificationCode.length === 6 && phoneNumber) {
      const timeoutId = setTimeout(() => {
        handleCheckCode();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [verificationCode, phoneNumber]);

  if (isVerified) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="500px">
          <VStack gap={6} p={8} bg="white" borderRadius="xl" boxShadow="lg">
            <Box
              p={4}
              bg="green.100"
              borderRadius="full"
              color="green.600"
            >
              <FiCheck size={48} />
            </Box>
            <VStack gap={2}>
              <Heading size="lg" color="green.600">
                Verified Successfully!
              </Heading>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Your Telegram account has been linked to your CRM profile.
                Redirecting to Telegram...
              </Text>
            </VStack>
            <Spinner size="lg" colorPalette="green" />
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="500px">
        <VStack gap={6} p={8} bg="white" borderRadius="xl" boxShadow="lg">
          <VStack gap={2}>
            <Box
              p={4}
              bg="blue.100"
              borderRadius="full"
              color="blue.600"
            >
              <FiPhone size={48} />
            </Box>
            <Heading size="lg">Verify Phone Number</Heading>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Enter the verification code sent to your phone number to link your Telegram account
            </Text>
          </VStack>

          <VStack align="stretch" gap={4} w="full">
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Phone Number
              </Text>
              <Input
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                size="lg"
                disabled={isVerifying}
              />
            </VStack>

            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Verification Code
              </Text>
              <Input
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => {
                  // Only allow digits, max 6
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                type="text"
                inputMode="numeric"
                size="lg"
                textAlign="center"
                fontSize="2xl"
                letterSpacing="0.2em"
                disabled={isVerifying}
                maxLength={6}
              />
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  {remainingAttempts} attempt(s) remaining
                </Text>
              )}
            </VStack>

            {!telegramChatId && (
              <Box
                p={3}
                bg="orange.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="orange.200"
              >
                <Text fontSize="xs" color="orange.800">
                  ⚠️ This page should be opened from Telegram. If you're not in Telegram, 
                  please open the bot first and click the verification link.
                </Text>
              </Box>
            )}

            <Button
              colorPalette="blue"
              size="lg"
              onClick={handleVerify}
              loading={isVerifying}
              loadingText="Verifying..."
              w="full"
              disabled={!phoneNumber || !verificationCode || !telegramChatId}
            >
              Verify & Link Account
            </Button>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Don't have a code? Return to the CRM and request a new verification code.
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyTelegramPage;


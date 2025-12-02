/**
 * Phone Verification Dialog
 * Allows users to enter phone number to receive verification code via SMS
 */
import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  Spinner,
} from '@chakra-ui/react';
import { FiSend, FiPhone, FiCheck, FiX } from 'react-icons/fi';
import { toaster } from '@/components/ui/toaster';
import api from '@/lib/apiClient';

interface PhoneVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSent: (phoneNumber: string, verificationCode: string, verificationUrl: string) => void;
}

export const PhoneVerificationDialog = ({
  isOpen,
  onClose,
  onVerificationSent,
}: PhoneVerificationDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendCode = async () => {
    const trimmedPhone = phoneNumber.trim();
    
    if (!trimmedPhone) {
      toaster.create({
        title: 'Error',
        description: 'Please enter a phone number',
        type: 'error',
      });
      return;
    }

    // Validate phone number format on frontend
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const digitsOnly = trimmedPhone.replace(/[^\d+]/g, '');
    
    if (!digitsOnly.startsWith('+') && digitsOnly.length < 10) {
      toaster.create({
        title: 'Invalid Phone Number',
        description: 'Phone number must include country code (e.g., +1 for US/Canada)',
        type: 'error',
      });
      return;
    }

    setIsSending(true);

    try {
      // Send the user-entered phone number to backend
      const response = await api.post('/telegram/send-verification-code/', {
        phone_number: trimmedPhone, // Dynamic phone number from user input
      });

      if (response.data.success) {
        toaster.create({
          title: 'Code Sent!',
          description: `Verification code sent to ${response.data.phone_number}`,
          type: 'success',
          duration: 5000,
        });

        // Get verification code and URL from response
        // The backend generates the URL with the phone number we sent
        const verificationUrl = response.data.verification_url || '';
        const verificationCode = response.data.verification_code || '';
        const normalizedPhone = response.data.phone_number || trimmedPhone;

        if (!verificationCode || !verificationUrl) {
          throw new Error('Verification code or URL not received from server');
        }

        onVerificationSent(normalizedPhone, verificationCode, verificationUrl);
        setPhoneNumber('');
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to send code');
      }
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      
      toaster.create({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to send verification code',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSending) {
      handleSendCode();
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <DialogContent maxW="500px">
        <DialogHeader>
          <HStack gap={2}>
            <Box
              p={2}
              bg="blue.500"
              borderRadius="md"
              color="white"
            >
              <FiPhone size={20} />
            </Box>
            <Text fontSize="lg" fontWeight="bold">
              Verify Phone Number
            </Text>
          </HStack>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="gray.600">
              Enter your phone number to receive a verification code via SMS.
              This will link your Telegram account to your CRM profile.
            </Text>

            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Phone Number
              </Text>
              <Input
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                type="tel"
                size="lg"
                disabled={isSending}
              />
              <Text fontSize="xs" color="gray.500">
                Include country code (e.g., +1 for US/Canada, +44 for UK)
              </Text>
            </VStack>

            <HStack gap={2} justify="flex-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleSendCode}
                loading={isSending}
                loadingText="Sending..."
                leftIcon={<FiSend />}
              >
                Send Code
              </Button>
            </HStack>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};


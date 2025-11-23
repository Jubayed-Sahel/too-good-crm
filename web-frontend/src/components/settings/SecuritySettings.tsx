import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import { FiLock } from 'react-icons/fi';
import { useChangePassword } from '@/hooks/useUser';
import { toaster } from '../ui/toaster';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePasswordMutation = useChangePassword();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toaster.create({
        title: 'Error',
        description: 'New passwords do not match',
        type: 'error',
      });
      return;
    }

    if (newPassword.length < 6) {
      toaster.create({
        title: 'Password Too Short',
        description: 'Your new password must be at least 6 characters long. Please check the requirements below.',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      toaster.create({
        title: 'Password Changed Successfully!',
        description: 'Your password has been updated. Please use your new password for future logins.',
        type: 'success',
        duration: 5000,
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMsg = error.response?.data?.old_password?.[0] || 
                       error.response?.data?.new_password?.[0] || 
                       error.response?.data?.detail || 
                       error.response?.data?.error || 
                       'Failed to change password. Please check your current password and try again.';
      toaster.create({
        title: 'Password Change Failed',
        description: errorMsg,
        type: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Change Password */}
      <Card variant="elevated">
        <form onSubmit={handlePasswordChange}>
          <VStack align="stretch" gap={4}>
            <HStack gap={2}>
              <FiLock size={20} color="#3182CE" />
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Change Password
              </Text>
            </HStack>

            <Field label="Current Password" required>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                size="md"
                borderRadius="lg"
              />
            </Field>

            <Field label="New Password" required>
              <Input
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="md"
                borderRadius="lg"
              />
            </Field>

            <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
              <Text fontSize="sm" fontWeight="bold" color="blue.800" mb={3}>
                Password Requirements:
              </Text>
              <VStack align="start" gap={2}>
                <HStack gap={2}>
                  <Box color="blue.600" fontSize="sm">✓</Box>
                  <Text fontSize="sm" color="blue.700">Minimum 6 characters long</Text>
                </HStack>
                <HStack gap={2}>
                  <Box color="blue.600" fontSize="sm">✓</Box>
                  <Text fontSize="sm" color="blue.700">Must match the confirmation field</Text>
                </HStack>
              </VStack>
              <Box mt={3} pt={3} borderTop="1px solid" borderColor="blue.200">
                <Text fontSize="xs" color="blue.600" fontStyle="italic">
                  Tip: Use a mix of letters, numbers, and special characters for a stronger password
                </Text>
              </Box>
            </Box>

            <Field label="Confirm New Password" required>
              <Input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="md"
                borderRadius="lg"
              />
            </Field>

            <HStack justify="flex-end">
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={changePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card>
    </VStack>
  );
};

export default SecuritySettings;

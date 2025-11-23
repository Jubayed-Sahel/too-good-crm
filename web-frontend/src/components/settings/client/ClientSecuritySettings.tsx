import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Card } from '../../common';
import { Field } from '../../ui/field';
import { toaster } from '../../ui/toaster';
import { FiLock } from 'react-icons/fi';
import { useChangePassword } from '@/hooks/useUser';

const ClientSecuritySettings = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const changePasswordMutation = useChangePassword();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toaster.create({
        title: 'Passwords Do Not Match',
        description: 'The new password and confirmation password must be identical. Please re-enter them.',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (passwords.new.length < 6) {
      toaster.create({
        title: 'Password Too Short',
        description: 'Your new password must be at least 6 characters long.',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: passwords.current,
        new_password: passwords.new,
        new_password_confirm: passwords.confirm,
      });

      toaster.create({
        title: 'Password Changed Successfully!',
        description: 'Your password has been updated. Please use your new password for future logins.',
        type: 'success',
        duration: 5000,
      });

      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMsg = error.response?.data?.old_password?.[0] || 
                       error.response?.data?.new_password?.[0] || 
                       error.response?.data?.detail || 
                       error.response?.data?.error || 
                       'Failed to change password. Please verify your current password is correct.';
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
        <form onSubmit={handleChangePassword}>
          <VStack align="stretch" gap={5}>
            <HStack gap={2}>
              <Box
                p={2}
                bg="blue.100"
                borderRadius="md"
                color="blue.600"
              >
                <FiLock size={20} />
              </Box>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Change Password
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Update your password to keep your account secure
                </Text>
              </VStack>
            </HStack>

            <Field label="Current Password" required>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                size="md"
                borderRadius="lg"
                placeholder="Enter current password"
              />
            </Field>

            <Field label="New Password" required>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                size="md"
                borderRadius="lg"
                placeholder="Enter new password (min. 6 characters)"
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
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                size="md"
                borderRadius="lg"
                placeholder="Re-enter your new password"
              />
            </Field>

            <Box pt={2}>
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={changePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </Box>
          </VStack>
        </form>
      </Card>
    </VStack>
  );
};

export default ClientSecuritySettings;

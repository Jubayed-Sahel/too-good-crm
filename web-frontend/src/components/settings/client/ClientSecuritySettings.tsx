import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Card } from '../../common';
import { Field } from '../../ui/field';
import { toaster } from '../../ui/toaster';
import { FiLock, FiShield } from 'react-icons/fi';

const ClientSecuritySettings = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toaster.create({
        title: 'Password mismatch',
        description: 'New password and confirm password do not match.',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    toaster.create({
      title: 'Password updated',
      description: 'Your password has been changed successfully.',
      type: 'success',
      duration: 3000,
    });

    setPasswords({ current: '', new: '', confirm: '' });
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
              <Box>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  size="md"
                  borderRadius="lg"
                  placeholder="Enter new password"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </Text>
              </Box>
            </Field>

            <Field label="Confirm New Password" required>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                size="md"
                borderRadius="lg"
                placeholder="Confirm new password"
              />
            </Field>

            <Box pt={2}>
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
              >
                Update Password
              </Button>
            </Box>
          </VStack>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack gap={2}>
            <Box
              p={2}
              bg="green.100"
              borderRadius="md"
              color="green.600"
            >
              <FiShield size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Two-Factor Authentication
              </Text>
              <Text fontSize="xs" color="gray.600">
                Add an extra layer of security to your account
              </Text>
            </VStack>
          </HStack>

          <Box p={4} bg="gray.50" borderRadius="lg">
            <VStack align="start" gap={3}>
              <Text fontSize="sm" color="gray.700">
                Two-factor authentication is not enabled for your account.
              </Text>
              <Button size="sm" colorPalette="green">
                Enable 2FA
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Card>

      {/* Active Sessions */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <VStack align="start" gap={0}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Active Sessions
            </Text>
            <Text fontSize="xs" color="gray.600">
              Manage your active sessions and sign out from other devices
            </Text>
          </VStack>

          <Box p={4} bg="gray.50" borderRadius="lg">
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    Current Session
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Chrome on Windows • San Francisco, CA
                  </Text>
                </VStack>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  Active Now
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Button variant="outline" colorPalette="red" size="sm">
            Sign Out All Other Sessions
          </Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default ClientSecuritySettings;

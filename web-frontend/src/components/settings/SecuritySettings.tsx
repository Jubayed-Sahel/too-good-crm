import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import { FiLock, FiShield } from 'react-icons/fi';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, 1000);
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
    alert('Two-factor authentication enabled. Scan the QR code with your authenticator app.');
  };

  const handleDisable2FA = () => {
    if (window.confirm('Are you sure you want to disable two-factor authentication?')) {
      setTwoFactorEnabled(false);
      alert('Two-factor authentication disabled');
    }
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Change Password */}
      <Card variant="elevated">
        <form onSubmit={handlePasswordChange}>
          <VStack align="stretch" gap={4}>
            <HStack gap={2}>
              <FiLock size={18} color="#3182CE" />
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
              />
            </Field>

            <Field label="New Password" required>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="md"
              />
            </Field>

            <Field label="Confirm New Password" required>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="md"
              />
            </Field>

            <Box pt={2}>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Password requirements:
              </Text>
              <VStack align="start" gap={1} pl={2}>
                <Text fontSize="xs" color="gray.500">• At least 8 characters long</Text>
                <Text fontSize="xs" color="gray.500">• Contains uppercase and lowercase letters</Text>
                <Text fontSize="xs" color="gray.500">• Contains at least one number</Text>
                <Text fontSize="xs" color="gray.500">• Contains at least one special character</Text>
              </VStack>
            </Box>

            <HStack justify="flex-end">
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={isLoading}
              >
                Update Password
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack gap={2}>
            <FiShield size={18} color="#3182CE" />
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Two-Factor Authentication
            </Text>
          </HStack>

          <Box>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </Text>
            
            {twoFactorEnabled ? (
              <VStack align="stretch" gap={3}>
                <HStack p={3} bg="green.50" borderRadius="md" gap={2}>
                  <Box color="green.600">
                    <FiShield size={20} />
                  </Box>
                  <Text fontSize="sm" color="green.700" fontWeight="medium">
                    Two-factor authentication is enabled
                  </Text>
                </HStack>
                <Button
                  variant="outline"
                  colorPalette="red"
                  size="md"
                  onClick={handleDisable2FA}
                >
                  Disable Two-Factor Authentication
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" gap={3}>
                <HStack p={3} bg="orange.50" borderRadius="md" gap={2}>
                  <Box color="orange.600">
                    <FiShield size={20} />
                  </Box>
                  <Text fontSize="sm" color="orange.700" fontWeight="medium">
                    Two-factor authentication is not enabled
                  </Text>
                </HStack>
                <Button
                  colorPalette="blue"
                  size="md"
                  onClick={handleEnable2FA}
                >
                  Enable Two-Factor Authentication
                </Button>
              </VStack>
            )}
          </Box>
        </VStack>
      </Card>

      {/* Active Sessions */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Active Sessions
          </Text>

          <VStack align="stretch" gap={3}>
            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  Windows · Chrome
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Current session · New York, USA
                </Text>
              </VStack>
              <Text fontSize="xs" color="green.600" fontWeight="medium">
                Active
              </Text>
            </HStack>

            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  iPhone · Safari
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Last active 2 hours ago · New York, USA
                </Text>
              </VStack>
              <Button size="xs" variant="ghost" colorPalette="red">
                Revoke
              </Button>
            </HStack>
          </VStack>

          <Button variant="outline" colorPalette="red" size="sm" w="full">
            Sign Out All Other Sessions
          </Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default SecuritySettings;

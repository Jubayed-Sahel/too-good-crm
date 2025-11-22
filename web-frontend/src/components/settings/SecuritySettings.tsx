import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import { FiLock } from 'react-icons/fi';
import { userProfileService } from '@/services/userProfile.service';
import { toaster } from '../ui/toaster';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    if (newPassword.length < 8) {
      toaster.create({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      await userProfileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toaster.create({
        title: 'Success',
        description: 'Password changed successfully',
        type: 'success',
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      
      // Handle validation errors from backend
      let errorMessage = 'Failed to change password';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for field-specific errors
        if (errorData.old_password) {
          errorMessage = Array.isArray(errorData.old_password) 
            ? errorData.old_password[0] 
            : errorData.old_password;
        } else if (errorData.new_password) {
          errorMessage = Array.isArray(errorData.new_password) 
            ? errorData.new_password[0] 
            : errorData.new_password;
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : (Array.isArray(errorData.detail) ? errorData.detail[0] : String(errorData.detail));
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
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
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="md"
                borderRadius="lg"
              />
            </Field>

            <Field label="Confirm New Password" required>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="md"
                borderRadius="lg"
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

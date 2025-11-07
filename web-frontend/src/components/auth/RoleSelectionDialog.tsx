import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogBackdrop } from '../ui/dialog';
import { FiBriefcase, FiUsers, FiShoppingBag } from 'react-icons/fi';
import type { UserProfile } from '@/types';
import type { IconType } from 'react-icons';

interface RoleSelectionDialogProps {
  open: boolean;
  profiles: UserProfile[];
  onSelectRole: (profileId: number) => void;
  isLoading?: boolean;
}

const RoleSelectionDialog = ({
  open,
  profiles,
  onSelectRole,
  isLoading = false,
}: RoleSelectionDialogProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const handleConfirm = async () => {
    if (selectedProfileId) {
      try {
        await onSelectRole(selectedProfileId);
        // Note: Page will reload, so no need to close dialog manually
      } catch (error) {
        console.error('Failed to switch role:', error);
      }
    }
  };

  const getProfileIcon = (profileType: string): IconType => {
    switch (profileType) {
      case 'vendor':
        return FiBriefcase;
      case 'employee':
        return FiUsers;
      case 'customer':
        return FiShoppingBag;
      default:
        return FiBriefcase;
    }
  };

  const getProfileDescription = (profileType: string) => {
    switch (profileType) {
      case 'vendor':
        return 'Manage your organization, employees, and business operations';
      case 'employee':
        return 'Access organization resources with employee permissions';
      case 'customer':
        return 'View vendors, place orders, and manage your account';
      default:
        return '';
    }
  };

  return (
    <DialogRoot 
      open={open} 
      closeOnInteractOutside={false}
      closeOnEscape={false}
      size="lg"
    >
      <DialogBackdrop />
      <DialogContent>
        <VStack gap={6} p={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={2}>
              Select Your Role
            </Heading>
            <Text color="gray.600" fontSize="md">
              You have multiple roles. Please choose how you want to continue.
            </Text>
          </Box>

          <Box w="full">
            <VStack gap={3} align="stretch">
              {profiles.map((profile) => {
                const IconComponent = getProfileIcon(profile.profile_type);
                const isSelected = selectedProfileId === profile.id;

                return (
                  <Box
                    key={profile.id}
                    borderWidth="2px"
                    borderRadius="lg"
                    borderColor={isSelected ? 'purple.500' : 'gray.200'}
                    bg={isSelected ? 'purple.50' : 'white'}
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: 'purple.400',
                      bg: 'purple.50',
                    }}
                    onClick={() => setSelectedProfileId(profile.id)}
                  >
                    <HStack gap={4} align="start">
                      <Box
                        w={6}
                        h={6}
                        borderRadius="full"
                        borderWidth="2px"
                        borderColor={isSelected ? 'purple.500' : 'gray.300'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mt={1}
                      >
                        {isSelected && (
                          <Box
                            w={3}
                            h={3}
                            borderRadius="full"
                            bg="purple.500"
                          />
                        )}
                      </Box>

                      <Box
                        p={3}
                        bg={isSelected ? 'purple.100' : 'gray.100'}
                        borderRadius="lg"
                      >
                        <IconComponent 
                          size={24}
                          color={isSelected ? '#805AD5' : '#4A5568'}
                        />
                      </Box>

                      <VStack align="start" gap={1} flex={1}>
                        <HStack>
                          <Heading size="md">
                            {profile.profile_type_display}
                          </Heading>
                          {profile.is_primary && (
                            <Box
                              px={2}
                              py={0.5}
                              bg="purple.100"
                              color="purple.700"
                              borderRadius="md"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              Primary
                            </Box>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {profile.organization_name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {getProfileDescription(profile.profile_type)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </Box>

          <HStack w="full" justify="flex-end" gap={3}>
            <Button
              colorPalette="purple"
              size="lg"
              onClick={handleConfirm}
              disabled={!selectedProfileId || isLoading}
              loading={isLoading}
              w="full"
            >
              Continue
            </Button>
          </HStack>
        </VStack>
      </DialogContent>
    </DialogRoot>
  );
};

export default RoleSelectionDialog;

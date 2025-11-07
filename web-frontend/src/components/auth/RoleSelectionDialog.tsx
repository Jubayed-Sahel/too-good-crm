import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogBackdrop } from '../ui/dialog';
import { FiBriefcase, FiUsers, FiShoppingBag, FiCheck, FiRefreshCw } from 'react-icons/fi';
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleConfirm = async () => {
    if (selectedProfileId) {
      try {
        setIsTransitioning(true);
        await onSelectRole(selectedProfileId);
        // Note: Page will reload, so no need to close dialog manually
      } catch (error) {
        console.error('Failed to switch role:', error);
        setIsTransitioning(false);
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
        {/* Loading Overlay */}
        {isTransitioning && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="whiteAlpha.900"
            backdropFilter="blur(4px)"
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="xl"
          >
            <VStack gap={4}>
              <Box
                w={16}
                h={16}
                borderRadius="full"
                bg="purple.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              >
                <FiRefreshCw size={32} color="white" />
              </Box>
              <VStack gap={1}>
                <Text fontSize="lg" fontWeight="bold" color="purple.700">
                  Switching Profile
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Please wait while we update your context...
                </Text>
              </VStack>
            </VStack>
          </Box>
        )}
        
        <VStack gap={6} p={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={2}>
              Select Your Profile
            </Heading>
            <Text color="gray.600" fontSize="md">
              You have {profiles.length} profile{profiles.length > 1 ? 's' : ''}. Choose how you want to continue.
            </Text>
          </Box>

          <Box w="full">
            <VStack gap={3} align="stretch">
              {profiles.map((profile) => {
                const IconComponent = getProfileIcon(profile.profile_type);
                const isSelected = selectedProfileId === profile.id;
                const isCurrentProfile = profile.is_primary;

                return (
                  <Box
                    key={profile.id}
                    borderWidth="2px"
                    borderRadius="lg"
                    borderColor={isSelected ? 'purple.500' : isCurrentProfile ? 'purple.300' : 'gray.200'}
                    bg={isSelected ? 'purple.50' : isCurrentProfile ? 'purple.25' : 'white'}
                    p={4}
                    cursor="pointer"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    transform={isSelected ? 'scale(1.02)' : 'scale(1)'}
                    _hover={{
                      borderColor: 'purple.400',
                      bg: 'purple.50',
                      transform: 'scale(1.02)',
                      boxShadow: 'md',
                    }}
                    onClick={() => setSelectedProfileId(profile.id)}
                    boxShadow={isSelected ? 'lg' : 'sm'}
                    position="relative"
                  >
                    {isCurrentProfile && (
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        px={2}
                        py={1}
                        bg="purple.500"
                        color="white"
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        Active
                      </Box>
                    )}
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
                          {profile.is_primary && !isCurrentProfile && (
                            <Box
                              px={2}
                              py={0.5}
                              bg="gray.100"
                              color="gray.700"
                              borderRadius="md"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              Primary
                            </Box>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                          {profile.profile_type === 'customer' && !profile.organization_name 
                            ? 'Independent Customer' 
                            : profile.organization_name || 'No Organization'}
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
              disabled={!selectedProfileId || isLoading || isTransitioning}
              loading={isLoading || isTransitioning}
              loadingText={isTransitioning ? "Switching..." : "Loading..."}
              w="full"
            >
              {isTransitioning ? 'Switching Profile...' : 'Continue'}
            </Button>
          </HStack>
        </VStack>
      </DialogContent>
    </DialogRoot>
  );
};

export default RoleSelectionDialog;

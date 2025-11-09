/**
 * Profile Switcher Component
 * Allows users to switch between Vendor/Employee/Customer profiles
 */
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuSeparator,
} from '@chakra-ui/react';
import { FiChevronDown, FiCheck, FiBriefcase, FiUsers, FiUser } from 'react-icons/fi';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks/useAuth';

const profileIcons = {
  vendor: FiBriefcase,
  employee: FiUsers,
  customer: FiUser,
};

const profileColors = {
  vendor: 'purple',
  employee: 'blue',
  customer: 'green',
};

const profileLabels = {
  vendor: 'Vendor',
  employee: 'Employee',
  customer: 'Customer',
};

export const ProfileSwitcher = () => {
  const { profiles, activeProfile, isLoading } = useProfile();
  const { switchRole } = useAuth();

  if (isLoading || !activeProfile) {
    return (
      <Box px={4} py={2}>
        <Text fontSize="sm" color="gray.500">Loading profiles...</Text>
      </Box>
    );
  }

  if (profiles.length === 0) {
    return null;
  }

  const ActiveIcon = profileIcons[activeProfile.profile_type];
  const activeColor = profileColors[activeProfile.profile_type];

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
      <MenuTrigger asChild>
        <Button
          variant="outline"
          size="md"
          px={3}
          py={2}
          borderRadius="lg"
          _hover={{ bg: 'gray.50' }}
        >
          <HStack gap={2}>
            <Box color={`${activeColor}.500`}>
              <ActiveIcon size={18} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="gray.500" lineHeight="1">
                {profileLabels[activeProfile.profile_type]}
              </Text>
              <Text fontSize="sm" fontWeight="semibold" lineHeight="1.2">
                {activeProfile.organization_name || 'No Organization'}
              </Text>
            </VStack>
            <FiChevronDown size={16} />
          </HStack>
        </Button>
      </MenuTrigger>

      <MenuContent minW="280px">
        {/* Vendor Profiles */}
        {profiles.filter(p => p.profile_type === 'vendor').length > 0 && (
          <>
            <Box px={3} py={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Vendor Profiles
              </Text>
            </Box>
            {profiles
              .filter(p => p.profile_type === 'vendor')
              .map(profile => (
                <MenuItem
                  key={profile.id}
                  value={profile.id.toString()}
                  onClick={() => switchRole(profile.id)}
                  cursor="pointer"
                  bg={activeProfile.id === profile.id ? 'purple.50' : 'transparent'}
                >
                  <HStack justify="space-between" width="full">
                    <HStack gap={2}>
                      <Box color="purple.500">
                        <FiBriefcase size={16} />
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {profile.organization_name || 'No Organization'}
                        </Text>
                        {profile.is_owner && (
                          <Badge colorPalette="purple" size="xs" variant="subtle">
                            Owner
                          </Badge>
                        )}
                      </VStack>
                    </HStack>
                    {activeProfile.id === profile.id && (
                      <Box color="purple.500">
                        <FiCheck size={16} />
                      </Box>
                    )}
                  </HStack>
                </MenuItem>
              ))}
          </>
        )}

        {/* Employee Profiles */}
        {profiles.filter(p => p.profile_type === 'employee').length > 0 && (
          <>
            <MenuSeparator />
            <Box px={3} py={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Employee Profiles
              </Text>
            </Box>
            {profiles
              .filter(p => p.profile_type === 'employee')
              .map(profile => (
                <MenuItem
                  key={profile.id}
                  value={profile.id.toString()}
                  onClick={() => switchRole(profile.id)}
                  cursor="pointer"
                  bg={activeProfile.id === profile.id ? 'blue.50' : 'transparent'}
                >
                  <HStack justify="space-between" width="full">
                    <HStack gap={2}>
                      <Box color="blue.500">
                        <FiUsers size={16} />
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {profile.organization_name || 'No Organization'}
                        </Text>
                        {profile.roles && profile.roles.length > 0 && (
                          <Badge colorPalette="blue" size="xs" variant="subtle">
                            {profile.roles[0].name}
                          </Badge>
                        )}
                      </VStack>
                    </HStack>
                    {activeProfile.id === profile.id && (
                      <Box color="blue.500">
                        <FiCheck size={16} />
                      </Box>
                    )}
                  </HStack>
                </MenuItem>
              ))}
          </>
        )}

        {/* Customer Profiles */}
        {profiles.filter(p => p.profile_type === 'customer').length > 0 && (
          <>
            <MenuSeparator />
            <Box px={3} py={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Customer Profiles
              </Text>
            </Box>
            {profiles
              .filter(p => p.profile_type === 'customer')
              .map(profile => (
                <MenuItem
                  key={profile.id}
                  value={profile.id.toString()}
                  onClick={() => switchRole(profile.id)}
                  cursor="pointer"
                  bg={activeProfile.id === profile.id ? 'green.50' : 'transparent'}
                >
                  <HStack justify="space-between" width="full">
                    <HStack gap={2}>
                      <Box color="green.500">
                        <FiUser size={16} />
                      </Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {profile.organization_name || 'Independent Customer'}
                      </Text>
                    </HStack>
                    {activeProfile.id === profile.id && (
                      <Box color="green.500">
                        <FiCheck size={16} />
                      </Box>
                    )}
                  </HStack>
                </MenuItem>
              ))}
          </>
        )}
      </MenuContent>
    </MenuRoot>
  );
};

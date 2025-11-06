/**
 * Organization Switcher Component
 * Dropdown to switch between user's organizations
 */

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Spinner,
  Stack,
  Portal,
} from '@chakra-ui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useUserOrganizations, useCurrentOrganization, useSwitchOrganization } from '@/hooks';

const OrganizationSwitcher = () => {
  const { data: organizations, isLoading: orgsLoading } = useUserOrganizations();
  const { data: currentOrg, isLoading: currentLoading } = useCurrentOrganization();
  const switchOrganization = useSwitchOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitch = (orgId: string | number) => {
    const orgIdStr = typeof orgId === 'number' ? orgId.toString() : orgId;
    if (orgIdStr === currentOrg?.id?.toString()) return;
    
    switchOrganization.mutate(orgIdStr, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  if (orgsLoading || currentLoading) {
    return (
      <HStack gap={2} px={3} py={1.5} color="gray.500">
        <Spinner size="xs" />
        <Text fontSize="sm">Loading...</Text>
      </HStack>
    );
  }

  if (!currentOrg || !organizations || organizations.length === 0) {
    return null;
  }

  const planName = currentOrg.subscription_plan || 'Free';

  return (
    <Box position="relative">
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        colorPalette="gray"
        _hover={{ bg: 'gray.100' }}
        px={3}
      >
        <HStack gap={2}>
          <Box
            w={6}
            h={6}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            color="white"
            fontWeight="bold"
          >
            {currentOrg.name.charAt(0)}
          </Box>
          <VStack align="start" gap={0} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" fontWeight="medium" lineHeight="1.2">
              {currentOrg.name}
            </Text>
            <Text fontSize="xs" color="gray.500" lineHeight="1">
              {planName}
            </Text>
          </VStack>
          <FiChevronDown size={14} />
        </HStack>
      </Button>

      {isOpen && (
        <Portal>
          <Box
            ref={menuRef}
            position="fixed"
            top={buttonRef.current ? `${buttonRef.current.getBoundingClientRect().bottom + 8}px` : '60px'}
            left={buttonRef.current ? `${buttonRef.current.getBoundingClientRect().left}px` : 'auto'}
            minW="280px"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            boxShadow="lg"
            zIndex={1500}
            overflow="hidden"
          >
            <Box px={3} py={2} borderBottomWidth="1px" borderColor="gray.100" bg="gray.50">
              <Text fontSize="xs" fontWeight="semibold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Switch Organization
              </Text>
            </Box>

            <Stack gap={0} maxH="400px" overflowY="auto">
              {organizations.map((org) => {
                const isActive = org.id === currentOrg.id;

                return (
                  <Box
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    cursor={isActive ? 'default' : 'pointer'}
                    px={3}
                    py={2.5}
                    _hover={!isActive ? { bg: 'gray.50' } : {}}
                    transition="background 0.2s"
                    opacity={switchOrganization.isPending ? 0.5 : 1}
                    pointerEvents={switchOrganization.isPending ? 'none' : 'auto'}
                  >
                    <HStack justify="space-between" w="full">
                      <HStack gap={2.5}>
                        <Box
                          w={8}
                          h={8}
                          bg={
                            isActive
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'gray.100'
                          }
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="sm"
                          color={isActive ? 'white' : 'gray.600'}
                          fontWeight="bold"
                        >
                          {org.name.charAt(0)}
                        </Box>
                        <VStack align="start" gap={0.5}>
                          <Text fontSize="sm" fontWeight="medium">
                            {org.name}
                          </Text>
                          <HStack gap={2} flexWrap="wrap">
                            <Text fontSize="xs" color="gray.500">
                              {org.subscription_plan || 'Free'}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      {isActive && (
                        <Box color="purple.600">
                          <FiCheck size={16} />
                        </Box>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default OrganizationSwitcher;

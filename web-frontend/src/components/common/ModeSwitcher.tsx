import { HStack, Text, Box } from '@chakra-ui/react';
import { Switch as ChakraSwitch } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingBag } from 'react-icons/fi';
import { useAccountMode } from '@/contexts/AccountModeContext';

export const ModeSwitcher = () => {
  const navigate = useNavigate();
  const { toggleMode, isClientMode, isVendorMode } = useAccountMode();

  const handleToggle = () => {
    toggleMode();
    // Navigate to appropriate dashboard after mode switch
    if (isClientMode) {
      // Switching from client to vendor
      navigate('/dashboard');
    } else {
      // Switching from vendor to client
      navigate('/client/dashboard');
    }
  };

  return (
    <HStack
      gap={3}
      bg="white"
      px={4}
      py={2}
      borderRadius="full"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
    >
      {/* Client Icon */}
      <HStack gap={2}>
        <Box
          p={1.5}
          borderRadius="md"
          bg={isClientMode ? 'blue.100' : 'gray.100'}
          color={isClientMode ? 'blue.600' : 'gray.500'}
          transition="all 0.2s"
        >
          <FiUser size={16} />
        </Box>
        <Text
          fontSize="sm"
          fontWeight={isClientMode ? 'bold' : 'medium'}
          color={isClientMode ? 'blue.600' : 'gray.600'}
          transition="all 0.2s"
        >
          Client
        </Text>
      </HStack>

      {/* Switch */}
      <ChakraSwitch.Root
        checked={isVendorMode}
        onCheckedChange={handleToggle}
        colorPalette="purple"
        size="md"
      >
        <ChakraSwitch.HiddenInput />
        <ChakraSwitch.Control>
          <ChakraSwitch.Thumb />
        </ChakraSwitch.Control>
      </ChakraSwitch.Root>

      {/* Vendor Icon */}
      <HStack gap={2}>
        <Box
          p={1.5}
          borderRadius="md"
          bg={isVendorMode ? 'purple.100' : 'gray.100'}
          color={isVendorMode ? 'purple.600' : 'gray.500'}
          transition="all 0.2s"
        >
          <FiShoppingBag size={16} />
        </Box>
        <Text
          fontSize="sm"
          fontWeight={isVendorMode ? 'bold' : 'medium'}
          color={isVendorMode ? 'purple.600' : 'gray.600'}
          transition="all 0.2s"
        >
          Vendor
        </Text>
      </HStack>
    </HStack>
  );
};

export default ModeSwitcher;

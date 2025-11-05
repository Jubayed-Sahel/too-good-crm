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
      gap={{ base: 1.5, md: 3 }}
      bg="white"
      px={{ base: 2, md: 4 }}
      py={{ base: 1.5, md: 2 }}
      borderRadius="full"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      flexShrink={0}
    >
      {/* Client Icon */}
      <HStack gap={{ base: 1, md: 2 }}>
        <Box
          p={{ base: 1, md: 1.5 }}
          borderRadius="md"
          bg={isClientMode ? 'blue.100' : 'gray.100'}
          color={isClientMode ? 'blue.600' : 'gray.500'}
          transition="all 0.2s"
        >
          <FiUser size={14} />
        </Box>
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          fontWeight={isClientMode ? 'bold' : 'medium'}
          color={isClientMode ? 'blue.600' : 'gray.600'}
          transition="all 0.2s"
          display={{ base: 'none', sm: 'block' }}
        >
          Client
        </Text>
      </HStack>

      {/* Switch */}
      <ChakraSwitch.Root
        checked={isVendorMode}
        onCheckedChange={handleToggle}
        colorPalette="purple"
        size={{ base: 'sm', md: 'md' }}
      >
        <ChakraSwitch.HiddenInput />
        <ChakraSwitch.Control>
          <ChakraSwitch.Thumb />
        </ChakraSwitch.Control>
      </ChakraSwitch.Root>

      {/* Vendor Icon */}
      <HStack gap={{ base: 1, md: 2 }}>
        <Box
          p={{ base: 1, md: 1.5 }}
          borderRadius="md"
          bg={isVendorMode ? 'purple.100' : 'gray.100'}
          color={isVendorMode ? 'purple.600' : 'gray.500'}
          transition="all 0.2s"
        >
          <FiShoppingBag size={14} />
        </Box>
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          fontWeight={isVendorMode ? 'bold' : 'medium'}
          color={isVendorMode ? 'purple.600' : 'gray.600'}
          transition="all 0.2s"
          display={{ base: 'none', sm: 'block' }}
        >
          Vendor
        </Text>
      </HStack>
    </HStack>
  );
};

export default ModeSwitcher;

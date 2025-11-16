/**
 * Access Denied Component
 * Shows a message when user doesn't have permission to access a resource
 */
import { Box, VStack, Heading, Text, Icon } from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';

interface AccessDeniedProps {
  resource?: string;
  message?: string;
}

export const AccessDenied = ({ 
  resource, 
  message = "You don't have access to this feature" 
}: AccessDeniedProps) => {
  return (
    <Box
      w="full"
      h="full"
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <VStack gap={4} textAlign="center" maxW="500px">
        <Box
          w={20}
          h={20}
          borderRadius="full"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={FiLock} fontSize="3xl" color="gray.400" />
        </Box>
        <VStack gap={2}>
          <Heading size="lg" color="gray.700">
            Access Denied
          </Heading>
          <Text color="gray.600" fontSize="md">
            {message}
          </Text>
          {resource && (
            <Text color="gray.500" fontSize="sm" mt={2}>
              Required permission: <strong>{resource}</strong>
            </Text>
          )}
        </VStack>
        <Text color="gray.500" fontSize="sm" mt={4}>
          Please contact your administrator if you believe you should have access to this feature.
        </Text>
      </VStack>
    </Box>
  );
};


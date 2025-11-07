import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

/**
 * Loading state component for Customers page
 * 
 * Simple, reusable component that displays a loading spinner
 * with appropriate messaging while customer data is being fetched.
 */
export const CustomersPageLoading: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12} gap={3}>
      <Spinner size="xl" color="purple.500" />
      <Text color="gray.600" fontSize="md">
        Loading customers...
      </Text>
    </Box>
  );
};

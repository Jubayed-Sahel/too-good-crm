/**
 * DealsPageLoading - Loading State Component
 */
import { Box, VStack, Spinner, Text } from '@chakra-ui/react';

export const DealsPageLoading: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" py={12}>
      <VStack gap={4}>
        <Spinner size="xl" color="purple.500" />
        <Text color="gray.500">Loading deals...</Text>
      </VStack>
    </Box>
  );
};

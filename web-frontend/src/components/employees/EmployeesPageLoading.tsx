/**
 * EmployeesPageLoading - Loading State Component
 * 
 * Displays a skeleton/loading state while employee data is being fetched
 */
import { VStack, Box, Skeleton, SimpleGrid, Grid } from '@chakra-ui/react';

export const EmployeesPageLoading = () => {
  return (
    <VStack gap={5} align="stretch">
      {/* Header Skeleton */}
      <Box>
        <Skeleton height="40px" width="200px" mb={2} />
        <Skeleton height="20px" width="400px" />
      </Box>

      {/* Stats Skeleton */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
        {[1, 2, 3].map((i) => (
          <Box key={i} p={{ base: 5, md: 6 }} bg="white" borderRadius="xl" border="1px" borderColor="gray.200">
            <Skeleton height="20px" width="120px" mb={3} />
            <Skeleton height="32px" width="60px" />
          </Box>
        ))}
      </SimpleGrid>

      {/* Employee Cards Skeleton */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={5}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Box key={i} p={{ base: 5, md: 6 }} bg="white" borderRadius="xl" border="1px" borderColor="gray.200">
            <VStack align="start" gap={3}>
              <Skeleton height="24px" width="150px" />
              <Skeleton height="16px" width="100px" />
              <VStack align="start" gap={2} w="full">
                <Skeleton height="16px" width="200px" />
                <Skeleton height="16px" width="160px" />
                <Skeleton height="16px" width="120px" />
              </VStack>
            </VStack>
          </Box>
        ))}
      </Grid>
    </VStack>
  );
};

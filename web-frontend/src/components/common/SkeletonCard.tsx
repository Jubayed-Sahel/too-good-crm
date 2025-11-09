import { Box, Skeleton, VStack, HStack, Stack } from '@chakra-ui/react';

interface SkeletonCardProps {
  variant?: 'stat' | 'info' | 'table' | 'detail';
}

export const SkeletonCard = ({ variant = 'info' }: SkeletonCardProps) => {
  if (variant === 'stat') {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="sm"
        p={6}
        borderWidth="1px"
        borderColor="gray.200"
      >
        <HStack justify="space-between" align="start" mb={4}>
          <VStack align="start" gap={2} flex={1}>
            <Skeleton height="16px" width="120px" borderRadius="md" />
            <Skeleton height="48px" width="100px" borderRadius="md" />
          </VStack>
          <Skeleton height="56px" width="56px" borderRadius="lg" />
        </HStack>
        <HStack gap={2}>
          <Skeleton height="20px" width="60px" borderRadius="md" />
          <Skeleton height="16px" width="100px" borderRadius="md" />
        </HStack>
      </Box>
    );
  }

  if (variant === 'table') {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="sm"
        p={4}
        borderWidth="1px"
        borderColor="gray.200"
      >
        <Stack gap={3}>
          {[...Array(5)].map((_, i) => (
            <HStack key={i} gap={4}>
              <Skeleton height="40px" flex={1} borderRadius="md" />
              <Skeleton height="40px" width="100px" borderRadius="md" />
              <Skeleton height="40px" width="80px" borderRadius="md" />
            </HStack>
          ))}
        </Stack>
      </Box>
    );
  }

  if (variant === 'detail') {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="sm"
        p={6}
        borderWidth="1px"
        borderColor="gray.200"
      >
        <VStack align="stretch" gap={4}>
          <Skeleton height="32px" width="200px" borderRadius="md" />
          <Skeleton height="20px" width="full" borderRadius="md" />
          <Skeleton height="20px" width="80%" borderRadius="md" />
          <Skeleton height="20px" width="90%" borderRadius="md" />
          <Box mt={4}>
            <Skeleton height="40px" width="120px" borderRadius="lg" />
          </Box>
        </VStack>
      </Box>
    );
  }

  // Default 'info' variant
  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      p={6}
      borderWidth="1px"
      borderColor="gray.200"
    >
      <HStack gap={3} mb={4}>
        <Skeleton height="40px" width="40px" borderRadius="lg" />
        <Skeleton height="24px" width="150px" borderRadius="md" />
      </HStack>
      <VStack align="stretch" gap={2}>
        <Skeleton height="16px" width="full" borderRadius="md" />
        <Skeleton height="16px" width="90%" borderRadius="md" />
        <Skeleton height="16px" width="80%" borderRadius="md" />
      </VStack>
    </Box>
  );
};

export default SkeletonCard;


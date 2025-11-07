import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * ErrorState Component
 * 
 * Reusable component for displaying error states across the application.
 * Provides consistent error messaging and optional retry functionality.
 * 
 * @example
 * ```tsx
 * if (error) {
 *   return <ErrorState error={error} onRetry={refetch} />;
 * }
 * ```
 */
export const ErrorState = ({
  title = 'Failed to load data',
  message,
  error,
  onRetry,
}: ErrorStateProps) => {
  const errorMessage = message || error?.message || 'Please try again later';

  return (
    <Box textAlign="center" py={12}>
      <VStack gap={4}>
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          w={16}
          h={16}
          borderRadius="full"
          bg="red.50"
          color="red.600"
          mb={2}
        >
          <FiAlertCircle size={32} />
        </Box>
        
        <Heading size="md" color="red.600">
          {title}
        </Heading>
        
        <Text color="gray.500" maxW="md">
          {errorMessage}
        </Text>

        {onRetry && (
          <Button
            onClick={onRetry}
            colorPalette="red"
            variant="outline"
            mt={2}
          >
            Try Again
          </Button>
        )}
      </VStack>
    </Box>
  );
};

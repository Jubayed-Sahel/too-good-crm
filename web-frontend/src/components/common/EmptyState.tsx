import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FiInbox, FiPlus } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionIcon
}: EmptyStateProps) => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="sm"
      p={12}
      borderWidth="1px"
      borderColor="gray.200"
      textAlign="center"
    >
      <VStack gap={4} maxW="md" mx="auto">
        {/* Icon */}
        <Box
          w={20}
          h={20}
          bg="gray.50"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="gray.400"
          fontSize="4xl"
        >
          {icon || <FiInbox size={48} />}
        </Box>

        {/* Title */}
        <Heading size="lg" color="gray.800" fontWeight="bold">
          {title}
        </Heading>

        {/* Description */}
        <Text color="gray.600" fontSize="md" maxW="sm">
          {description}
        </Text>

        {/* Action Button */}
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            colorPalette="purple"
            size="lg"
            mt={4}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            fontWeight="bold"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
          >
            {actionIcon || <FiPlus />}
            <Text ml={2}>{actionLabel}</Text>
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState;


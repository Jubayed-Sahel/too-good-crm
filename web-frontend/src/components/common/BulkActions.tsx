import { HStack, Button, Text, Box } from '@chakra-ui/react';
import { FiDownload, FiTrash2, FiX } from 'react-icons/fi';

interface BulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
  isLoading?: boolean;
  resourceName?: string;
}

export const BulkActions = ({
  selectedCount,
  onExport,
  onDelete,
  onClear,
  isLoading = false,
  resourceName = 'items',
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <Box
      position="fixed"
      bottom={6}
      left="50%"
      transform="translateX(-50%)"
      zIndex={100}
      bg="white"
      borderRadius="xl"
      boxShadow="2xl"
      borderWidth="1px"
      borderColor="gray.200"
      p={4}
      minW="400px"
    >
      <HStack justify="space-between" align="center">
        <HStack gap={3}>
          <Box
            bg="purple.500"
            color="white"
            borderRadius="full"
            w={8}
            h={8}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            fontSize="sm"
          >
            {selectedCount}
          </Box>
          <Text fontWeight="semibold" color="gray.700">
            {selectedCount} {resourceName} selected
          </Text>
        </HStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="ghost"
            colorPalette="blue"
            onClick={onExport}
            disabled={isLoading}
          >
            <FiDownload />
            Export
          </Button>
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={onDelete}
            disabled={isLoading}
          >
            <FiTrash2 />
            Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            disabled={isLoading}
          >
            <FiX />
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

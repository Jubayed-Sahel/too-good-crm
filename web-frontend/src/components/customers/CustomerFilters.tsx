import {
  Box,
  HStack,
  Input,
  Button,
  Stack,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';

interface CustomerFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onAddCustomer: () => void;
}

const CustomerFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onAddCustomer,
}: CustomerFiltersProps) => {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      justifyContent="space-between"
      alignItems={{ base: 'stretch', md: 'center' }}
    >
      {/* Search and Filter */}
      <Stack direction={{ base: 'column', sm: 'row' }} gap={3} flex="1">
        <Box position="relative" flex="1" maxW={{ base: '100%', md: '400px' }}>
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            ps="40px"
          />
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
          >
            <FiSearch color="#A0AEC0" />
          </Box>
        </Box>

        <Box width={{ base: '100%', sm: '180px' }}>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </Box>
      </Stack>

      {/* Action Buttons */}
      <HStack gap={2}>
        <Button
          variant="outline"
          size={{ base: 'md', md: 'sm' }}
          display={{ base: 'none', sm: 'inline-flex' }}
        >
          <FiFilter />
          <Box ml={2}>More Filters</Box>
        </Button>

        <Button
          colorPalette="purple"
          size={{ base: 'md', md: 'sm' }}
          onClick={onAddCustomer}
        >
          <FiPlus />
          <Box ml={2}>Add Customer</Box>
        </Button>
      </HStack>
    </Stack>
  );
};

export default CustomerFilters;

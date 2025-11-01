import {
  Box,
  HStack,
  Input,
  Button,
  Stack,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

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
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
            color="gray.400"
          >
            <FiSearch size={18} />
          </Box>
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pl="40px"
            h="40px"
          />
        </Box>

        <CustomSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'pending', label: 'Pending' },
          ]}
          width={{ base: '100%', sm: '180px' }}
          accentColor="purple"
        />
      </Stack>

      {/* Action Buttons */}
      <HStack gap={2}>
        <Button
          variant="outline"
          h="40px"
          display={{ base: 'none', sm: 'inline-flex' }}
        >
          <FiFilter />
          <Box ml={2}>More Filters</Box>
        </Button>

        <Button
          colorPalette="purple"
          h="40px"
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

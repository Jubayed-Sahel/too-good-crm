import {
  Box,
  HStack,
  Input,
  Button,
  Stack,
} from '@chakra-ui/react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import CustomSelect from '@/components/ui/CustomSelect';

interface VendorFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categories: string[];
}

const VendorFilters = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  categories,
}: VendorFiltersProps) => {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={3}
      justify="space-between"
      align={{ base: 'stretch', md: 'center' }}
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
            <FiSearch size={20} />
          </Box>
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pl="40px"
            h="40px"
            borderRadius="lg"
          />
        </Box>

        <CustomSelect
          value={categoryFilter}
          onChange={onCategoryChange}
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          width={{ base: '100%', sm: '200px' }}
          accentColor="blue"
        />

        <CustomSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          width={{ base: '100%', sm: '180px' }}
          accentColor="blue"
        />
      </Stack>

      {/* Action Buttons */}
      <HStack gap={2}>

      </HStack>
    </Stack>
  );
};

export default VendorFilters;

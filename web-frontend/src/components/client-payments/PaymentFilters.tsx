import {
  Box,
  HStack,
  Input,
  Button,
  Stack,
} from '@chakra-ui/react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

interface PaymentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  vendorFilter: string;
  onVendorChange: (value: string) => void;
  vendors: string[];
}

const PaymentFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  vendorFilter,
  onVendorChange,
  vendors,
}: PaymentFiltersProps) => {
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
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pl="40px"
            h="40px"
            borderRadius="lg"
          />
        </Box>

        <CustomSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'refunded', label: 'Refunded' },
          ]}
          width={{ base: '100%', sm: '180px' }}
          accentColor="blue"
        />

        <CustomSelect
          value={vendorFilter}
          onChange={onVendorChange}
          options={[
            { value: 'all', label: 'All Vendors' },
            ...vendors.map(vendor => ({ value: vendor, label: vendor }))
          ]}
          width={{ base: '100%', sm: '200px' }}
          accentColor="blue"
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
      </HStack>
    </Stack>
  );
};

export default PaymentFilters;

import { 
  Box, 
  HStack, 
  Input, 
  Button, 
  Stack,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

interface DealsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: string;
  onStageFilterChange: (stage: string) => void;
  onAddDeal: () => void;
}

const DealsFilters = ({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  onAddDeal,
}: DealsFiltersProps) => {
  return (
    <Box>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
      >
        {/* Left side - Search and Filter */}
        <HStack gap={3} flex="1" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
          {/* Search */}
          <Box position="relative" flex="1" minW={{ base: '100%', md: '300px' }}>
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
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              pl="40px"
              h="40px"
              borderRadius="lg"
            />
          </Box>

          {/* Stage Filter */}
          <CustomSelect
            value={stageFilter}
            onChange={onStageFilterChange}
            options={[
              { value: 'all', label: 'All Stages' },
              { value: 'lead', label: 'Lead' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closed-won', label: 'Closed Won' },
              { value: 'closed-lost', label: 'Closed Lost' },
            ]}
            width={{ base: '100%', md: 'auto' }}
            minWidth="160px"
            accentColor="blue"
          />

        </HStack>

        {/* Right side - Action Buttons */}
        <HStack gap={2}>
          <Button
            colorPalette="purple"
            h="40px"
            onClick={onAddDeal}
            w={{ base: '100%', md: 'auto' }}
          >
            <FiPlus />
            <Box ml={2}>Add Deal</Box>
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default DealsFilters;

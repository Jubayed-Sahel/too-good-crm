import { Box, HStack, Input, Button, Stack } from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';

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
              <FiSearch size={18} />
            </Box>
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              pl="40px"
              size="md"
              borderRadius="lg"
            />
          </Box>

          {/* Stage Filter */}
          <Box w={{ base: '100%', md: 'auto' }}>
            <select
              value={stageFilter}
              onChange={(e) => onStageFilterChange(e.target.value)}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                width: '100%',
                minWidth: '160px',
              }}
            >
              <option value="all">All Stages</option>
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
          </Box>

          {/* More Filters Button */}
          <Button
            variant="outline"
            size="md"
            display={{ base: 'none', lg: 'flex' }}
          >
            <FiFilter />
            <Box ml={2}>More Filters</Box>
          </Button>
        </HStack>

        {/* Right side - Action Buttons */}
        <HStack gap={2}>
          <Button
            colorPalette="blue"
            size="md"
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

import { Box, HStack, Input, Button, Stack } from '@chakra-ui/react';
import { FiSearch, FiPlus, FiFilter } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';
import { useAccountMode } from '@/contexts/AccountModeContext';
import type { ActivityType, ActivityStatus } from '@/types/activity.types';

interface ActivityFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: ActivityType | 'all';
  onTypeChange: (value: string) => void;
  statusFilter: ActivityStatus | 'all';
  onStatusChange: (value: string) => void;
  onAddActivity?: () => void; // Optional - only provided if user has create permission
  onClearFilters: () => void;
}

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'call', label: 'Calls' },
  { value: 'email', label: 'Emails' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'Notes' },
  { value: 'task', label: 'Tasks' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ActivityFiltersBar = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onAddActivity,
  onClearFilters,
}: ActivityFiltersBarProps) => {
  const { isClientMode } = useAccountMode();
  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <Box>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
      >
        {/* Left side - Search and Filters */}
        <HStack gap={3} flex="1" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
          {/* Search Input */}
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
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              pl="40px"
              h="40px"
              borderRadius="lg"
            />
          </Box>

          {/* Type Filter */}
          <CustomSelect
            value={typeFilter}
            onChange={onTypeChange}
            options={typeOptions}
            placeholder="Filter by type"
            width={{ base: '100%', md: 'auto' }}
            minWidth="160px"
            accentColor={isClientMode ? "blue" : "purple"}
          />

          {/* Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="Filter by status"
            width={{ base: '100%', md: 'auto' }}
            minWidth="160px"
            accentColor={isClientMode ? "blue" : "purple"}
          />

          {/* More Filters / Clear Filters Button */}
          {hasActiveFilters ? (
            <Button
              variant="outline"
              h="40px"
              onClick={onClearFilters}
              display={{ base: 'none', lg: 'flex' }}
            >
              <Box ml={2}>Clear Filters</Box>
            </Button>
          ) : (
            <Button
              variant="outline"
              h="40px"
              display={{ base: 'none', lg: 'flex' }}
            >
              <FiFilter />
              <Box ml={2}>More Filters</Box>
            </Button>
          )}
        </HStack>

        {/* Right side - Action Buttons */}
        {onAddActivity && (
          <HStack gap={2}>
            <Button
              colorPalette={isClientMode ? "blue" : "purple"}
              h="40px"
              onClick={onAddActivity}
              w={{ base: '100%', md: 'auto' }}
            >
              <FiPlus />
              <Box ml={2}>New Activity</Box>
            </Button>
          </HStack>
        )}
      </Stack>
    </Box>
  );
};

export default ActivityFiltersBar;

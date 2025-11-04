import { HStack, Input, Button, Stack, Text } from '@chakra-ui/react';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';
import { Card } from '../common';
import type { ActivityType, ActivityStatus } from '@/types/activity.types';

interface ActivityFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: ActivityType | 'all';
  onTypeChange: (value: string) => void;
  statusFilter: ActivityStatus | 'all';
  onStatusChange: (value: string) => void;
  onAddActivity: () => void;
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
  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <Card>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        {/* Search Input */}
        <HStack
          flex={{ base: '1', md: '2' }}
          bg="gray.50"
          borderRadius="md"
          px={3}
          py={2}
        >
          <FiSearch size={18} color="#9CA3AF" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            variant="flushed"
            size="sm"
            border="none"
            _focus={{ border: 'none', boxShadow: 'none' }}
          />
        </HStack>

        {/* Type Filter */}
        <CustomSelect
          value={typeFilter}
          onChange={onTypeChange}
          options={typeOptions}
          placeholder="Filter by type"
          width={{ base: '100%', md: '180px' }}
        />

        {/* Status Filter */}
        <CustomSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="Filter by status"
          width={{ base: '100%', md: '180px' }}
        />

        {/* Action Buttons */}
        <HStack gap={2} justify={{ base: 'stretch', md: 'flex-end' }}>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              colorPalette="gray"
              onClick={onClearFilters}
              size="sm"
            >
              <HStack gap={2}>
                <FiX size={16} />
                <Text>Clear Filters</Text>
              </HStack>
            </Button>
          )}

          <Button
            colorPalette="purple"
            onClick={onAddActivity}
            size="sm"
            height="40px"
          >
            <HStack gap={2}>
              <FiPlus size={18} />
              <Text>New Activity</Text>
            </HStack>
          </Button>
        </HStack>
      </Stack>
    </Card>
  );
};

export default ActivityFiltersBar;

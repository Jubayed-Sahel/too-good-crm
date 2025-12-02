import { Box, HStack, Input, Button, Stack } from '@chakra-ui/react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import CustomSelect from '@/components/ui/CustomSelect';
import type { IssueStatus, IssuePriority, IssueCategory } from '@/types';

interface IssueFiltersPanelProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: IssueStatus | 'all';
  onStatusChange: (value: IssueStatus | 'all') => void;
  priorityFilter: IssuePriority | 'all';
  onPriorityChange: (value: IssuePriority | 'all') => void;
  categoryFilter: IssueCategory | 'all';
  onCategoryChange: (value: IssueCategory | 'all') => void;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'quality', label: 'Quality' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'payment', label: 'Payment' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other' },
];

const IssueFiltersPanel = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
}: IssueFiltersPanelProps) => {
  const hasActiveFilters = 
    searchQuery || 
    statusFilter !== 'all' || 
    priorityFilter !== 'all' ||
    categoryFilter !== 'all';

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onPriorityChange('all');
    onCategoryChange('all');
  };

  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={3}
      justify="space-between"
      align={{ base: 'stretch', md: 'center' }}
    >
      {/* Left side - Search and Filters */}
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
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pl="40px"
            h="40px"
            borderRadius="lg"
          />
        </Box>

        {/* Status Filter */}
        <CustomSelect
          value={statusFilter}
          onChange={(value: string) => onStatusChange(value as IssueStatus | 'all')}
          options={statusOptions}
          width={{ base: '100%', md: 'auto' }}
          minWidth="150px"
          accentColor="purple"
        />

        {/* Priority Filter */}
        <CustomSelect
          value={priorityFilter}
          onChange={(value: string) => onPriorityChange(value as IssuePriority | 'all')}
          options={priorityOptions}
          width={{ base: '100%', md: 'auto' }}
          minWidth="150px"
          accentColor="purple"
        />

        {/* Category Filter */}
        <CustomSelect
          value={categoryFilter}
          onChange={(value: string) => onCategoryChange(value as IssueCategory | 'all')}
          options={categoryOptions}
          width={{ base: '100%', md: 'auto' }}
          minWidth="170px"
          accentColor="purple"
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            h="40px"
            onClick={handleClearFilters}
            display={{ base: 'none', lg: 'flex' }}
          >
            <FiX />
            <Box ml={2}>Clear</Box>
          </Button>
        )}
      </HStack>
    </Stack>
  );
};

export default IssueFiltersPanel;

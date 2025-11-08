import { Box, HStack, Input, Button, Select as ChakraSelect } from '@chakra-ui/react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
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
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <HStack gap={3} flexWrap="wrap">
        {/* Search */}
        <Box flex="1" minW="250px" position="relative">
          <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex={1} color="gray.400">
            <FiSearch />
          </Box>
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pl="10"
          />
        </Box>

        {/* Status Filter */}
        <Box w="150px">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as IssueStatus | 'all')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
            }}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </Box>

        {/* Priority Filter */}
        <Box w="150px">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as IssuePriority | 'all')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
            }}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </Box>

        {/* Category Filter */}
        <Box w="170px">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as IssueCategory | 'all')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
            }}
          >
            <option value="all">All Categories</option>
            <option value="quality">Quality</option>
            <option value="delivery">Delivery</option>
            <option value="payment">Payment</option>
            <option value="communication">Communication</option>
            <option value="other">Other</option>
          </select>
        </Box>

        {/* Filter Icon */}
        <Box color="gray.500">
          <FiFilter size={20} />
        </Box>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            size="sm"
            colorPalette="red"
          >
            <FiX />
            <Box ml={1}>Clear</Box>
          </Button>
        )}
      </HStack>
    </Box>
  );
};

export default IssueFiltersPanel;

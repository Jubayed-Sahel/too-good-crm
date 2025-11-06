import { Box, Stack, Input, Button, HStack } from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

interface IssueFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  onCreateIssue: () => void;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const IssueFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  onCreateIssue,
}: IssueFiltersProps) => {
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
              <FiSearch size={18} />
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
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="Filter by status"
            width={{ base: '100%', md: 'auto' }}
            minWidth="160px"
            accentColor="blue"
          />

          {/* Priority Filter */}
          <CustomSelect
            value={priorityFilter}
            onChange={onPriorityChange}
            options={priorityOptions}
            placeholder="Filter by priority"
            width={{ base: '100%', md: 'auto' }}
            minWidth="160px"
            accentColor="blue"
          />
        </HStack>

        {/* Right side - Action Button */}
        <HStack gap={2}>
          <Button
            colorPalette="blue"
            h="40px"
            onClick={onCreateIssue}
            w={{ base: '100%', md: 'auto' }}
          >
            <FiPlus />
            <Box ml={2}>New Issue</Box>
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default IssueFilters;

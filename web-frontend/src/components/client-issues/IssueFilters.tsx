import { Stack, Input, Button, HStack, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';

interface IssueFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  onCreateIssue: () => void;
}

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
    <Stack direction={{ base: 'column', md: 'row' }} gap={4} align="stretch">
      {/* Search */}
      <HStack flex={1} maxW={{ base: 'full', md: '400px' }}>
        <FiSearch color="#3b82f6" />
        <Input
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="lg"
        />
      </HStack>

      {/* Status Filter */}
      <NativeSelectRoot size="lg">
        <NativeSelectField
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </NativeSelectField>
      </NativeSelectRoot>

      {/* Priority Filter */}
      <NativeSelectRoot size="lg">
        <NativeSelectField
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </NativeSelectField>
      </NativeSelectRoot>

      {/* Create Button */}
      <Button
        colorPalette="blue"
        size="lg"
        onClick={onCreateIssue}
      >
        <FiPlus />
        New Issue
      </Button>
    </Stack>
  );
};

export default IssueFilters;

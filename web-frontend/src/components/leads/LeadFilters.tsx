import { Box, HStack, Input, Button, Stack } from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';
import type { LeadFilters as LeadFiltersType, LeadStatus, LeadSource, LeadPriority } from '../../types';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFilterChange: (filters: LeadFiltersType) => void;
  onClearFilters: () => void;
  onAddLead?: () => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email', label: 'Email' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const LeadFilters = ({ filters, onFilterChange, onAddLead }: LeadFiltersProps) => {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={3}
      justify="space-between"
      align={{ base: 'stretch', md: 'center' }}
    >
      {/* Left side - Search and Filters */}
      <HStack gap={3} flex="1" flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
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
            placeholder="Search leads..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            pl="40px"
            h="40px"
            borderRadius="lg"
          />
        </Box>

        {/* Status Filter */}
        <CustomSelect
          value={filters.status || ''}
          onChange={(value: string) => onFilterChange({ ...filters, status: (value || undefined) as LeadStatus | undefined })}
          options={statusOptions}
          width={{ base: '100%', md: 'auto' }}
          minWidth="160px"
          accentColor="purple"
        />

        {/* Source Filter */}
        <CustomSelect
          value={filters.source || ''}
          onChange={(value: string) => onFilterChange({ ...filters, source: (value || undefined) as LeadSource | undefined })}
          options={sourceOptions}
          width={{ base: '100%', md: 'auto' }}
          minWidth="160px"
          accentColor="purple"
        />

        {/* Priority Filter */}
        <CustomSelect
          value={filters.priority || ''}
          onChange={(value: string) => onFilterChange({ ...filters, priority: (value || undefined) as LeadPriority | undefined })}
          options={priorityOptions}
          width={{ base: '100%', md: 'auto' }}
          minWidth="160px"
          accentColor="purple"
        />

        {/* More Filters Button */}
        <Button
          variant="outline"
          h="40px"
          display={{ base: 'none', lg: 'flex' }}
        >
          <FiFilter />
          <Box ml={2}>More Filters</Box>
        </Button>
      </HStack>

      {/* Right side - Action Buttons */}
      <HStack gap={2}>
        {onAddLead && (
          <Button
            colorPalette="purple"
            h="40px"
            onClick={onAddLead}
            w={{ base: '100%', md: 'auto' }}
          >
            <FiPlus />
            <Box ml={2}>New Lead</Box>
          </Button>
        )}
      </HStack>
    </Stack>
  );
};

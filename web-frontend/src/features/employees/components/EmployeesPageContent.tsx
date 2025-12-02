/**
 * EmployeesPageContent - Presentation Component
 * 
 * Pure UI component that receives all data and handlers as props.
 * This component is responsible ONLY for rendering the UI.
 */
import React from 'react';
import { Box, Text, VStack, HStack, Stack, SimpleGrid, Input } from '@chakra-ui/react';
import { FiUserPlus, FiSearch } from 'react-icons/fi';
import { PageHeader, StandardButton, StandardCard } from '@/components/common';
import CustomSelect from '@/components/ui/CustomSelect';
import EmployeeTable from './EmployeeTable';
import type { Employee } from '@/services';

export interface EmployeesPageContentProps {
  // Data
  employees: Employee[];
  stats: {
    total: number;
    active: number;
    departments: number;
  };
  
  // Filter state
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  
  // Action handlers
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onView?: (employee: Employee) => void;
  onBulkDelete?: (employeeIds: string[]) => void;
  onBulkExport?: (employeeIds: string[]) => void;
  onInviteEmployee: () => void;
  onRoleUpdate?: () => void;
  
  // Dialog state
  isInviteDialogOpen: boolean;
  onCloseInviteDialog: () => void;
}

export const EmployeesPageContent: React.FC<EmployeesPageContentProps> = ({
  employees,
  stats,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  onBulkExport,
  onInviteEmployee,
  onRoleUpdate,
}) => {
  return (
    <VStack gap={5} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Employees"
        description="Manage your team members, roles, and permissions"
        actions={
          <StandardButton
            variant="primary"
            leftIcon={<FiUserPlus />}
            onClick={onInviteEmployee}
          >
            Invite Employee
          </StandardButton>
        }
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Total Employees
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.900">
              {stats.total}
            </Text>
          </VStack>
        </StandardCard>

        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Active
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="green.600">
              {stats.active}
            </Text>
          </VStack>
        </StandardCard>

        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Departments
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.600">
              {stats.departments}
            </Text>
          </VStack>
        </StandardCard>
      </SimpleGrid>

      {/* Filters */}
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
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              pl="40px"
              h="40px"
              borderRadius="lg"
            />
          </Box>

          {/* Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={(value: string) => onStatusChange?.(value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'on-leave', label: 'On Leave' },
              { value: 'terminated', label: 'Terminated' },
            ]}
            width={{ base: '100%', md: 'auto' }}
            minWidth="160px"
            accentColor="purple"
          />
        </HStack>
      </Stack>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onBulkDelete={onBulkDelete}
        onBulkExport={onBulkExport}
        onRoleUpdate={onRoleUpdate}
      />
    </VStack>
  );
};

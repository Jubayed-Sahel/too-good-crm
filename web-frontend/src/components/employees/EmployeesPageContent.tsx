/**
 * EmployeesPageContent - Presentation Component
 * 
 * Pure UI component that receives all data and handlers as props.
 * This component is responsible ONLY for rendering the UI.
 */
import React from 'react';
import { Box, Text, VStack, HStack, SimpleGrid, Input } from '@chakra-ui/react';
import { FiUserPlus, FiSearch } from 'react-icons/fi';
import { PageHeader, StandardButton, StandardCard } from '@/components/common';
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
      <StandardCard>
        <HStack gap={4} flexWrap="wrap">
          {/* Search */}
          <Box flex={{ base: '1', md: '2' }} minW="200px" position="relative">
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" pointerEvents="none" zIndex={1}>
              <FiSearch size={18} color="#718096" />
            </Box>
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              size="md"
              pl={10}
            />
          </Box>

          {/* Status Filter */}
          <Box flex={{ base: '1', md: '1' }} minW="150px">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange?.(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </Box>
        </HStack>
      </StandardCard>

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

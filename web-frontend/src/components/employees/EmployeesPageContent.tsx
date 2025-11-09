/**
 * EmployeesPageContent - Presentation Component
 * 
 * Pure UI component that receives all data and handlers as props.
 * This component is responsible ONLY for rendering the UI.
 */
import React from 'react';
import { Box, Text, VStack, HStack, SimpleGrid } from '@chakra-ui/react';
import { FiUserPlus } from 'react-icons/fi';
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

      {/* Filters - Now handled by table or separate component */}

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

/**
 * EmployeesPageContent - Presentation Component
 * 
 * Pure UI component that receives all data and handlers as props.
 * This component is responsible ONLY for rendering the UI.
 */
import React from 'react';
import { Box, Text, VStack, Button, HStack, Input } from '@chakra-ui/react';
import { FiUserPlus } from 'react-icons/fi';
import { Card } from '@/components/common';
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
      {/* Stats Cards */}
      <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <Card p={5}>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600">Total Employees</Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.900">
              {stats.total}
            </Text>
          </VStack>
        </Card>

        <Card p={5}>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600">Active</Text>
            <Text fontSize="3xl" fontWeight="bold" color="green.600">
              {stats.active}
            </Text>
          </VStack>
        </Card>

        <Card p={5}>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600">Departments</Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.600">
              {stats.departments}
            </Text>
          </VStack>
        </Card>
      </Box>

      {/* Filters */}
      <Card p={4}>
        <HStack gap={3} flexWrap="wrap">
          {onSearchChange && (
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              size="md"
              maxW="300px"
            />
          )}
          <Box flex={1} />
          <Button
            colorPalette="purple"
            onClick={onInviteEmployee}
          >
            <FiUserPlus />
            Invite Employee
          </Button>
        </HStack>
      </Card>

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

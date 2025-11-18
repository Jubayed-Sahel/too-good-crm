/**
 * Team Members Tab - Manages team members/employees
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, VStack, HStack, SimpleGrid, Text, Stack, Input } from '@chakra-ui/react';
import { FiUserPlus, FiSearch } from 'react-icons/fi';
import { StandardButton, StandardCard } from '@/components/common';
import CustomSelect from '@/components/ui/CustomSelect';
import EmployeeTable from '../employees/EmployeeTable';
import { InviteEmployeeDialog } from '../employees/InviteEmployeeDialog';
import { ConfirmDialog } from '../common';
import { toaster } from '../ui/toaster';
import { useEmployees } from '@/hooks/useEmployees';
import { employeeService } from '@/services';
import type { Employee } from '@/services';
import { exportData } from '@/utils';

export const TeamMembersTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [employeesToBulkDelete, setEmployeesToBulkDelete] = useState<string[]>([]);

  // Data fetching
  const { employees, isLoading, error, refetch } = useEmployees();
  const hasRefetchedRef = useRef(false);
  
  // Refetch employees when navigating back to team page (only once per navigation)
  useEffect(() => {
    // Only refetch when navigating TO /team (not when already on it)
    // This ensures the employee list is up-to-date when returning from edit page
    if (location.pathname === '/team' && !hasRefetchedRef.current) {
      // Small delay to ensure navigation is complete
      const timer = setTimeout(() => {
        console.log('🔄 Refetching employees in TeamMembersTab');
        refetch();
        hasRefetchedRef.current = true;
      }, 300);
      return () => clearTimeout(timer);
    }
    
    // Reset refetch flag when navigating away from /team
    if (location.pathname !== '/team') {
      hasRefetchedRef.current = false;
    }
  }, [location.pathname]); // Removed refetch from dependencies to prevent infinite loop

  // Filter employees based on search and status
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = 
        !searchQuery ||
        (emp.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (emp.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (emp.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (emp.department?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || emp.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    departments: new Set(employees.map(e => e.department).filter(Boolean)).size,
  }), [employees]);

  // Action handlers
  const handleEdit = (employee: Employee) => {
    navigate(`/employees/${employee.id}/edit`);
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      
      toaster.create({
        title: 'Employee deleted',
        description: `${employeeToDelete.first_name} ${employeeToDelete.last_name} has been removed.`,
        type: 'success',
      });
      
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toaster.create({
        title: 'Failed to delete employee',
        description: error.message || 'Please try again.',
        type: 'error',
      });
    }
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleView = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleBulkDelete = (employeeIds: string[]) => {
    if (employeeIds.length === 0) return;
    setEmployeesToBulkDelete(employeeIds);
    setBulkDeleteDialogOpen(true);
  };
  
  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        employeesToBulkDelete.map(id => employeeService.deleteEmployee(parseInt(id)))
      );
      
      toaster.create({
        title: 'Employees deleted',
        description: `${employeesToBulkDelete.length} employee(s) have been removed.`,
        type: 'success',
      });
      
      setBulkDeleteDialogOpen(false);
      setEmployeesToBulkDelete([]);
      refetch();
    } catch (error: any) {
      console.error('Error bulk deleting employees:', error);
      toaster.create({
        title: 'Failed to delete employees',
        description: error.message || 'Please try again.',
        type: 'error',
      });
    }
  };
  
  const closeBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(false);
    setEmployeesToBulkDelete([]);
  };

  const handleBulkExport = (employeeIds: string[]) => {
    if (employeeIds.length === 0) return;

    const selectedEmployees = filteredEmployees.filter(emp => 
      employeeIds.includes(emp.id.toString())
    );

    if (selectedEmployees.length === 0) {
      toaster.create({
        title: 'Export unavailable',
        description: 'No matching employees found for export.',
        type: 'warning',
      });
      return;
    }

    const exportRows = selectedEmployees.map((employee) => ({
      ID: employee.id,
      Name: `${employee.first_name} ${employee.last_name}`.trim(),
      Email: employee.email,
      Phone: employee.phone || '',
      Department: employee.department || '',
      Status: employee.status,
      Role: employee.role_name || '',
      'Job Title': employee.job_title || '',
    }));

    exportData(exportRows, 'employees', 'csv');

    toaster.create({
      title: 'Export complete',
      description: `${selectedEmployees.length} employee(s) exported successfully.`,
      type: 'success',
    });
  };

  if (isLoading) {
    return (
      <VStack gap={5} align="stretch">
        <Text>Loading team members...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="red.600" fontWeight="semibold" mb={2}>
          Failed to load team members
        </Text>
        <Text color="gray.500">
          {error.message || 'Please try again later'}
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={5} align="stretch">
      {/* Action Button */}
      <HStack justify="flex-end">
        <StandardButton
          variant="primary"
          leftIcon={<FiUserPlus />}
          onClick={() => setIsInviteDialogOpen(true)}
        >
          Invite Employee
        </StandardButton>
      </HStack>

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
              onChange={(e) => setSearchQuery(e.target.value)}
              pl="40px"
              h="40px"
              borderRadius="lg"
            />
          </Box>

          {/* Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={(value: string) => setStatusFilter(value)}
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
        employees={filteredEmployees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onRoleUpdate={refetch}
      />
      
      {/* Invite Employee Dialog */}
      <InviteEmployeeDialog 
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onSuccess={() => {
          setIsInviteDialogOpen(false);
          refetch();
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={
          employeeToDelete
            ? `Are you sure you want to delete ${employeeToDelete.first_name} ${employeeToDelete.last_name}? This action cannot be undone.`
            : 'Are you sure you want to delete this employee?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={false}
      />
      
      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Employees"
        message={`Are you sure you want to delete ${employeesToBulkDelete.length} employee(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={false}
      />
    </VStack>
  );
};


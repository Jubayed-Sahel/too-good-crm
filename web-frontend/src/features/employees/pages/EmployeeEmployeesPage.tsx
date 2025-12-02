/**
 * EmployeesPage - Container Component
 * 
 * This component follows the Container/Presenter pattern:
 * - Fetches data using custom hooks
 * - Manages state
 * - Delegates presentation to EmployeesPageContent component
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { EmployeesPageContent, EmployeesPageLoading } from '@/features/employees/components';
import { InviteEmployeeDialog } from '@/features/employees/components/InviteEmployeeDialog';
import { ConfirmDialog } from '@/components/common';
import { toaster } from '@/components/ui/toaster';
import { useEmployees } from '../hooks/useEmployees';
import { employeeService } from '@/services';
import type { Employee } from '@/services';
import { exportData } from '@/utils';

const EmployeeEmployeesPage = () => {
  const navigate = useNavigate();
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
      // Delete employees in parallel
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
        description: 'No matching employees found for export. Please refresh and try again.',
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

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Team">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load employees
          </Heading>
          <Text color="gray.500">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Team">
        <EmployeesPageLoading />
      </DashboardLayout>
    );
  }

  // Main content
  return (
    <DashboardLayout title="Team">
      <EmployeesPageContent
        employees={filteredEmployees}
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onInviteEmployee={() => setIsInviteDialogOpen(true)}
        isInviteDialogOpen={isInviteDialogOpen}
        onCloseInviteDialog={() => setIsInviteDialogOpen(false)}
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
    </DashboardLayout>
  );
};

export default EmployeeEmployeesPage;


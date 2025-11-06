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
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { EmployeesPageContent, EmployeesPageLoading } from '../components/employees';
import { InviteEmployeeDialog } from '../components/employees/InviteEmployeeDialog';
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee } from '@/services';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Data fetching
  const { employees, isLoading, error, refetch } = useEmployees();

  // Filter employees based on search and status
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = 
        !searchQuery ||
        emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase());
      
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
    if (confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`)) {
      console.log('Delete employee:', employee);
      // TODO: Implement delete functionality
    }
  };

  const handleView = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleBulkDelete = (employeeIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${employeeIds.length} employee(s)?`)) {
      console.log('Bulk delete employees:', employeeIds);
      // TODO: Implement bulk delete functionality
    }
  };

  const handleBulkExport = (employeeIds: string[]) => {
    console.log('Bulk export employees:', employeeIds);
    // TODO: Implement bulk export functionality
    alert(`Exporting ${employeeIds.length} employee(s)`);
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
    </DashboardLayout>
  );
};

export default EmployeesPage;


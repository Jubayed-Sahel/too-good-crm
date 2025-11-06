import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  CustomersPageContent,
  CustomersPageLoading,
} from '../components/customers';
import { useCustomers, useCustomersPage, useCustomerActions } from '@/hooks';

/**
 * CustomersPage - Container Component
 * 
 * This component follows the Container/Presenter pattern:
 * - Fetches data using custom hooks
 * - Manages state using useCustomersPage hook
 * - Handles actions using useCustomerActions hook
 * - Delegates presentation to CustomersPageContent component
 * 
 * Responsibilities:
 * - Compose hooks together
 * - Handle error states
 * - Pass props to presentation component
 * 
 * No business logic or UI implementation details here.
 */
const CustomersPage = () => {
  // Data fetching
  const { customers, isLoading, error, refetch } = useCustomers();

  // State management & filtering
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    mappedCustomers,
    stats,
  } = useCustomersPage(customers);

  // Action handlers
  const {
    handleEdit,
    handleDelete,
    handleView,
    handleCreateCustomer,
  } = useCustomerActions({ onSuccess: refetch });

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Customers">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load customers
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
      <DashboardLayout title="Customers">
        <CustomersPageLoading />
      </DashboardLayout>
    );
  }

  // Main content
  return (
    <DashboardLayout title="Customers">
      <CustomersPageContent
        mappedCustomers={mappedCustomers}
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAddCustomer={() => setIsCreateDialogOpen(true)}
        onCreateCustomer={handleCreateCustomer}
        isCreateDialogOpen={isCreateDialogOpen}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
      />
    </DashboardLayout>
  );
};

export default CustomersPage;

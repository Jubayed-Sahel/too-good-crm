import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  CustomersPageContent,
  CustomersPageLoading,
} from '../components/customers';
import { ConfirmDialog } from '../components/common';
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
    handleBulkDelete,
    deleteDialogState,
    bulkDeleteDialogState,
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
        onBulkDelete={handleBulkDelete}
        onAddCustomer={() => setIsCreateDialogOpen(true)}
        onCreateCustomer={handleCreateCustomer}
        isCreateDialogOpen={isCreateDialogOpen}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogState.isOpen}
        onClose={deleteDialogState.onClose}
        onConfirm={deleteDialogState.onConfirm}
        title="Delete Customer"
        message={
          deleteDialogState.customer
            ? `Are you sure you want to delete ${deleteDialogState.customer.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this customer?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={false}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialogState.isOpen}
        onClose={bulkDeleteDialogState.onClose}
        onConfirm={bulkDeleteDialogState.onConfirm}
        title="Delete Multiple Customers"
        message={`Are you sure you want to delete ${bulkDeleteDialogState.customerCount} customer(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={false}
      />
    </DashboardLayout>
  );
};

export default CustomersPage;

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  CustomersPageContent,
  CustomersPageLoading,
} from '@/components/customers';
import { ConfirmDialog } from '@/components/common';
import { ErrorState } from '@/components/common';
import { useCustomers, useCustomersPage, useCustomerActions } from '../hooks/index';
import { initiateCall } from '@/components/jitsi/JitsiCallManager';
import { toaster } from '@/components/ui/toaster';
import { useState } from 'react';

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
  // Call state
  const [isCallInitiating, setIsCallInitiating] = useState(false);

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
    handleBulkExport,
    deleteDialogState,
    bulkDeleteDialogState,
  } = useCustomerActions({ onSuccess: refetch });

  // Call handler - Jitsi integration
  const handleCall = async (customer: any) => {
    if (!customer.user_id) {
      toaster.create({
        title: 'Cannot Call',
        description: `${customer.name} is not a registered user. Only users with accounts can receive audio calls.`,
        type: 'error',
      });
      return;
    }

    setIsCallInitiating(true);
    
    try {
      await initiateCall(customer.user_id, customer.full_name || customer.name, 'audio');
      
      // Optionally refresh customer data
      refetch();
      
    } catch (error: any) {
      console.error('Error initiating call:', error);
      
      // Error toast is already shown by initiateCall helper
      // Just log for debugging
      
    } finally {
      setIsCallInitiating(false);
    }
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Customers">
        <ErrorState
          title="Failed to load customers"
          error={error}
          onRetry={refetch}
        />
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
        onCall={handleCall}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
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

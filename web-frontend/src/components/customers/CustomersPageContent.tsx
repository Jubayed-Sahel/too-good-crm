import React from 'react';
import { VStack, Button, HStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import {
  CustomerTable,
  CustomerFilters,
  CustomerStats,
  CreateCustomerDialog,
} from '@/components/customers';
import { PageHeader, StandardButton } from '@/components/common';
import { usePermissions } from '@/contexts/PermissionContext';
import type { MappedCustomer, CustomerStats as Stats } from '@/hooks/useCustomersPage';

/**
 * Props for CustomersPageContent component
 */
export interface CustomersPageContentProps {
  // Data
  mappedCustomers: MappedCustomer[];
  stats: Stats;
  
  // Filter state
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  
  // Action handlers
  onEdit: (customer: MappedCustomer) => void;
  onDelete: (customer: MappedCustomer) => void;
  onView: (customer: MappedCustomer) => void;
  onCall?: (customer: MappedCustomer) => void;
  onBulkDelete?: (customerIds: string[]) => void;
  onBulkExport?: (customerIds: string[], allCustomers: MappedCustomer[]) => void;
  onAddCustomer: () => void;
  onCreateCustomer: (data: any) => void;
  
  // Dialog state
  isCreateDialogOpen: boolean;
  onCloseCreateDialog: () => void;
  
  // Loading state
  isSubmitting?: boolean;
}

/**
 * Pure presentation component for Customers page
 * 
 * This component is responsible ONLY for rendering the UI.
 * All business logic, state management, and data fetching
 * are handled by the parent container component and custom hooks.
 * 
 * Benefits:
 * - Easy to test (just props in, JSX out)
 * - No side effects
 * - Reusable in different contexts
 * - Can be used in Storybook
 */
export const CustomersPageContent: React.FC<CustomersPageContentProps> = ({
  mappedCustomers,
  stats,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onEdit,
  onDelete,
  onView,
  onCall,
  onBulkDelete,
  onBulkExport,
  onAddCustomer,
  onCreateCustomer,
  isCreateDialogOpen,
  onCloseCreateDialog,
}) => {
  const { canAccess } = usePermissions();
  const canCreate = canAccess('customer', 'create');
  
  return (
    <VStack gap={5} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Customers"
        description="Manage your customer relationships, track interactions, and monitor customer activity"
        actions={
          canCreate ? (
            <StandardButton
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={onAddCustomer}
            >
              Add Customer
            </StandardButton>
          ) : undefined
        }
        />

      {/* Stats Cards */}
      <CustomerStats {...stats} />

      {/* Filters */}
      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        onAddCustomer={canCreate ? onAddCustomer : undefined}
      />

      {/* Customer Table */}
      <CustomerTable
        customers={mappedCustomers}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onCall={onCall}
        onBulkDelete={onBulkDelete}
        onBulkExport={onBulkExport ? (ids) => onBulkExport(ids, mappedCustomers) : undefined}
      />

      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        isOpen={isCreateDialogOpen}
        onClose={onCloseCreateDialog}
        onSubmit={onCreateCustomer}
      />
    </VStack>
  );
};

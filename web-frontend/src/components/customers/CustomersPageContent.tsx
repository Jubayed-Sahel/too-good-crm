import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import {
  CustomerTable,
  CustomerFilters,
  CustomerStats,
  CreateCustomerDialog,
} from '@/components/customers';
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
  onBulkDelete?: (customerIds: string[]) => void;
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
  onBulkDelete,
  onAddCustomer,
  onCreateCustomer,
  isCreateDialogOpen,
  onCloseCreateDialog,
}) => {
  return (
    <VStack gap={5} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="xl" mb={2}>
          Customers
        </Heading>
        <Text color="gray.600" fontSize="sm">
          Manage your customer relationships and track interactions
        </Text>
      </Box>

      {/* Stats Cards */}
      <CustomerStats {...stats} />

      {/* Filters */}
      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        onAddCustomer={onAddCustomer}
      />

      {/* Customer Table */}
      <CustomerTable
        customers={mappedCustomers}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onBulkDelete={onBulkDelete}
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MappedCustomer } from './useCustomersPage';
import { customerService } from '../services/customer.service';
import { toaster } from '@/components/ui/toaster';
import { useProfile } from '@/contexts/ProfileContext';
import { exportData } from '@/utils';

/**
 * Props for useCustomerActions hook
 */
export interface UseCustomerActionsProps {
  onSuccess?: () => void;
}

/**
 * Return type for useCustomerActions hook
 */
export interface UseCustomerActionsReturn {
  // Action handlers
  handleEdit: (customer: MappedCustomer) => void;
  handleDelete: (customer: MappedCustomer) => void;
  handleView: (customer: MappedCustomer) => void;
  handleCreateCustomer: (data: any) => Promise<void>;
  handleBulkDelete: (customerIds: string[]) => void;
  handleBulkExport: (customerIds: string[], allCustomers: MappedCustomer[]) => void;
  
  // Delete confirmation state
  deleteDialogState: {
    isOpen: boolean;
    customer: MappedCustomer | null;
    onConfirm: () => Promise<void>;
    onClose: () => void;
  };
  
  // Bulk delete confirmation state
  bulkDeleteDialogState: {
    isOpen: boolean;
    customerCount: number;
    onConfirm: () => Promise<void>;
    onClose: () => void;
  };
  
  // Loading state
  isSubmitting: boolean;
}

/**
 * Custom hook for customer CRUD operations and action handlers
 * 
 * Responsibilities:
 * - Handles customer edit navigation
 * - Handles customer deletion with confirmation
 * - Handles customer detail view navigation
 * - Handles customer creation
 * - Manages loading/submitting state
 * - Provides user feedback for operations
 * - Uses React Query for optimistic updates and cache management
 * 
 * @param props - Configuration object with onSuccess callback
 * @returns Customer action handlers and state
 */
export const useCustomerActions = ({ onSuccess }: UseCustomerActionsProps = {}): UseCustomerActionsReturn => {
  const navigate = useNavigate();
  const { activeOrganizationId } = useProfile();
  const queryClient = useQueryClient();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<MappedCustomer | null>(null);
  
  // Bulk delete state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [customersToBulkDelete, setCustomersToBulkDelete] = useState<string[]>([]);

  // React Query mutation for creating customer
  const createMutation = useMutation({
    mutationFn: (data: any) => customerService.createCustomer(data),
    onSuccess: (_data, variables) => {
      // Show success message
      toaster.create({
        title: 'Customer created successfully',
        description: `Customer "${variables.name}" has been created.`,
        type: 'success',
      });
      
      // Invalidate and refetch customer queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error creating customer:', error);
      
      // Handle validation errors from backend
      const errorMessage = error.response?.data?.email?.[0] 
        || error.response?.data?.phone?.[0]
        || error.response?.data?.company_name?.[0]
        || error.response?.data?.non_field_errors?.[0]
        || 'Failed to create customer. Please try again.';
      
      toaster.create({
        title: 'Failed to create customer',
        description: errorMessage,
        type: 'error',
      });
    },
  });

  // React Query mutation for deleting customer
  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: () => {
      toaster.create({
        title: 'Customer deleted successfully',
        description: `Customer has been deleted.`,
        type: 'success',
      });
      
      // Invalidate and refetch customer queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error deleting customer:', error);
      toaster.create({
        title: 'Failed to delete customer',
        description: 'Please try again.',
        type: 'error',
      });
    },
  });

  /**
   * Navigate to edit customer page
   */
  const handleEdit = (customer: MappedCustomer) => {
    console.log('Edit customer:', customer);
    navigate(`/customers/${customer.id}/edit`);
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDelete = (customer: MappedCustomer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete operation
   */
  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteMutation.mutateAsync(parseInt(customerToDelete.id));
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  /**
   * Close delete confirmation dialog
   */
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };
  
  /**
   * Open bulk delete confirmation dialog
   */
  const handleBulkDelete = (customerIds: string[]) => {
    if (customerIds.length === 0) return;
    setCustomersToBulkDelete(customerIds);
    setBulkDeleteDialogOpen(true);
  };
  
  /**
   * Confirm and execute bulk delete operation
   */
  const confirmBulkDelete = async () => {
    if (customersToBulkDelete.length === 0) return;

    try {
      // Delete all customers in parallel
      await Promise.all(
        customersToBulkDelete.map(id => deleteMutation.mutateAsync(parseInt(id)))
      );
      
      toaster.create({
        title: 'Customers deleted',
        description: `${customersToBulkDelete.length} customer(s) deleted successfully.`,
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error deleting customers',
        description: 'Some customers could not be deleted.',
        type: 'error',
      });
    } finally {
      setBulkDeleteDialogOpen(false);
      setCustomersToBulkDelete([]);
    }
  };
  
  /**
   * Close bulk delete confirmation dialog
   */
  const closeBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(false);
    setCustomersToBulkDelete([]);
  };

  /**
   * Export customers to CSV
   */
  const handleBulkExport = (customerIds: string[], allCustomers: MappedCustomer[]) => {
    if (customerIds.length === 0) return;
    
    // Filter selected customers
    const selectedCustomers = allCustomers.filter(c => customerIds.includes(c.id));
    
    // Format data for export
    const exportableData = selectedCustomers.map(customer => ({
      ID: customer.id,
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone || '',
      Company: customer.company || '',
      Status: customer.status,
      'Total Value': customer.totalValue,
      'Last Contact': customer.lastContact,
    }));
    
    // Export to CSV
    exportData(exportableData, 'customers', 'csv');
    
    toaster.create({
      title: 'Export successful',
      description: `${selectedCustomers.length} customer(s) exported.`,
      type: 'success',
    });
  };

  /**
   * Navigate to customer detail page
   */
  const handleView = (customer: MappedCustomer) => {
    console.log('View customer:', customer);
    navigate(`/customers/${customer.id}`);
  };

  /**
   * Create new customer
   */
  const handleCreateCustomer = async (data: any) => {
    console.log('Create customer (frontend data):', data);
    
    // Get organization ID from active profile
    const organizationId = activeOrganizationId;
    
    if (!organizationId) {
      toaster.create({
        title: 'Unable to create customer',
        description: 'Organization information not found. Please select a profile.',
        type: 'error',
      });
      return;
    }
    
    // Transform frontend data to backend format
    const backendData = {
      name: data.fullName,              // fullName → name
      email: data.email,
      phone: data.phone || '',
      company_name: data.company,       // company → company_name
      status: data.status || 'active',
      customer_type: 'individual',      // Default to individual
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      postal_code: data.zipCode || '',  // zipCode → postal_code
      country: data.country || '',
      notes: data.notes || '',
      organization: organizationId,     // From active profile context
    };
    
    console.log('Create customer (backend data):', backendData);
    
    // Use React Query mutation
    await createMutation.mutateAsync(backendData);
  };

  return {
    handleEdit,
    handleDelete,
    handleView,
    handleCreateCustomer,
    handleBulkDelete,
    handleBulkExport,
    deleteDialogState: {
      isOpen: deleteDialogOpen,
      customer: customerToDelete,
      onConfirm: confirmDelete,
      onClose: closeDeleteDialog,
    },
    bulkDeleteDialogState: {
      isOpen: bulkDeleteDialogOpen,
      customerCount: customersToBulkDelete.length,
      onConfirm: confirmBulkDelete,
      onClose: closeBulkDeleteDialog,
    },
    isSubmitting: createMutation.isPending || deleteMutation.isPending,
  };
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MappedCustomer } from './useCustomersPage';

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
  handleCreateCustomer: (data: any) => void;
  
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
 * 
 * @param props - Configuration object with onSuccess callback
 * @returns Customer action handlers and state
 */
export const useCustomerActions = ({ onSuccess }: UseCustomerActionsProps = {}): UseCustomerActionsReturn => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Navigate to edit customer page
   */
  const handleEdit = (customer: MappedCustomer) => {
    console.log('Edit customer:', customer);
    navigate(`/customers/${customer.id}/edit`);
  };

  /**
   * Delete customer with confirmation
   */
  const handleDelete = async (customer: MappedCustomer) => {
    console.log('Delete customer:', customer);
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );
    
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      
      // TODO: Implement API call to delete customer
      // await customerService.deleteCustomer(parseInt(customer.id));
      
      // Show success message
      alert(`Customer ${customer.name} deleted successfully!`);
      
      // Call success callback to refresh data
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    console.log('Create customer:', data);
    
    try {
      setIsSubmitting(true);
      
      // TODO: Implement API call to create customer
      // await customerService.createCustomer(data);
      
      // Show success message
      alert(`Customer "${data.fullName}" created successfully!`);
      
      // Call success callback to refresh data
      onSuccess?.();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
      throw error; // Re-throw to let caller handle if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleEdit,
    handleDelete,
    handleView,
    handleCreateCustomer,
    isSubmitting,
  };
};

/**
 * Custom hook for Deal actions and mutations
 * Handles create, update, delete operations with proper error handling
 * Uses React Query for state management and organization from active profile
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealService } from '@/services/deal.service';
import { customerService } from '@/services/customer.service';
import { useProfile } from '@/contexts/ProfileContext';
import { toaster } from '@/components/ui/toaster';
import { exportData } from '@/utils';
import { transformDealFormData, findStageIdByName, cleanFormData } from '@/utils/formTransformers';
import type { MappedDeal } from './useDealsPage';

interface EditDealData {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
}

interface UseDealActionsProps {
  onSuccess?: () => void;
}

interface UseDealActionsReturn {
  selectedDeal: EditDealData | null;
  isSubmitting: boolean;
  
  // Actions
  handleEditDeal: (deal: any) => void;
  handleUpdateDeal: (data: EditDealData) => Promise<void>;
  handleDeleteDeal: (deal: any) => void;
  handleBulkDelete: (dealIds: string[]) => void;
  handleBulkExport: (dealIds: string[], deals: MappedDeal[]) => void;
  handleViewDeal: (deal: any) => void;
  handleCreateDeal: (data: any) => Promise<void>;
  
  // Delete dialog state
  deleteDialogState: {
    isOpen: boolean;
    deal: any;
    onConfirm: () => Promise<void>;
    onClose: () => void;
  };
  
  // Bulk delete dialog state
  bulkDeleteDialogState: {
    isOpen: boolean;
    dealCount: number;
    onConfirm: () => Promise<void>;
    onClose: () => void;
  };
  
  // State setters
  setSelectedDeal: (deal: EditDealData | null) => void;
}

export const useDealActions = ({ onSuccess }: UseDealActionsProps = {}): UseDealActionsReturn => {
  const navigate = useNavigate();
  const { activeOrganizationId } = useProfile();
  const queryClient = useQueryClient();
  const [selectedDeal, setSelectedDeal] = useState<EditDealData | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<any>(null);
  
  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [dealsToBulkDelete, setDealsToBulkDelete] = useState<string[]>([]);

  // React Query mutation for creating deal
  const createMutation = useMutation({
    mutationFn: (data: any) => dealService.createDeal(data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal created',
        description: `Deal "${data.title}" created successfully!`,
        type: 'success',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      // Extract specific backend validation errors
      const errorMessage = 
        error.response?.data?.title?.[0] ||
        error.response?.data?.customer?.[0] ||
        error.response?.data?.value?.[0] ||
        error.response?.data?.probability?.[0] ||
        error.response?.data?.expected_close_date?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'An error occurred while creating the deal.';
      
      toaster.create({
        title: 'Error creating deal',
        description: errorMessage,
        type: 'error',
      });
    },
  });

  // React Query mutation for updating deal
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      dealService.updateDeal(id, data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Deal updated',
        description: `Deal "${data.title}" updated successfully!`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.title?.[0] ||
        error.response?.data?.value?.[0] ||
        error.response?.data?.probability?.[0] ||
        error.response?.data?.expected_close_date?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'An error occurred while updating the deal.';
      
      toaster.create({
        title: 'Error updating deal',
        description: errorMessage,
        type: 'error',
      });
    },
  });

  // React Query mutation for deleting deal
  const deleteMutation = useMutation({
    mutationFn: (id: number) => dealService.deleteDeal(id),
    onSuccess: () => {
      toaster.create({
        title: 'Deal deleted',
        description: 'Deal deleted successfully.',
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dealStats'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error deleting deal',
        description: error.response?.data?.detail || 'An error occurred while deleting the deal.',
        type: 'error',
      });
    },
  });

  const handleEditDeal = (deal: any) => {
    setSelectedDeal({
      id: deal.id.toString(),
      title: deal.title,
      customer: deal.customer,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      owner: deal.owner || 'Deal Owner',
    });
  };

  const handleUpdateDeal = async (data: EditDealData) => {
    const dealId = typeof data.id === 'string' ? parseInt(data.id) : data.id;
    
    await updateMutation.mutateAsync({
      id: dealId,
      data: {
        title: data.title,
        value: data.value,
        probability: data.probability,
        expected_close_date: data.expectedCloseDate,
      },
    });
  };

  const handleDeleteDeal = (deal: any) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!dealToDelete) return;
    
    const dealId = typeof dealToDelete.id === 'string' ? parseInt(dealToDelete.id) : dealToDelete.id;
    await deleteMutation.mutateAsync(dealId);
    
    setDeleteDialogOpen(false);
    setDealToDelete(null);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDealToDelete(null);
  };

  const handleViewDeal = (deal: any) => {
    navigate(`/deals/${deal.id}`);
  };
  
  const handleBulkDelete = (dealIds: string[]) => {
    if (dealIds.length === 0) return;
    setDealsToBulkDelete(dealIds);
    setBulkDeleteDialogOpen(true);
  };
  
  const handleBulkExport = (dealIds: string[], deals: MappedDeal[]) => {
    if (dealIds.length === 0) return;

    const selectedDeals = deals.filter(deal => dealIds.includes(deal.id));

    if (selectedDeals.length === 0) {
      toaster.create({
        title: 'No deals exported',
        description: 'Unable to match the selected deals. Please refresh and try again.',
        type: 'warning',
      });
      return;
    }

    const formatStage = (stage: MappedDeal['stage']) =>
      stage
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const exportRows = selectedDeals.map((deal) => ({
      ID: deal.id,
      Title: deal.title,
      Customer: deal.customer,
      Value: deal.value,
      Stage: formatStage(deal.stage),
      Probability: deal.probability,
      'Expected Close': deal.expectedCloseDate,
      Owner: deal.owner,
      'Created Date': deal.createdDate,
    }));

    exportData(exportRows, 'deals', 'csv');

    toaster.create({
      title: 'Export complete',
      description: `${selectedDeals.length} deal(s) exported successfully.`,
      type: 'success',
    });
  };
  
  const confirmBulkDelete = async () => {
    // Delete deals in parallel
    await Promise.all(
      dealsToBulkDelete.map(id => deleteMutation.mutateAsync(parseInt(id)))
    );
    
    toaster.create({
      title: 'Deals deleted',
      description: `${dealsToBulkDelete.length} deal(s) have been removed.`,
      type: 'success',
    });
    
    setBulkDeleteDialogOpen(false);
    setDealsToBulkDelete([]);
  };
  
  const closeBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(false);
    setDealsToBulkDelete([]);
  };

  const handleCreateDeal = async (data: any) => {
    // Get organization ID from active profile
    const organizationId = activeOrganizationId;
    
    if (!organizationId) {
      toaster.create({
        title: 'Unable to create deal',
        description: 'Organization information not found. Please select a profile.',
        type: 'error',
      });
      return;
    }
    
    try {
      // Resolve customer ID
      let customerId: number | null = null;
      
      // If customer is already a number, use it
      if (data.customer && typeof data.customer === 'number') {
        customerId = data.customer;
      } else if (data.customerName || data.customer) {
        // Try to find customer by name or ID
        const customerName = data.customerName || data.customer || '';
        
        try {
          // First try to find by ID if it's a numeric string
          const numericId = parseInt(String(customerName));
          if (!isNaN(numericId)) {
            try {
              const customer = await customerService.getCustomer(numericId);
              customerId = customer.id;
            } catch {
              // Not found by ID, continue to search by name
            }
          }
          
          // If not found by ID, search by name
          if (!customerId) {
            const resp = await customerService.getCustomers({ 
              search: customerName, 
              page_size: 10, 
              organization: organizationId 
            });
            const found = resp.results?.[0];
            if (found && found.id) {
              customerId = found.id;
            }
          }
        } catch (err) {
          console.warn('Customer lookup failed:', err);
          toaster.create({ 
            title: 'Customer lookup failed', 
            description: 'Could not find customer. Please ensure the customer exists or create it first.', 
            type: 'warning',
            duration: 5000,
          });
        }
      }

      // Resolve stage ID from stage name/string
      let stageId: number | null = null;
      const stageValue = data.stage;
      
      if (stageValue) {
        // If it's already a number, use it
        if (typeof stageValue === 'number') {
          stageId = stageValue;
        } else {
          // Try to fetch pipeline stages and find matching stage
          try {
            // Get default pipeline or first pipeline
            const pipelines = await dealService.getPipelines();
            const defaultPipeline = pipelines.find(p => p.is_default) || pipelines[0];
            
            if (defaultPipeline) {
              // Get stages for the pipeline
              const stages = await dealService.getPipelineStages(defaultPipeline.id);
              
              // Find stage by name using utility function
              stageId = findStageIdByName(String(stageValue), stages);
              
              if (!stageId) {
                console.warn(`Stage "${stageValue}" not found in pipeline stages`);
              }
            }
          } catch (err) {
            console.warn('Failed to fetch pipeline stages:', err);
            // Continue without stage - backend may handle default
          }
        }
      }

      // Transform form data to backend format
      const transformedData = transformDealFormData(
        { ...data, customer: customerId || data.customer },
        organizationId,
        stageId
      );
      
      console.log('🔍 Deal data before cleaning:', transformedData);
      const backendData = cleanFormData(transformedData);
      console.log('🔍 Deal data after cleaning:', backendData);

      await createMutation.mutateAsync(backendData);
    } catch (err: any) {
      console.error('Error preparing deal creation:', err);
      
      const errorMessage = 
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create deal. Please check your input and try again.';
      
      toaster.create({ 
        title: 'Failed to create deal', 
        description: errorMessage, 
        type: 'error',
        duration: 5000,
      });
    }
  };

  return {
    selectedDeal,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    
    // Actions
    handleEditDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleBulkDelete,
  handleBulkExport,
    handleViewDeal,
    handleCreateDeal,
    
    // Delete dialog state
    deleteDialogState: {
      isOpen: deleteDialogOpen,
      deal: dealToDelete,
      onConfirm: confirmDelete,
      onClose: closeDeleteDialog,
    },
    
    // Bulk delete dialog state
    bulkDeleteDialogState: {
      isOpen: bulkDeleteDialogOpen,
      dealCount: dealsToBulkDelete.length,
      onConfirm: confirmBulkDelete,
      onClose: closeBulkDeleteDialog,
    },
    
    // State setters
    setSelectedDeal,
  };
};

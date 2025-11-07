/**
 * Custom hook for Deal actions and mutations
 * Handles create, update, delete operations with proper error handling
 * Uses React Query for state management and organization from auth context
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealService } from '@/services/deal.service';
import { useAuth } from '@/hooks/useAuth';
import { toaster } from '@/components/ui/toaster';

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
  const { user } = useAuth();
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
    // Get organization ID from authenticated user
    const organizationId = user?.primaryOrganizationId;
    
    if (!organizationId) {
      toaster.create({
        title: 'Unable to create deal',
        description: 'Organization information not found. Please log in again.',
        type: 'error',
      });
      return;
    }
    
    // Prepare backend data
    const backendData = {
      title: data.title,
      value: data.value,
      customer: data.customer || 1, // TODO: Need to get actual customer ID from form
      stage: data.stage || 1, // TODO: Need to get actual stage ID from form
      probability: data.probability,
      expected_close_date: data.expectedCloseDate,
      description: data.description,
      organization: organizationId, // ✅ From auth context!
    };
    
    await createMutation.mutateAsync(backendData);
  };

  return {
    selectedDeal,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    
    // Actions
    handleEditDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleBulkDelete,
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

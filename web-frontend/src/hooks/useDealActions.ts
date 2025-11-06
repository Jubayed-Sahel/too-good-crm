/**
 * Custom hook for Deal actions and mutations
 * Handles create, update, delete operations with proper error handling
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dealService } from '@/services/deal.service';

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
  handleDeleteDeal: (deal: any) => Promise<void>;
  handleViewDeal: (deal: any) => void;
  handleCreateDeal: (data: any) => Promise<void>;
  
  // State setters
  setSelectedDeal: (deal: EditDealData | null) => void;
}

export const useDealActions = ({ onSuccess }: UseDealActionsProps = {}): UseDealActionsReturn => {
  const navigate = useNavigate();
  const [selectedDeal, setSelectedDeal] = useState<EditDealData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      setIsSubmitting(true);
      const dealId = typeof data.id === 'string' ? parseInt(data.id) : data.id;
      
      await dealService.updateDeal(dealId, {
        title: data.title,
        value: data.value,
        probability: data.probability,
        expected_close_date: data.expectedCloseDate,
      });
      
      // Success feedback
      alert(
        `Deal "${data.title}" updated successfully!\n\n` +
        `Updated fields:\n` +
        `- Customer: ${data.customer}\n` +
        `- Value: $${data.value.toLocaleString()}\n` +
        `- Stage: ${data.stage}\n` +
        `- Probability: ${data.probability}%`
      );
      
      // Refresh data
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('An error occurred while updating the deal.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (deal: any) => {
    if (!window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const dealId = typeof deal.id === 'string' ? parseInt(deal.id) : deal.id;
      
      await dealService.deleteDeal(dealId);
      
      alert(`Deleted deal: ${deal.title}`);
      
      // Refresh data
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('An error occurred while deleting the deal.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDeal = (deal: any) => {
    navigate(`/deals/${deal.id}`);
  };

  const handleCreateDeal = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Note: Backend expects customer ID and stage ID
      // TODO: Implement proper customer and stage lookup
      await dealService.createDeal({
        title: data.title,
        value: data.value,
        customer: 1, // TODO: Need to get actual customer ID
        stage: 1, // TODO: Need to get actual stage ID
        probability: data.probability,
        expected_close_date: data.expectedCloseDate,
        description: data.description,
      });
      
      alert(`Deal "${data.title}" created successfully!`);
      
      // Refresh data
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('An error occurred while creating the deal.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDeal,
    isSubmitting,
    
    // Actions
    handleEditDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleViewDeal,
    handleCreateDeal,
    
    // State setters
    setSelectedDeal,
  };
};

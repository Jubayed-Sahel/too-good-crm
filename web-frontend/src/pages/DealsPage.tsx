import { useState, useMemo } from 'react';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { 
  DealsTable, 
  DealsFilters, 
  DealsStats, 
  CreateDealDialog,
  EditDealDialog,
  type EditDealData 
} from '../components/deals';
import { useDeals } from '@/hooks';
import { updateDeal, createDeal, deleteDeal } from '@/services/deals.service';

const DealsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<EditDealData | null>(null);
  
  // Fetch deals data
  const { deals, isLoading, error } = useDeals();

  // Filter deals based on search and stage
  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    return deals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.customer_name && deal.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage =
        stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [deals, searchQuery, stageFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!deals) {
      return { total: 0, active: 0, won: 0, totalValue: 0 };
    }

    const total = deals.length;
    const active = deals.filter(
      (d) => !['closed-won', 'closed-lost'].includes(d.stage || '')
    ).length;
    const won = deals.filter((d) => d.stage === 'closed-won').length;
    const totalValue = deals.reduce((sum, d) => {
      const value = typeof d.value === 'string' ? parseFloat(d.value) : (d.value || 0);
      if (d.stage === 'closed-won') return sum + value;
      return sum + (value * (d.probability || 0)) / 100;
    }, 0);

    return { total, active, won, totalValue };
  }, [deals]);

  // Map API deals to component format
  const mappedDeals = useMemo(() => {
    if (!deals) return [];
    return filteredDeals.map((deal) => ({
      id: deal.id.toString(),
      title: deal.title,
      customer: deal.customer_name || `Customer #${deal.customer}`,
      value: typeof deal.value === 'string' ? parseFloat(deal.value) : (deal.value || 0),
      stage: (deal.stage || 'lead') as 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
      probability: deal.probability || 0,
      expectedCloseDate: deal.expected_close_date || deal.created_at,
      owner: `Deal Owner`,
      createdDate: deal.created_at,
    }));
  }, [deals, filteredDeals]);

  // Action handlers
  const handleEditDeal = (deal: any) => {
    // Convert deal to EditDealData format
    const editData: EditDealData = {
      id: deal.id,
      title: deal.title,
      customer: deal.customer,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      owner: deal.owner,
      description: '', // Add description if available
    };
    setSelectedDeal(editData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDeal = async (data: EditDealData) => {
    try {
      const result = await updateDeal(data);
      if (result) {
        alert(`Deal "${data.title}" updated successfully!\n\nUpdated fields:\n- Customer: ${data.customer}\n- Value: $${data.value.toLocaleString()}\n- Stage: ${data.stage}\n- Probability: ${data.probability}%`);
        // Refresh deals data (in a real app, you'd call a refetch method)
        window.location.reload();
      } else {
        alert('Failed to update deal. Please try again.');
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('An error occurred while updating the deal.');
    }
  };

  const handleDeleteDeal = async (deal: any) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        const success = await deleteDeal(deal.id);
        if (success) {
          alert(`Deleted deal: ${deal.title}`);
          // Refresh deals data (in a real app, you'd call a refetch method)
          window.location.reload();
        } else {
          alert('Failed to delete deal. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting deal:', error);
        alert('An error occurred while deleting the deal.');
      }
    }
  };

  const handleViewDeal = (deal: any) => {
    alert(`View deal: ${deal.title}`);
    // TODO: Implement view/details modal or navigation
  };

  const handleAddDeal = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateDeal = async (data: any) => {
    try {
      const result = await createDeal(data);
      if (result) {
        alert(`Deal "${data.title}" created successfully!`);
        // Refresh deals data (in a real app, you'd call a refetch method)
        window.location.reload();
      } else {
        alert('Failed to create deal. Please try again.');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('An error occurred while creating the deal.');
    }
  };

  if (error) {
    return (
      <DashboardLayout title="Deals">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load deals
          </Heading>
          <Text color="gray.500">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Deals">
      <VStack gap={5} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="2xl" mb={2}>
            Deals
          </Heading>
          <Text color="gray.600" fontSize="md">
            Track your sales pipeline and manage deal progress
          </Text>
        </Box>

        {/* Statistics Cards */}
        <DealsStats
          totalDeals={stats.total}
          activeDeals={stats.active}
          wonDeals={stats.won}
          totalValue={stats.totalValue}
        />

        {/* Filters */}
        <DealsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          onAddDeal={handleAddDeal}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : (
          <>
            {/* Deals Table */}
            {mappedDeals.length > 0 ? (
              <DealsTable
                deals={mappedDeals}
                onEdit={handleEditDeal}
                onDelete={handleDeleteDeal}
                onView={handleViewDeal}
              />
            ) : (
              <Box
                py={12}
                px={6}
                textAlign="center"
                bg="gray.50"
                borderRadius="lg"
              >
                <Heading size="md" color="gray.600" mb={2}>
                  No deals found
                </Heading>
                <Text color="gray.500">
                  {searchQuery || stageFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first deal'}
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>

      {/* Create Deal Dialog */}
      <CreateDealDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateDeal}
      />

      {/* Edit Deal Dialog */}
      <EditDealDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateDeal}
        deal={selectedDeal}
      />
    </DashboardLayout>
  );
};

export default DealsPage;

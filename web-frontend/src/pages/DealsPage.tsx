import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { getDeals, createDeal as createDealMock, updateDeal as updateDealMock, deleteDeal as deleteDealMock } from '@/services/deals.service';
import type { Deal as MockDeal } from '@/services/deals.service';

const DealsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<EditDealData | null>(null);
  const [deals, setDeals] = useState<MockDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch deals from mock service
  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const data = await getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Check if we should open the new deal dialog (from dashboard redirect)
  useEffect(() => {
    if (location.state?.openNewDeal) {
      setIsCreateDialogOpen(true);
      // Clear the state so dialog doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Filter deals based on search and stage
  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    return deals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.customer.toLowerCase().includes(searchQuery.toLowerCase());

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
      const value = d.value || 0;
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
      customer: deal.customer,
      value: deal.value || 0,
      stage: deal.stage as 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost',
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate || deal.created_at,
      owner: deal.owner,
      createdDate: deal.created_at,
    }));
  }, [deals, filteredDeals]);

  // Action handlers
  const handleEditDeal = (deal: any) => {
    // Map the deal data to EditDealData format
    setSelectedDeal({
      id: deal.id,
      title: deal.title,
      customer: deal.customer,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      owner: deal.owner || 'Deal Owner',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDeal = async (data: EditDealData) => {
    try {
      const result = await updateDealMock({
        id: data.id,
        title: data.title,
        customer: data.customer,
        value: data.value,
        stage: data.stage,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate,
        owner: data.owner,
      });
      if (result) {
        alert(`Deal "${data.title}" updated successfully!\n\nUpdated fields:\n- Customer: ${data.customer}\n- Value: $${data.value.toLocaleString()}\n- Stage: ${data.stage}\n- Probability: ${data.probability}%`);
        await fetchDeals();
        setIsEditDialogOpen(false);
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
        await deleteDealMock(deal.id);
        alert(`Deleted deal: ${deal.title}`);
        await fetchDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
        alert('An error occurred while deleting the deal.');
      }
    }
  };

  const handleViewDeal = (deal: any) => {
    navigate(`/deals/${deal.id}`);
  };

  const handleAddDeal = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateDeal = async (data: any) => {
    try {
      const result = await createDealMock({
        title: data.title,
        customerName: data.customer,
        value: data.value,
        stage: data.stage,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate,
        owner: data.owner || 'Deal Owner',
        description: data.description,
      });
      if (result) {
        alert(`Deal "${data.title}" created successfully!`);
        await fetchDeals();
        setIsCreateDialogOpen(false);
      } else {
        alert('Failed to create deal. Please try again.');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('An error occurred while creating the deal.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Deals">
        <Box display="flex" justifyContent="center" py={12}>
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text color="gray.500">Loading deals...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Deals">
      <VStack gap={5} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Deals
          </Heading>
          <Text color="gray.600" fontSize="sm">
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

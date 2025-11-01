import { useState, useMemo } from 'react';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { DealsTable, DealsFilters, DealsStats } from '../components/deals';
import { useDeals } from '@/hooks';

const DealsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  
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
    alert(`Edit deal: ${deal.title}`);
    // TODO: Implement edit modal
  };

  const handleDeleteDeal = (deal: any) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      alert(`Deleted deal: ${deal.title}`);
      // TODO: Implement actual delete logic
    }
  };

  const handleViewDeal = (deal: any) => {
    alert(`View deal: ${deal.title}`);
    // TODO: Implement view/details modal or navigation
  };

  const handleAddDeal = () => {
    alert('Add new deal');
    // TODO: Implement add deal modal
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
      <VStack gap={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Deals
          </Heading>
          <Text color="gray.600">
            Manage your sales pipeline and track deal progress
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
    </DashboardLayout>
  );
};

export default DealsPage;

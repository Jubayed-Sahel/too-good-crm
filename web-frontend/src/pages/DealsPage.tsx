import { useState, useMemo } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { DealsTable, DealsFilters, DealsStats } from '../components/deals';
import type { Deal } from '../components/deals';

// Mock data - replace with actual API calls later
const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise CRM Solution',
    customer: 'TechCorp Inc.',
    value: 150000,
    stage: 'negotiation',
    probability: 75,
    expectedCloseDate: '2024-03-15',
    owner: 'John Smith',
    createdDate: '2024-01-10',
  },
  {
    id: '2',
    title: 'Marketing Automation Platform',
    customer: 'Digital Solutions Ltd',
    value: 85000,
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: '2024-03-25',
    owner: 'Sarah Johnson',
    createdDate: '2024-01-15',
  },
  {
    id: '3',
    title: 'Cloud Infrastructure Upgrade',
    customer: 'Global Systems Corp',
    value: 250000,
    stage: 'qualified',
    probability: 45,
    expectedCloseDate: '2024-04-10',
    owner: 'Michael Chen',
    createdDate: '2024-01-20',
  },
  {
    id: '4',
    title: 'Mobile App Development',
    customer: 'Startup Ventures',
    value: 45000,
    stage: 'lead',
    probability: 25,
    expectedCloseDate: '2024-04-30',
    owner: 'Emily Davis',
    createdDate: '2024-02-01',
  },
  {
    id: '5',
    title: 'Data Analytics Platform',
    customer: 'Analytics Pro Inc',
    value: 120000,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-02-15',
    owner: 'John Smith',
    createdDate: '2023-12-05',
  },
  {
    id: '6',
    title: 'E-commerce Integration',
    customer: 'Retail Solutions',
    value: 65000,
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: '2024-03-08',
    owner: 'Sarah Johnson',
    createdDate: '2024-01-18',
  },
  {
    id: '7',
    title: 'Security Audit Service',
    customer: 'FinSecure Corp',
    value: 95000,
    stage: 'proposal',
    probability: 55,
    expectedCloseDate: '2024-03-20',
    owner: 'Michael Chen',
    createdDate: '2024-01-25',
  },
  {
    id: '8',
    title: 'Customer Portal Development',
    customer: 'ServiceHub LLC',
    value: 75000,
    stage: 'closed-lost',
    probability: 0,
    expectedCloseDate: '2024-02-01',
    owner: 'Emily Davis',
    createdDate: '2023-12-15',
  },
  {
    id: '9',
    title: 'AI Chatbot Integration',
    customer: 'Support Systems Inc',
    value: 55000,
    stage: 'qualified',
    probability: 50,
    expectedCloseDate: '2024-04-15',
    owner: 'John Smith',
    createdDate: '2024-02-05',
  },
  {
    id: '10',
    title: 'Database Migration Project',
    customer: 'Legacy Tech Corp',
    value: 180000,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-01-31',
    owner: 'Sarah Johnson',
    createdDate: '2023-11-20',
  },
];

const DealsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Filter deals based on search and stage
  const filteredDeals = useMemo(() => {
    return mockDeals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.owner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage =
        stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [searchQuery, stageFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = mockDeals.length;
    const active = mockDeals.filter(
      (d) => !['closed-won', 'closed-lost'].includes(d.stage)
    ).length;
    const won = mockDeals.filter((d) => d.stage === 'closed-won').length;
    const totalValue = mockDeals.reduce((sum, d) => {
      if (d.stage === 'closed-won') return sum + d.value;
      return sum + (d.value * d.probability) / 100;
    }, 0);

    return { total, active, won, totalValue };
  }, []);

  // Action handlers
  const handleEditDeal = (deal: Deal) => {
    alert(`Edit deal: ${deal.title}`);
    // TODO: Implement edit modal
  };

  const handleDeleteDeal = (deal: Deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      alert(`Deleted deal: ${deal.title}`);
      // TODO: Implement actual delete logic
    }
  };

  const handleViewDeal = (deal: Deal) => {
    alert(`View deal: ${deal.title}`);
    // TODO: Implement view/details modal or navigation
  };

  const handleAddDeal = () => {
    alert('Add new deal');
    // TODO: Implement add deal modal
  };

  return (
    <DashboardLayout title="Deals">
      <VStack align="stretch" gap={6}>
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

        {/* Deals Table */}
        {filteredDeals.length > 0 ? (
          <DealsTable
            deals={filteredDeals}
            onEdit={handleEditDeal}
            onDelete={handleDeleteDeal}
            onView={handleViewDeal}
          />
        ) : (
          <Box
            py={12}
            textAlign="center"
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text fontSize="lg" color="gray.500">
              No deals found matching your criteria
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Try adjusting your search or filters
            </Text>
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default DealsPage;

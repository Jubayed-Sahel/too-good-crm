import { useState, useMemo } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Grid, 
  Badge, 
  Button,
  Input,
  Stack,
} from '@chakra-ui/react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTarget, 
  FiAward, 
  FiUser, 
  FiCalendar,
  FiPlus,
  FiFilter,
  FiSearch,
} from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CustomSelect from '../components/ui/CustomSelect';
import { mockPipelineDeals, getPipelineStats } from '@/services/mockData';

// Interface for Deal type
interface Deal {
  id: number;
  title: string;
  customer: string;
  customerId: number;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  owner: string;
  description: string;
  created_at: string;
  lastActivity: string;
}

const SalesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [deals, setDeals] = useState<Deal[]>(mockPipelineDeals);
  
  // Get pipeline statistics
  const stats = useMemo(() => getPipelineStats(), []);

  // Get unique owners for filter
  const owners = useMemo(() => {
    const uniqueOwners = Array.from(new Set(deals.map(d => d.owner)));
    return uniqueOwners.sort();
  }, [deals]);

  // Pipeline stages configuration
  const pipelineStages = [
    { 
      key: 'lead', 
      label: 'Lead', 
      color: 'blue',
      icon: FiTarget,
    },
    { 
      key: 'qualified', 
      label: 'Qualified', 
      color: 'cyan',
      icon: FiUser,
    },
    { 
      key: 'proposal', 
      label: 'Proposal', 
      color: 'purple',
      icon: FiCalendar,
    },
    { 
      key: 'negotiation', 
      label: 'Negotiation', 
      color: 'orange',
      icon: FiTrendingUp,
    },
    { 
      key: 'closed-won', 
      label: 'Closed Won', 
      color: 'green',
      icon: FiAward,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter deals based on search and filters
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.customer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesOwner = ownerFilter === 'all' || deal.owner === ownerFilter;
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesOwner && matchesStage;
    });
  }, [deals, searchQuery, ownerFilter, stageFilter]);

  const getStageDeals = (stageKey: string) => {
    return filteredDeals.filter(deal => deal.stage === stageKey);
  };

  const getStageValue = (stageKey: string) => {
    const deals = getStageDeals(stageKey);
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  };

  // Move deal to different stage
  const moveDeal = (dealId: number, newStage: string) => {
    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId 
          ? { ...deal, stage: newStage }
          : deal
      )
    );
  };

  // Handle adding new deal
  const handleAddDeal = () => {
    alert('Add New Deal\n\nThis would open a form to add:\n- Deal name\n- Customer\n- Value\n- Stage\n- Assigned employee\n- Expected close date');
  };

  return (
    <DashboardLayout title="Sales Pipeline">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" mb={2}>
            Sales Pipeline
          </Heading>
          <Text color="gray.600" fontSize="md">
            Manage deals through every stage of your sales process
          </Text>
        </Box>

        {/* Stats Overview */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={5}
        >
          {/* Total Pipeline Value */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={{ base: 5, md: 6 }}
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ 
              boxShadow: 'md',
              transform: 'translateY(-2px)',
              borderColor: 'gray.300'
            }}
            transition="all 0.2s ease-in-out"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="100px"
              h="100px"
              bgGradient="linear(to-br, transparent, gray.50)"
              opacity={0.5}
              pointerEvents="none"
            />
            <HStack justify="space-between" align="start" mb={4} position="relative">
              <VStack align="start" gap={1} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Pipeline Value
                </Text>
                <Heading 
                  size={{ base: '3xl', md: '4xl' }} 
                  color="gray.900"
                  lineHeight="1.1"
                  fontWeight="bold"
                >
                  {formatCurrency(stats.pipelineValue)}
                </Heading>
              </VStack>
              <Box
                p={{ base: 3, md: 3.5 }}
                bg="blue.100"
                borderRadius="lg"
                boxShadow="sm"
              >
                <FiDollarSign size={24} color="var(--blue-600)" />
              </Box>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Weighted by probability
            </Text>
          </Box>

          {/* Open Deals */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={{ base: 5, md: 6 }}
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ 
              boxShadow: 'md',
              transform: 'translateY(-2px)',
              borderColor: 'gray.300'
            }}
            transition="all 0.2s ease-in-out"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="100px"
              h="100px"
              bgGradient="linear(to-br, transparent, gray.50)"
              opacity={0.5}
              pointerEvents="none"
            />
            <HStack justify="space-between" align="start" mb={4} position="relative">
              <VStack align="start" gap={1} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Open Deals
                </Text>
                <Heading 
                  size={{ base: '3xl', md: '4xl' }} 
                  color="gray.900"
                  lineHeight="1.1"
                  fontWeight="bold"
                >
                  {stats.openDeals}
                </Heading>
              </VStack>
              <Box
                p={{ base: 3, md: 3.5 }}
                bg="purple.100"
                borderRadius="lg"
                boxShadow="sm"
              >
                <FiTarget size={24} color="var(--purple-600)" />
              </Box>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Active in pipeline
            </Text>
          </Box>

          {/* Won Deals */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={{ base: 5, md: 6 }}
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ 
              boxShadow: 'md',
              transform: 'translateY(-2px)',
              borderColor: 'gray.300'
            }}
            transition="all 0.2s ease-in-out"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="100px"
              h="100px"
              bgGradient="linear(to-br, transparent, gray.50)"
              opacity={0.5}
              pointerEvents="none"
            />
            <HStack justify="space-between" align="start" mb={4} position="relative">
              <VStack align="start" gap={1} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Closed Won
                </Text>
                <Heading 
                  size={{ base: '3xl', md: '4xl' }} 
                  color="gray.900"
                  lineHeight="1.1"
                  fontWeight="bold"
                >
                  {stats.wonDeals}
                </Heading>
              </VStack>
              <Box
                p={{ base: 3, md: 3.5 }}
                bg="green.100"
                borderRadius="lg"
                boxShadow="sm"
              >
                <FiAward size={24} color="var(--green-600)" />
              </Box>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {formatCurrency(stats.wonValue)} revenue
            </Text>
          </Box>

          {/* Win Rate */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={{ base: 5, md: 6 }}
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ 
              boxShadow: 'md',
              transform: 'translateY(-2px)',
              borderColor: 'gray.300'
            }}
            transition="all 0.2s ease-in-out"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="100px"
              h="100px"
              bgGradient="linear(to-br, transparent, gray.50)"
              opacity={0.5}
              pointerEvents="none"
            />
            <HStack justify="space-between" align="start" mb={4} position="relative">
              <VStack align="start" gap={1} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Win Rate
                </Text>
                <Heading 
                  size={{ base: '3xl', md: '4xl' }} 
                  color="gray.900"
                  lineHeight="1.1"
                  fontWeight="bold"
                >
                  {stats.wonDeals > 0 
                    ? Math.round((stats.wonDeals / (stats.wonDeals + stats.lostDeals)) * 100)
                    : 0}%
                </Heading>
              </VStack>
              <Box
                p={{ base: 3, md: 3.5 }}
                bg="orange.100"
                borderRadius="lg"
                boxShadow="sm"
              >
                <FiTrendingUp size={24} color="var(--orange-600)" />
              </Box>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {stats.wonDeals} won / {stats.lostDeals} lost
            </Text>
          </Box>
        </Grid>

        {/* Filters and Actions Bar */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          justifyContent="space-between"
          alignItems={{ base: 'stretch', md: 'center' }}
        >
          {/* Search and Filter */}
          <Stack direction={{ base: 'column', sm: 'row' }} gap={3} flex="1">
            <Box position="relative" flex="1" maxW={{ base: '100%', md: '400px' }}>
              <Box
                position="absolute"
                left="12px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
                color="gray.400"
              >
                <FiSearch size={18} />
              </Box>
              <Input
                placeholder="Search deals or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl="40px"
                h="40px"
                borderRadius="lg"
              />
            </Box>

            <CustomSelect
              value={stageFilter}
              onChange={setStageFilter}
              options={[
                { value: 'all', label: 'All Stages' },
                ...pipelineStages.map(stage => ({
                  value: stage.key,
                  label: stage.label
                }))
              ]}
              width={{ base: '100%', sm: '180px' }}
              accentColor="purple"
            />

            <CustomSelect
              value={ownerFilter}
              onChange={setOwnerFilter}
              options={[
                { value: 'all', label: 'All Employees' },
                ...owners.map(owner => ({
                  value: owner,
                  label: owner
                }))
              ]}
              width={{ base: '100%', sm: '200px' }}
              accentColor="purple"
            />
          </Stack>

          {/* Action Buttons */}
          <HStack gap={2}>
            <Button
              variant="outline"
              h="40px"
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              <FiFilter />
              <Box ml={2}>More Filters</Box>
            </Button>

            <Button
              colorPalette="purple"
              h="40px"
              onClick={handleAddDeal}
            >
              <FiPlus />
              <Box ml={2}>New Deal</Box>
            </Button>
          </HStack>
        </Stack>

        {/* Pipeline Kanban Board */}
        <Box>
          <Box mb={4}>
            <Heading size="lg" color="gray.900" mb={1}>
              Pipeline Board
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'} 
              {searchQuery || ownerFilter !== 'all' || stageFilter !== 'all' ? ' (filtered)' : ''}
            </Text>
          </Box>
          
          {/* Clean Pipeline Grid */}
          <Box
            overflowX="auto"
            pb={2}
            css={{
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            <HStack
              align="start"
              gap={4}
              minW={{ base: 'max-content', xl: 'auto' }}
              pb={2}
            >
              {pipelineStages.map((stage) => {
                const stageDeals = getStageDeals(stage.key);
                const stageValue = getStageValue(stage.key);
                const StageIcon = stage.icon;

                return (
                  <VStack
                    key={stage.key}
                    align="stretch"
                    bg="white"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="gray.200"
                    w={{ base: '320px', md: '300px' }}
                    minH="600px"
                    maxH="calc(100vh - 450px)"
                    flexShrink={0}
                    boxShadow="sm"
                  >
                    {/* Clean Stage Header */}
                    <Box
                      p={4}
                      borderBottom="2px solid"
                      borderColor={`${stage.color}.200`}
                      bg={`${stage.color}.50`}
                      borderTopRadius="xl"
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack gap={2}>
                          <Box
                            as={StageIcon}
                            fontSize="md"
                            color={`${stage.color}.600`}
                          />
                          <Text fontWeight="bold" fontSize="sm" color="gray.900">
                            {stage.label}
                          </Text>
                        </HStack>
                        <Badge 
                          colorPalette={stage.color} 
                          size="sm"
                          variant="solid"
                          px={2}
                          py={0.5}
                        >
                          {stageDeals.length}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" fontWeight="semibold" color={`${stage.color}.700`}>
                        {formatCurrency(stageValue)}
                      </Text>
                    </Box>

                    {/* Scrollable Deals Container */}
                    <VStack
                      align="stretch"
                      gap={3}
                      p={3}
                      flex={1}
                      overflowY="auto"
                      css={{
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#CBD5E0',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#A0AEC0',
                        },
                      }}
                    >
                      {stageDeals.length === 0 ? (
                        <Box
                          textAlign="center"
                          py={12}
                          px={4}
                          borderWidth="2px"
                          borderStyle="dashed"
                          borderColor="gray.200"
                          borderRadius="lg"
                          bg="gray.50"
                        >
                          <Text fontSize="sm" color="gray.400" fontWeight="medium">
                            No deals
                          </Text>
                        </Box>
                      ) : (
                        stageDeals.map((deal) => (
                          <Box
                            key={deal.id}
                            bg="white"
                            p={4}
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor="gray.200"
                            boxShadow="sm"
                            _hover={{
                              boxShadow: 'md',
                              borderColor: `${stage.color}.400`,
                              transform: 'translateY(-2px)',
                            }}
                            transition="all 0.2s ease"
                            cursor="pointer"
                            position="relative"
                          >
                            <VStack align="stretch" gap={3}>
                              {/* Deal Title */}
                              <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color="gray.900"
                                lineHeight="1.4"
                                css={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {deal.title}
                              </Text>

                              {/* Customer */}
                              <HStack
                                gap={2}
                                p={2}
                                bg="gray.50"
                                borderRadius="md"
                              >
                                <Box
                                  p={1.5}
                                  bg="white"
                                  borderRadius="md"
                                  borderWidth="1px"
                                  borderColor="gray.200"
                                >
                                  <FiUser size={12} color="var(--gray-600)" />
                                </Box>
                                <Text fontSize="xs" color="gray.700" fontWeight="medium" flex={1}>
                                  {deal.customer}
                                </Text>
                              </HStack>

                              {/* Value & Probability Row */}
                              <HStack justify="space-between" gap={2}>
                                <VStack align="start" gap={0} flex={1}>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                    Value
                                  </Text>
                                  <Text fontSize="lg" fontWeight="bold" color={`${stage.color}.600`}>
                                    {formatCurrency(deal.value)}
                                  </Text>
                                </VStack>
                                {!['closed-won', 'closed-lost'].includes(stage.key) && (
                                  <VStack align="end" gap={0}>
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                      Probability
                                    </Text>
                                    <Badge 
                                      colorPalette={
                                        deal.probability >= 70 ? 'green' : 
                                        deal.probability >= 40 ? 'orange' : 'gray'
                                      }
                                      size="sm"
                                      variant="subtle"
                                      px={2}
                                      py={0.5}
                                    >
                                      {deal.probability}%
                                    </Badge>
                                  </VStack>
                                )}
                              </HStack>

                              {/* Footer Info */}
                              <VStack align="stretch" gap={1.5} pt={2} borderTop="1px" borderColor="gray.100">
                                <HStack gap={1.5} fontSize="xs" color="gray.500">
                                  <FiCalendar size={11} />
                                  <Text>
                                    {deal.actualCloseDate 
                                      ? `Closed ${formatDate(deal.actualCloseDate)}`
                                      : formatDate(deal.expectedCloseDate)
                                    }
                                  </Text>
                                </HStack>
                                <HStack gap={1.5} fontSize="xs" color="gray.500">
                                  <Box
                                    w={2}
                                    h={2}
                                    borderRadius="full"
                                    bg={`${stage.color}.500`}
                                  />
                                  <Text>{deal.owner}</Text>
                                </HStack>
                              </VStack>

                              {/* Move Deal Actions */}
                              <Box pt={2} borderTop="1px" borderColor="gray.100">
                                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
                                  Move to:
                                </Text>
                                <Grid templateColumns="repeat(2, 1fr)" gap={1.5}>
                                  {pipelineStages
                                    .filter(s => s.key !== stage.key)
                                    .slice(0, 4)
                                    .map(targetStage => (
                                      <Button
                                        key={targetStage.key}
                                        size="xs"
                                        variant="outline"
                                        colorPalette={targetStage.color}
                                        fontSize="xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveDeal(deal.id, targetStage.key);
                                        }}
                                        _hover={{
                                          bg: `${targetStage.color}.50`,
                                          borderColor: `${targetStage.color}.400`
                                        }}
                                      >
                                        {targetStage.label}
                                      </Button>
                                    ))
                                  }
                                </Grid>
                              </Box>
                            </VStack>
                          </Box>
                        ))
                      )}
                    </VStack>
                  </VStack>
                );
              })}
            </HStack>
          </Box>
        </Box>
      </VStack>
    </DashboardLayout>
  );
};

export default SalesPage;

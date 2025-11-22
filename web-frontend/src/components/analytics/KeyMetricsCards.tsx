import { Box, Text, VStack, HStack, SimpleGrid, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { FiUsers, FiBriefcase, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { formatCurrency } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services';

const KeyMetricsCards = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'dashboard-stats'],
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="elevated">
            <VStack justify="center" py={8}>
              <Spinner size="lg" />
            </VStack>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load metrics</Text>
        </VStack>
      </Card>
    );
  }

  const stats = data || {
    customers: { total: 0, active: 0, growth: 0 },
    leads: { total: 0, qualified: 0, conversion_rate: 0 },
    deals: { total: 0, active: 0, won: 0, win_rate: 0 },
    revenue: { total: 0, pipeline_value: 0, expected: 0 },
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue?.total || 0),
      change: stats.revenue?.pipeline_value 
        ? `${formatCurrency(stats.revenue.pipeline_value)} in pipeline`
        : 'No pipeline value',
      icon: FiDollarSign,
      iconBg: 'green.50',
      iconColor: 'green.600',
      changeColor: 'gray.500',
    },
    {
      title: 'Active Deals',
      value: stats.deals?.active || 0,
      change: stats.deals?.win_rate 
        ? `${stats.deals.win_rate.toFixed(1)}% win rate`
        : '0% win rate',
      icon: FiBriefcase,
      iconBg: 'blue.50',
      iconColor: 'blue.600',
      changeColor: 'blue.600',
    },
    {
      title: 'Total Customers',
      value: stats.customers?.total || 0,
      change: stats.customers?.growth 
        ? `${stats.customers.growth > 0 ? '+' : ''}${stats.customers.growth.toFixed(1)}% growth`
        : '0% growth',
      icon: FiUsers,
      iconBg: 'purple.50',
      iconColor: 'purple.600',
      changeColor: stats.customers?.growth && stats.customers.growth > 0 ? 'green.600' : 'gray.500',
    },
    {
      title: 'Qualified Leads',
      value: stats.leads?.qualified || 0,
      change: stats.leads?.conversion_rate 
        ? `${stats.leads.conversion_rate.toFixed(1)}% conversion rate`
        : '0% conversion rate',
      icon: FiTrendingUp,
      iconBg: 'orange.50',
      iconColor: 'orange.600',
      changeColor: 'orange.600',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      {metrics.map((metric, index) => (
        <Card key={index} variant="elevated">
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
              <Box
                p={2}
                borderRadius="lg"
                bg={metric.iconBg}
                color={metric.iconColor}
              >
                <metric.icon size={20} />
              </Box>
            </HStack>
            <VStack align="stretch" gap={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {metric.title}
              </Text>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                color="gray.900"
                lineHeight="1.1"
              >
                {metric.value}
              </Text>
              <Text fontSize="xs" color={metric.changeColor} mt={1}>
                {metric.change}
              </Text>
            </VStack>
          </VStack>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default KeyMetricsCards;


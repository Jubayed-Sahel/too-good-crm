import { Box, Heading, Text, VStack, HStack, Badge, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { formatCurrency } from '@/utils';
import { useRevenueChart } from '@/hooks/useAnalytics';

const RevenueChart = () => {
  const { data, isLoading, error } = useRevenueChart();

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading revenue data...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load revenue data</Text>
        </VStack>
      </Card>
    );
  }

  const revenueData = data || {
    currentMonth: 0,
    previousMonth: 0,
    growth: 0,
    monthlyData: [],
  };

  const isPositive = revenueData.growth > 0;

  // Use real data from API
  const monthlyData = revenueData.monthlyData || [];
  const months = monthlyData.map((item: any) => {
    // Extract month name from period string (e.g., "Nov 2025" -> "Nov")
    const period = item.period || item.month || '';
    return period.split(' ')[0] || '';
  });
  const values = monthlyData.map((item: any) => item.revenue || 0);
  const maxValue = Math.max(...values, 1); // Ensure at least 1 to avoid division by zero

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start">
          <Box>
            <Text 
              fontSize="sm" 
              fontWeight="semibold"
              color="gray.600"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              Revenue Overview
            </Text>
            <Heading 
              size={{ base: '3xl', md: '4xl' }}
              color="gray.900"
              lineHeight="1.1"
              fontWeight="bold"
            >
              {formatCurrency(revenueData.currentMonth)}
            </Heading>
            {monthlyData.length > 0 && (
              <HStack gap={2} mt={3}>
                <Badge
                  colorPalette={isPositive ? 'green' : 'red'}
                  size="sm"
                  variant="subtle"
                  px={2}
                  py={0.5}
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                  {isPositive ? '+' : ''}{revenueData.growth.toFixed(1)}%
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  vs last month
                </Text>
              </HStack>
            )}
          </Box>
        </HStack>

        {/* Simple Bar Chart */}
        {months.length > 0 ? (
          <HStack align="end" gap={2} h="180px" pt={4}>
            {months.map((month, index) => {
              const height = maxValue > 0 ? (values[index] / maxValue) * 100 : 0;
              return (
                <VStack key={`${month}-${index}`} flex="1" gap={1} align="stretch">
                  <Box
                    h={`${height}%`}
                    bg={index === months.length - 1 ? 'blue.500' : 'gray.200'}
                    borderRadius="md"
                    position="relative"
                    _hover={{
                      bg: index === months.length - 1 ? 'blue.600' : 'gray.300',
                      cursor: 'pointer',
                    }}
                    transition="all 0.2s"
                  />
                  <Text fontSize="xs" color="gray.600" textAlign="center" fontWeight="semibold">
                    {month}
                  </Text>
                </VStack>
              );
            })}
          </HStack>
        ) : (
          <Box h="180px" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500" fontSize="sm">No revenue data available</Text>
          </Box>
        )}

        {monthlyData.length > 0 && (
          <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
            <Box>
              <Text fontSize="xs" color="gray.500">Previous Month</Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {formatCurrency(revenueData.previousMonth)}
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="xs" color="gray.500">Growth</Text>
              <Text fontSize="sm" fontWeight="semibold" color={isPositive ? 'green.600' : 'red.600'}>
                {formatCurrency(revenueData.currentMonth - revenueData.previousMonth)}
              </Text>
            </Box>
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

export default RevenueChart;

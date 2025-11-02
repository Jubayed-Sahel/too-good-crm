import { Box, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { Card } from '../common';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { formatCurrency } from '@/utils';

interface RevenueChartProps {
  data?: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
  };
}

const RevenueChart = ({ data = { currentMonth: 125000, previousMonth: 98000, growth: 27.6 } }: RevenueChartProps) => {
  const isPositive = data.growth > 0;

  // Mock data for simple bar visualization
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = [65000, 75000, 82000, 98000, 115000, 125000];
  const maxValue = Math.max(...values);

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start">
          <Box>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
              Revenue Overview
            </Text>
            <Heading size="xl" color="gray.900">
              {formatCurrency(data.currentMonth)}
            </Heading>
            <HStack gap={2} mt={2}>
              <Badge
                colorPalette={isPositive ? 'green' : 'red'}
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="xs"
                display="flex"
                alignItems="center"
                gap={1}
              >
                {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {isPositive ? '+' : ''}{data.growth.toFixed(1)}%
              </Badge>
              <Text fontSize="xs" color="gray.500">
                vs last month
              </Text>
            </HStack>
          </Box>
        </HStack>

        {/* Simple Bar Chart */}
        <HStack align="end" gap={2} h="180px" pt={4}>
          {months.map((month, index) => {
            const height = (values[index] / maxValue) * 100;
            return (
              <VStack key={month} flex="1" gap={1} align="stretch">
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
                <Text fontSize="xs" color="gray.600" textAlign="center" fontWeight="medium">
                  {month}
                </Text>
              </VStack>
            );
          })}
        </HStack>

        <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
          <Box>
            <Text fontSize="xs" color="gray.500">Previous Month</Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              {formatCurrency(data.previousMonth)}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.500">Growth</Text>
            <Text fontSize="sm" fontWeight="semibold" color={isPositive ? 'green.600' : 'red.600'}>
              {formatCurrency(data.currentMonth - data.previousMonth)}
            </Text>
          </Box>
        </HStack>
      </VStack>
    </Card>
  );
};

export default RevenueChart;

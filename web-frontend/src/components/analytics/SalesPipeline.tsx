import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react';
import { Card } from '../common';
import { formatCurrency } from '@/utils';

interface SalesPipelineProps {
  stages?: Array<{
    name: string;
    count: number;
    value: number;
    color: string;
  }>;
}

const SalesPipeline = ({ 
  stages = [
    { name: 'Lead', count: 45, value: 225000, color: '#718096' },
    { name: 'Qualified', count: 32, value: 480000, color: '#3182CE' },
    { name: 'Proposal', count: 18, value: 540000, color: '#805AD5' },
    { name: 'Negotiation', count: 12, value: 360000, color: '#DD6B20' },
    { name: 'Closed Won', count: 8, value: 320000, color: '#38A169' },
  ]
}: SalesPipelineProps) => {
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <Box>
          <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
            Sales Pipeline
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            {formatCurrency(totalValue)}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Total Pipeline Value
          </Text>
        </Box>

        <VStack align="stretch" gap={3}>
          {stages.map((stage) => {
            const percentage = (stage.value / totalValue) * 100;
            return (
              <Box key={stage.name}>
                <HStack justify="space-between" mb={1.5}>
                  <HStack gap={2}>
                    <Box
                      w="3"
                      h="3"
                      borderRadius="full"
                      bg={stage.color}
                    />
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      {stage.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      ({stage.count})
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                    {formatCurrency(stage.value)}
                  </Text>
                </HStack>
                <Flex align="center" gap={2}>
                  <Box
                    flex="1"
                    h="2"
                    bg="gray.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${percentage}%`}
                      bg={stage.color}
                      transition="width 0.3s"
                    />
                  </Box>
                  <Text fontSize="xs" color="gray.600" minW="40px" textAlign="right">
                    {percentage.toFixed(1)}%
                  </Text>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
};

export default SalesPipeline;

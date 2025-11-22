import { Box, Text, VStack, HStack, Flex, Heading, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { formatCurrency } from '@/utils';
import { useSalesPipeline } from '@/hooks/useAnalytics';

const SalesPipeline = () => {
  const { data, isLoading, error } = useSalesPipeline();

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading pipeline data...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    console.error('SalesPipeline error:', error);
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500" fontSize="sm" fontWeight="semibold">Failed to load pipeline data</Text>
          {error instanceof Error && (
            <Text color="gray.500" fontSize="xs" mt={2}>
              {error.message}
            </Text>
          )}
        </VStack>
      </Card>
    );
  }

  const pipelineData = data || { stages: [], totalValue: 0 };
  const stages = pipelineData.stages || [];
  const totalValue = pipelineData.totalValue || 0;

  // Helper to get color for stage based on index
  const getStageColor = (index: number) => {
    const colors = [
      '#718096', // gray
      '#3182CE', // blue
      '#805AD5', // purple
      '#DD6B20', // orange
      '#38A169', // green
    ];
    return colors[index % colors.length];
  };

  // Map stages to include color if not present
  const stagesWithColors = stages.map((stage: any, index: number) => ({
    ...stage,
    color: stage.color || getStageColor(index),
  }));

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <Box>
          <Text 
            fontSize="sm" 
            fontWeight="semibold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={2}
          >
            Sales Pipeline
          </Text>
          <Heading
            size={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            color="gray.900"
            lineHeight="1.1"
          >
            {formatCurrency(totalValue)}
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Total Pipeline Value
          </Text>
        </Box>

        <VStack align="stretch" gap={3}>
          {stagesWithColors.length > 0 ? (
            stagesWithColors.map((stage) => {
              const percentage = totalValue > 0 ? (stage.value / totalValue) * 100 : 0;
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
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {stage.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      ({stage.count})
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="gray.900">
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
                  <Text fontSize="xs" color="gray.600" minW="40px" textAlign="right" fontWeight="semibold">
                    {percentage.toFixed(1)}%
                  </Text>
                </Flex>
              </Box>
            );
          })
          ) : (
            <Box py={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">No pipeline data available</Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};

export default SalesPipeline;

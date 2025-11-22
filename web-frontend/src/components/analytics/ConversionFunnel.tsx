import { Box, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { useConversionFunnel } from '@/hooks/useAnalytics';

const ConversionFunnel = () => {
  const { data, isLoading, error } = useConversionFunnel();

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading conversion funnel...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load conversion funnel</Text>
        </VStack>
      </Card>
    );
  }

  const funnelData = data?.stages || [];
  const conversionRate = data?.conversion_rates?.lead_to_won || 0;
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
            Conversion Funnel
          </Text>
          <Text fontSize="sm" color="gray.500">
            Lead to customer conversion rate: {conversionRate.toFixed(1)}%
          </Text>
        </Box>

        <VStack align="stretch" gap={2}>
          {funnelData.length > 0 ? (
            funnelData.map((item: any, index: number) => {
            const width = item.percentage;
            const isFirst = index === 0;
            const isLast = index === data.length - 1;

            return (
              <Box key={item.stage}>
                <HStack justify="space-between" mb={1.5}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                    {item.stage}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.900">
                      {item.count}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      ({item.percentage}%)
                    </Text>
                  </HStack>
                </HStack>
                <Box
                  h="12"
                  w={`${width}%`}
                  bg={
                    isFirst 
                      ? 'blue.100' 
                      : isLast 
                        ? 'green.500' 
                        : 'blue.300'
                  }
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  _hover={{
                    opacity: 0.9,
                    cursor: 'pointer',
                  }}
                  transition="all 0.2s"
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={isLast ? 'white' : 'gray.700'}
                  >
                    {item.percentage}%
                  </Text>
                </Box>
                {index < funnelData.length - 1 && (
                  <Box h="1" w="full" display="flex" justifyContent="center" py={1}>
                    <Box w="0" h="0" borderLeft="8px solid transparent" borderRight="8px solid transparent" borderTop="8px solid #CBD5E0" />
                  </Box>
                )}
              </Box>
            );
          })
          ) : (
            <Box py={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">No conversion funnel data available</Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};

export default ConversionFunnel;

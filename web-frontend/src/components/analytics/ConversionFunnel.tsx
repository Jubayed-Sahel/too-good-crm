import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { Card } from '../common';

interface ConversionFunnelProps {
  data?: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
}

const ConversionFunnel = ({
  data = [
    { stage: 'Leads', count: 500, percentage: 100 },
    { stage: 'Qualified', count: 320, percentage: 64 },
    { stage: 'Proposal', count: 180, percentage: 36 },
    { stage: 'Negotiation', count: 120, percentage: 24 },
    { stage: 'Closed Won', count: 80, percentage: 16 },
  ]
}: ConversionFunnelProps) => {
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
            Lead to customer conversion rate: 16%
          </Text>
        </Box>

        <VStack align="stretch" gap={2}>
          {data.map((item, index) => {
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
                {index < data.length - 1 && (
                  <Box h="1" w="full" display="flex" justifyContent="center" py={1}>
                    <Box w="0" h="0" borderLeft="8px solid transparent" borderRight="8px solid transparent" borderTop="8px solid #CBD5E0" />
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
};

export default ConversionFunnel;

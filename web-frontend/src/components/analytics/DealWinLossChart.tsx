import { Box, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { formatCurrency } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { dealService } from '@/services';

const DealWinLossChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['deals', 'stats'], // Use same query key as sales page
    queryFn: async () => {
      // Use the same service as sales page to ensure consistent data
      return await dealService.getStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading deal statistics...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load deal statistics</Text>
        </VStack>
      </Card>
    );
  }

  const stats = data || {
    won: 0,
    lost: 0,
    open: 0,
    total_deals: 0,
    total: 0,
    by_stage: [],
  };

  // Handle both field names (backend returns total_deals, interface uses total)
  // Ensure we parse numbers correctly (handle string numbers from API)
  const won = Number(stats.won) || 0;
  const lost = Number(stats.lost) || 0;
  const open = Number(stats.open) || 0;
  const total = Number((stats as any).total_deals || stats.total) || 0;
  const byStage = ((stats as any).by_stage || []) as Array<{ stage_name: string; count: number; total_value: number }>;

  const totalClosed = won + lost;
  
  // Get stages excluding closed-won and closed-lost
  // Priority: Proposal, Negotiation, Qualified, then any other stages
  const stagePriority = ['Proposal', 'Negotiation', 'Qualified', 'Lead'];
  const filteredStages = byStage
    .filter((s: any) => {
      const stageName = (s.stage_name || '').toLowerCase();
      return !stageName.includes('closed won') && 
             !stageName.includes('closed-lost') && 
             !stageName.includes('closed lost');
    })
    .sort((a: any, b: any) => {
      const aName = (a.stage_name || '').toLowerCase();
      const bName = (b.stage_name || '').toLowerCase();
      const aIndex = stagePriority.findIndex(p => aName.includes(p.toLowerCase()));
      const bIndex = stagePriority.findIndex(p => bName.includes(p.toLowerCase()));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return (a.stage_name || '').localeCompare(b.stage_name || '');
    })
    .slice(0, 2); // Show top 2 stages (excluding closed won/lost)
  
  // Calculate percentages correctly - Closed deals as % of total
  const closedRate = total > 0 ? (won / total) * 100 : 0;
  
  // For bar visualization: normalize to max value for visual comparison
  const maxValue = Math.max(won, ...filteredStages.map((s: any) => Number(s.count) || 0), 1);
  const wonBarWidth = maxValue > 0 ? (won / maxValue) * 100 : 0;

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
            Deal Performance
          </Text>
          <Text fontSize="sm" color="gray.500">
            Closed: {won} | Open: {open} | Total: {total}
          </Text>
        </Box>

        <VStack align="stretch" gap={3}>
          {/* Closed (Won) Deals */}
          <Box>
            <HStack justify="space-between" mb={1.5}>
              <HStack gap={2}>
                <Box w="3" h="3" borderRadius="full" bg="green.500" />
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  Closed Deals
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  ({won})
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold" color="gray.900">
                {closedRate.toFixed(1)}%
              </Text>
            </HStack>
            <Box
              h="8"
              bg="gray.100"
              borderRadius="full"
              overflow="hidden"
              position="relative"
            >
              <Box
                h="100%"
                w={`${Math.min(wonBarWidth, 100)}%`}
                bg="green.500"
                transition="width 0.3s"
              />
            </Box>
          </Box>

          {/* Show other stages (excluding closed won/lost) */}
          {filteredStages.map((stage: any, index: number) => {
            const stageCount = Number(stage.count) || 0;
            const stageRate = total > 0 ? (stageCount / total) * 100 : 0;
            const stageBarWidth = maxValue > 0 ? (stageCount / maxValue) * 100 : 0;
            
            // Color mapping for stages
            const stageColors: Record<string, string> = {
              'proposal': 'purple.500',
              'negotiation': 'orange.500',
              'qualified': 'blue.500',
              'lead': 'cyan.500',
            };
            const stageNameLower = (stage.stage_name || '').toLowerCase();
            const stageColor = Object.keys(stageColors).find(key => stageNameLower.includes(key)) 
              ? stageColors[Object.keys(stageColors).find(key => stageNameLower.includes(key))!]
              : 'blue.500';
            
            return (
              <Box key={stage.stage_name || index}>
                <HStack justify="space-between" mb={1.5}>
                  <HStack gap={2}>
                    <Box w="3" h="3" borderRadius="full" bg={stageColor} />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {stage.stage_name || 'Unknown Stage'}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      ({stageCount})
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="gray.900">
                    {stageRate.toFixed(1)}%
                  </Text>
                </HStack>
                <Box
                  h="8"
                  bg="gray.100"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={`${Math.min(stageBarWidth, 100)}%`}
                    bg={stageColor}
                    transition="width 0.3s"
                  />
                </Box>
              </Box>
            );
          })}

          {total === 0 && (
            <Box py={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">No deals found</Text>
            </Box>
          )}
        </VStack>

        <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
          <Box>
            <Text fontSize="xs" color="gray.500">Total Deals</Text>
            <Text fontSize="lg" fontWeight="bold" color="gray.900">
              {total}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.500">Open Deals</Text>
            <Text fontSize="lg" fontWeight="bold" color="gray.900">
              {open}
            </Text>
          </Box>
        </HStack>
      </VStack>
    </Card>
  );
};

export default DealWinLossChart;


import { Box, Text, VStack, HStack, Badge, Spinner, Table } from '@chakra-ui/react';
import { Card } from '../common';
import { formatCurrency } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { dealService } from '@/services';
import { formatDate } from '@/utils';

const RecentDeals = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['deals', 'recent'],
    queryFn: async () => {
      // Use the same service as sales page to ensure consistent data
      const response = await dealService.getDeals({
        ordering: '-created_at',
        page_size: 5,
      });
      // Handle both paginated and non-paginated responses
      return response.results || response || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading recent deals...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load recent deals</Text>
        </VStack>
      </Card>
    );
  }

  const deals = data || [];
  
  // Deduplicate deals by ID to prevent showing the same deal multiple times
  const uniqueDeals = Array.from(
    new Map(deals.map((deal) => [deal.id, deal])).values()
  ).slice(0, 5); // Ensure we only show 5 unique deals

  const getStatusBadge = (deal: any) => {
    if (deal.is_won) {
      return <Badge colorPalette="green">Won</Badge>;
    }
    if (deal.is_lost) {
      return <Badge colorPalette="red">Lost</Badge>;
    }
    return <Badge colorPalette="blue">Open</Badge>;
  };

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="gray.600"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Recent Deals
        </Text>

        {uniqueDeals.length > 0 ? (
          <Table.ScrollArea>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Deal</Table.ColumnHeader>
                  <Table.ColumnHeader>Customer</Table.ColumnHeader>
                  <Table.ColumnHeader>Value</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {uniqueDeals.map((deal) => (
                  <Table.Row key={deal.id}>
                    <Table.Cell>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        {deal.title || deal.code}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="xs" color="gray.600">
                        {deal.customer_name || 'N/A'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        {formatCurrency(deal.value || 0)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>{getStatusBadge(deal)}</Table.Cell>
                    <Table.Cell>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(deal.created_at)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        ) : (
          <Box py={4} textAlign="center">
            <Text color="gray.500" fontSize="sm">No recent deals</Text>
          </Box>
        )}
      </VStack>
    </Card>
  );
};

export default RecentDeals;


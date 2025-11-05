import { Box, VStack, HStack, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export interface OrderItem {
  id: number;
  vendor: string;
  service: string;
  amount: string;
  status: string;
}

interface RecentOrdersProps {
  orders: OrderItem[];
}

const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const navigate = useNavigate();

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderColor="gray.200"
    >
      <VStack align="stretch" gap={4}>
        <Heading size="md" color="gray.900">
          Recent Orders
        </Heading>
        <VStack align="stretch" gap={3}>
          {orders.map((order) => (
            <Box
              key={order.id}
              p={4}
              bg="gray.50"
              borderRadius="lg"
              _hover={{ bg: 'gray.100', cursor: 'pointer' }}
              transition="all 0.2s"
              onClick={() => navigate('/client/orders')}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  {order.service}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {order.amount}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">
                  {order.vendor}
                </Text>
                <Box
                  px={2}
                  py={1}
                  bg={order.status === 'Completed' ? 'green.100' : 'orange.100'}
                  color={order.status === 'Completed' ? 'green.700' : 'orange.700'}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="medium"
                >
                  {order.status}
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default RecentOrders;

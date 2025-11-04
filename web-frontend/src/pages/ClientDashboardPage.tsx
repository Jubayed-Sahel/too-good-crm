import { Box, Heading, Text, VStack, SimpleGrid, HStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import {
  FiShoppingBag,
  FiPackage,
  FiCreditCard,
  FiTrendingUp,
  FiCheckCircle,
} from 'react-icons/fi';

const ClientDashboardPage = () => {
  // Mock data for client dashboard
  const stats = [
    {
      label: 'Active Vendors',
      value: '5',
      icon: FiShoppingBag,
      color: 'blue',
      change: '+2 this month',
    },
    {
      label: 'Total Orders',
      value: '24',
      icon: FiPackage,
      color: 'purple',
      change: '8 pending',
    },
    {
      label: 'Total Spent',
      value: '$12,450',
      icon: FiCreditCard,
      color: 'green',
      change: '+15% from last month',
    },
    {
      label: 'Completed Orders',
      value: '16',
      icon: FiCheckCircle,
      color: 'cyan',
      change: '67% completion rate',
    },
  ];

  const recentVendors = [
    { id: 1, name: 'Tech Solutions Inc', category: 'Software', status: 'Active', lastOrder: '2 days ago' },
    { id: 2, name: 'Marketing Pro', category: 'Marketing', status: 'Active', lastOrder: '1 week ago' },
    { id: 3, name: 'Design Studio', category: 'Design', status: 'Active', lastOrder: '3 days ago' },
  ];

  const recentOrders = [
    { id: 1, vendor: 'Tech Solutions Inc', service: 'CRM Setup', amount: '$2,500', status: 'In Progress' },
    { id: 2, vendor: 'Marketing Pro', service: 'SEO Campaign', amount: '$1,800', status: 'Completed' },
    { id: 3, vendor: 'Design Studio', service: 'Logo Design', amount: '$500', status: 'In Progress' },
  ];

  return (
    <DashboardLayout title="Client Dashboard">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            Welcome Back!
          </Heading>
          <Text fontSize="md" color="gray.600">
            Here's an overview of your vendor relationships and orders
          </Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>
          {stats.map((stat) => (
            <Card key={stat.label}>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <Box
                    p={3}
                    bg={`${stat.color}.100`}
                    borderRadius="lg"
                    color={`${stat.color}.600`}
                  >
                    <stat.icon size={24} />
                  </Box>
                  <Box
                    px={2}
                    py={1}
                    bg={`${stat.color}.50`}
                    color={`${stat.color}.700`}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    <FiTrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  </Box>
                </HStack>
                <Box>
                  <Text fontSize="3xl" fontWeight="bold" color="gray.900">
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                    {stat.label}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {stat.change}
                  </Text>
                </Box>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          {/* Recent Vendors */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.900">
                Your Vendors
              </Heading>
              <VStack align="stretch" gap={3}>
                {recentVendors.map((vendor) => (
                  <Box
                    key={vendor.id}
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        {vendor.name}
                      </Text>
                      <Box
                        px={2}
                        py={1}
                        bg="green.100"
                        color="green.700"
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        {vendor.status}
                      </Box>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {vendor.category}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Last order: {vendor.lastOrder}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Card>

          {/* Recent Orders */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.900">
                Recent Orders
              </Heading>
              <VStack align="stretch" gap={3}>
                {recentOrders.map((order) => (
                  <Box
                    key={order.id}
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        {order.service}
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="blue.600">
                        {order.amount}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
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
          </Card>
        </SimpleGrid>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientDashboardPage;

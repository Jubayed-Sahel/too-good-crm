import { Box, Heading, Text, VStack, SimpleGrid } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { DashboardStats, RecentVendors, RecentOrders } from '../components/client-dashboard';
import {
  FiShoppingBag,
  FiPackage,
  FiCreditCard,
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
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            Welcome back!
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Here's an overview of your vendor relationships and orders
          </Text>
        </Box>

        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Recent Activity */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
          <RecentVendors vendors={recentVendors} />
          <RecentOrders orders={recentOrders} />
        </SimpleGrid>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientDashboardPage;

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { OrderStats, OrderFilters, OrdersTable } from '../components/client-orders';
import type { Order } from '../components/client-orders';

const ClientOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  // Check if we're navigating from vendors page with a filter
  useEffect(() => {
    if (location.state?.vendorFilter) {
      setVendorFilter(location.state.vendorFilter);
    }
  }, [location.state]);

  // Mock data for orders
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      vendor: 'Tech Solutions Inc',
      service: 'Website Development',
      amount: 4500,
      status: 'completed',
      orderDate: '2024-01-15',
      deliveryDate: '2024-02-15',
      description: 'Complete website redesign with modern UI/UX',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      vendor: 'Marketing Pro',
      service: 'SEO Optimization',
      amount: 1200,
      status: 'in_progress',
      orderDate: '2024-02-01',
      deliveryDate: '2024-03-01',
      description: 'Monthly SEO optimization and content strategy',
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      vendor: 'Design Studio',
      service: 'Brand Identity',
      amount: 3200,
      status: 'completed',
      orderDate: '2024-01-20',
      deliveryDate: '2024-02-20',
      description: 'Complete brand identity package with logo and guidelines',
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      vendor: 'Cloud Services',
      service: 'Cloud Infrastructure',
      amount: 2800,
      status: 'in_progress',
      orderDate: '2024-02-10',
      deliveryDate: '2024-03-10',
      description: 'AWS cloud infrastructure setup and migration',
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      vendor: 'Tech Solutions Inc',
      service: 'Mobile App Development',
      amount: 8500,
      status: 'pending',
      orderDate: '2024-02-20',
      deliveryDate: '2024-05-20',
      description: 'iOS and Android mobile application development',
    },
    {
      id: '6',
      orderNumber: 'ORD-2024-006',
      vendor: 'Marketing Pro',
      service: 'Social Media Management',
      amount: 950,
      status: 'completed',
      orderDate: '2024-01-05',
      deliveryDate: '2024-02-05',
      description: 'Monthly social media content and engagement',
    },
    {
      id: '7',
      orderNumber: 'ORD-2024-007',
      vendor: 'Content Creators',
      service: 'Video Production',
      amount: 2200,
      status: 'in_progress',
      orderDate: '2024-02-15',
      deliveryDate: '2024-03-15',
      description: 'Corporate video production and editing',
    },
    {
      id: '8',
      orderNumber: 'ORD-2024-008',
      vendor: 'Design Studio',
      service: 'UI/UX Design',
      amount: 1800,
      status: 'cancelled',
      orderDate: '2024-01-10',
      description: 'Mobile app UI/UX design (cancelled due to budget constraints)',
    },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesVendor = vendorFilter === 'all' || order.vendor === vendorFilter;
      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [orders, searchQuery, statusFilter, vendorFilter]);

  const vendors = useMemo(() => {
    return Array.from(new Set(orders.map(order => order.vendor)));
  }, [orders]);

  const stats = useMemo(() => ({
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    pending: orders.filter(o => o.status === 'pending').length,
  }), [orders]);

  const handleViewDetails = (order: Order) => {
    navigate(`/client/orders/${order.id}`);
  };

  return (
    <DashboardLayout title="My Orders">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="xl" color="gray.900" mb={2}>
            My Orders
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Track and manage your orders from all vendors
          </Text>
        </Box>

        {/* Stats */}
        <OrderStats
          total={stats.total}
          completed={stats.completed}
          inProgress={stats.inProgress}
          pending={stats.pending}
        />

        {/* Filters */}
        <OrderFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          vendorFilter={vendorFilter}
          onVendorChange={setVendorFilter}
          vendors={vendors}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          onView={handleViewDetails}
        />
      </VStack>
    </DashboardLayout>
  );
};

export default ClientOrdersPage;

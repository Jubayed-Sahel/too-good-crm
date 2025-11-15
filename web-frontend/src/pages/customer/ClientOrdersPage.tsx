import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { OrderStats, OrderFilters, OrdersTable } from '../../components/client-orders';
import type { Order } from '../../components/client-orders';
import { useOrders, useOrderStats } from '@/hooks';
import type { OrderFilters as OrderFiltersType } from '@/types';

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

  // Build API filters
  const apiFilters: OrderFiltersType = useMemo(() => {
    const filters: OrderFiltersType = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== 'all') filters.status = statusFilter as any;
    if (vendorFilter !== 'all') filters.vendor = parseInt(vendorFilter);
    return filters;
  }, [searchQuery, statusFilter, vendorFilter]);

  // Fetch data from backend
  const { data: ordersData, isLoading, error } = useOrders(apiFilters);
  const { data: statsData } = useOrderStats();
  
  const orders = ordersData?.results || [];

  // Map backend orders to component format
  const mappedOrders: Order[] = useMemo(() => {
    return orders.map(order => ({
      id: order.id.toString(),
      orderNumber: order.order_number,
      vendor: order.vendor_name || 'N/A',
      service: order.title,
      amount: parseFloat(order.total_amount.toString()),
      status: order.status as any,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date || '',
      description: order.description || '',
    }));
  }, [orders]);

  // Get unique vendors for filter
  const vendors = useMemo(() => {
    const vendorNames = orders.map(o => o.vendor_name).filter(Boolean) as string[];
    return Array.from(new Set(vendorNames));
  }, [orders]);

  // Map stats from backend
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        total: mappedOrders.length,
        completed: mappedOrders.filter(o => o.status === 'completed').length,
        inProgress: mappedOrders.filter(o => o.status === 'in_progress').length,
        pending: mappedOrders.filter(o => o.status === 'pending').length,
      };
    }
    return {
      total: statsData.total || 0,
      completed: statsData.by_status?.completed || 0,
      inProgress: statsData.by_status?.processing || 0,
      pending: statsData.by_status?.pending || 0,
    };
  }, [statsData, mappedOrders]);

  const handleViewDetails = (order: Order) => {
    navigate(`/client/orders/${order.id}`);
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout title="My Orders">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load orders
          </Heading>
          <Text color="gray.500">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="My Orders">
        <Box display="flex" justifyContent="center" py={12}>
          <Spinner size="xl" color="blue.500" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Orders">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
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
          orders={mappedOrders}
          onView={handleViewDetails}
        />
      </VStack>
    </DashboardLayout>
  );
};

export default ClientOrdersPage;

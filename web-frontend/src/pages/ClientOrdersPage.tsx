import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Heading, Text, VStack, HStack, Button, Badge, SimpleGrid, Input, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { FiPackage, FiCalendar, FiDollarSign, FiEye, FiDownload, FiSearch } from 'react-icons/fi';

interface Order {
  id: string;
  orderNumber: string;
  vendor: string;
  service: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  description: string;
}

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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesVendor = vendorFilter === 'all' || order.vendor === vendorFilter;
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const vendors = Array.from(new Set(orders.map(order => order.vendor)));

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    pending: orders.filter(o => o.status === 'pending').length,
  };

  return (
    <DashboardLayout title="My Orders">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            My Orders
          </Heading>
          <Text fontSize="md" color="gray.600">
            Track and manage your orders from all vendors
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Total Orders
                </Text>
                <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                  <FiPackage size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.total}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Completed
                </Text>
                <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                  <FiPackage size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.completed}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  In Progress
                </Text>
                <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                  <FiPackage size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.inProgress}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Pending
                </Text>
                <Box p={2} bg="orange.100" borderRadius="md" color="orange.600">
                  <FiPackage size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.pending}
              </Heading>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                Search Orders
              </Text>
              <HStack>
                <FiSearch color="#3b82f6" />
                <Input
                  placeholder="Search by order number, service, or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="lg"
                />
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                Filter by Status
              </Text>
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </NativeSelectField>
              </NativeSelectRoot>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                Filter by Vendor
              </Text>
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                >
                  <option value="all">All Vendors</option>
                  {vendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Box>
          </SimpleGrid>
        </Card>

        {/* Orders List */}
        <VStack align="stretch" gap={4}>
          {filteredOrders.length === 0 ? (
            <Card>
              <Box textAlign="center" py={8}>
                <FiPackage size={48} color="#cbd5e0" style={{ margin: '0 auto' }} />
                <Text fontSize="lg" color="gray.600" mt={4}>
                  No orders found
                </Text>
              </Box>
            </Card>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id}>
                <VStack align="stretch" gap={4}>
                  {/* Order Header */}
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <HStack gap={3}>
                      <Box
                        p={3}
                        bg="blue.100"
                        borderRadius="lg"
                        color="blue.600"
                      >
                        <FiPackage size={24} />
                      </Box>
                      <Box>
                        <Heading size="md" color="gray.900">
                          {order.orderNumber}
                        </Heading>
                        <Text fontSize="sm" color="gray.600">
                          {order.vendor}
                        </Text>
                      </Box>
                    </HStack>
                    <Badge colorPalette={getStatusColor(order.status)} size="lg">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </HStack>

                  {/* Order Details */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={1}>
                      {order.service}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {order.description}
                    </Text>
                  </Box>

                  {/* Order Info Grid */}
                  <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
                    <HStack gap={2}>
                      <FiDollarSign color="#3b82f6" size={18} />
                      <Box>
                        <Text fontSize="xs" color="gray.600">Amount</Text>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900">
                          ${order.amount.toLocaleString()}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack gap={2}>
                      <FiCalendar color="#3b82f6" size={18} />
                      <Box>
                        <Text fontSize="xs" color="gray.600">Order Date</Text>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </Text>
                      </Box>
                    </HStack>

                    {order.deliveryDate && (
                      <HStack gap={2}>
                        <FiCalendar color="#3b82f6" size={18} />
                        <Box>
                          <Text fontSize="xs" color="gray.600">Delivery Date</Text>
                          <Text fontSize="md" fontWeight="semibold" color="gray.900">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </Text>
                        </Box>
                      </HStack>
                    )}
                  </SimpleGrid>

                  {/* Action Buttons */}
                  <HStack gap={3} pt={2}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      colorPalette="blue"
                      onClick={() => navigate(`/client/orders/${order.id}`)}
                    >
                      <HStack gap={2}>
                        <FiEye size={16} />
                        <Text>View Details</Text>
                      </HStack>
                    </Button>
                    {order.status === 'completed' && (
                      <Button size="sm" variant="outline" colorPalette="green">
                        <HStack gap={2}>
                          <FiDownload size={16} />
                          <Text>Download Invoice</Text>
                        </HStack>
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </Card>
            ))
          )}
        </VStack>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientOrdersPage;

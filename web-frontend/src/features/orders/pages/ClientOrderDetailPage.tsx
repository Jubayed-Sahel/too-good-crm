import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, HStack, Button, Badge, SimpleGrid, Separator } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { 
  FiPackage, 
  FiCalendar, 
  FiDollarSign, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiDownload, 
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiTruck
} from 'react-icons/fi';

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
  vendorContact: {
    email: string;
    phone: string;
    address: string;
  };
  orderDetails: {
    quantity?: number;
    duration?: string;
    startDate?: string;
    endDate?: string;
  };
  paymentInfo: {
    method: string;
    paid: number;
    remaining: number;
  };
  timeline: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

const ClientOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock data - in real app, fetch based on id
  const orders: Record<string, Order> = {
    '1': {
      id: '1',
      orderNumber: 'ORD-2024-001',
      vendor: 'Tech Solutions Inc',
      service: 'Website Development',
      amount: 4500,
      status: 'completed',
      orderDate: '2024-01-15',
      deliveryDate: '2024-02-15',
      description: 'Complete website redesign with modern UI/UX including responsive design, SEO optimization, and content management system integration.',
      vendorContact: {
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, San Francisco, CA 94102',
      },
      orderDetails: {
        duration: '30 days',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
      },
      paymentInfo: {
        method: 'Credit Card (****4532)',
        paid: 4500,
        remaining: 0,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-01-15', description: 'Order has been placed and confirmed' },
        { status: 'In Progress', date: '2024-01-20', description: 'Development started' },
        { status: 'Review', date: '2024-02-10', description: 'Initial version ready for review' },
        { status: 'Completed', date: '2024-02-15', description: 'Final version delivered and approved' },
      ],
    },
    '2': {
      id: '2',
      orderNumber: 'ORD-2024-002',
      vendor: 'Marketing Pro',
      service: 'SEO Optimization',
      amount: 1200,
      status: 'in_progress',
      orderDate: '2024-02-01',
      deliveryDate: '2024-03-01',
      description: 'Monthly SEO optimization and content strategy to improve search engine rankings and organic traffic.',
      vendorContact: {
        email: 'info@marketingpro.com',
        phone: '+1 (555) 234-5678',
        address: '456 Marketing Ave, New York, NY 10001',
      },
      orderDetails: {
        duration: '30 days (recurring)',
        startDate: '2024-02-01',
      },
      paymentInfo: {
        method: 'Bank Transfer',
        paid: 1200,
        remaining: 0,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-02-01', description: 'Monthly SEO service activated' },
        { status: 'In Progress', date: '2024-02-05', description: 'Keyword research and analysis started' },
      ],
    },
    '3': {
      id: '3',
      orderNumber: 'ORD-2024-003',
      vendor: 'Design Studio',
      service: 'Brand Identity',
      amount: 3200,
      status: 'completed',
      orderDate: '2024-01-20',
      deliveryDate: '2024-02-20',
      description: 'Complete brand identity package with logo design, color palette, typography guidelines, and brand manual.',
      vendorContact: {
        email: 'hello@designstudio.com',
        phone: '+1 (555) 345-6789',
        address: '789 Design Plaza, Los Angeles, CA 90001',
      },
      orderDetails: {
        duration: '30 days',
        startDate: '2024-01-20',
        endDate: '2024-02-20',
      },
      paymentInfo: {
        method: 'Credit Card (****4532)',
        paid: 3200,
        remaining: 0,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-01-20', description: 'Brand identity project initiated' },
        { status: 'In Progress', date: '2024-01-25', description: 'Initial concepts created' },
        { status: 'Review', date: '2024-02-10', description: 'First draft presented for feedback' },
        { status: 'Completed', date: '2024-02-20', description: 'Final brand package delivered' },
      ],
    },
    '4': {
      id: '4',
      orderNumber: 'ORD-2024-004',
      vendor: 'Cloud Services',
      service: 'Cloud Infrastructure',
      amount: 2800,
      status: 'in_progress',
      orderDate: '2024-02-10',
      deliveryDate: '2024-03-10',
      description: 'AWS cloud infrastructure setup and migration including server configuration, database setup, and security implementation.',
      vendorContact: {
        email: 'support@cloudservices.com',
        phone: '+1 (555) 456-7890',
        address: '321 Cloud Drive, Seattle, WA 98101',
      },
      orderDetails: {
        duration: '30 days',
        startDate: '2024-02-10',
        endDate: '2024-03-10',
      },
      paymentInfo: {
        method: 'Pending',
        paid: 0,
        remaining: 2800,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-02-10', description: 'Cloud migration project started' },
        { status: 'In Progress', date: '2024-02-15', description: 'Infrastructure planning completed' },
      ],
    },
    '5': {
      id: '5',
      orderNumber: 'ORD-2024-005',
      vendor: 'Tech Solutions Inc',
      service: 'Mobile App Development',
      amount: 8500,
      status: 'pending',
      orderDate: '2024-02-20',
      deliveryDate: '2024-05-20',
      description: 'iOS and Android mobile application development with user authentication, push notifications, and API integration.',
      vendorContact: {
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, San Francisco, CA 94102',
      },
      orderDetails: {
        duration: '90 days',
        startDate: '2024-02-20',
        endDate: '2024-05-20',
      },
      paymentInfo: {
        method: 'Pending',
        paid: 0,
        remaining: 8500,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-02-20', description: 'Mobile app project confirmed' },
      ],
    },
    '6': {
      id: '6',
      orderNumber: 'ORD-2024-006',
      vendor: 'Marketing Pro',
      service: 'Social Media Management',
      amount: 950,
      status: 'completed',
      orderDate: '2024-01-05',
      deliveryDate: '2024-02-05',
      description: 'Monthly social media content creation and engagement management across Facebook, Instagram, and Twitter.',
      vendorContact: {
        email: 'info@marketingpro.com',
        phone: '+1 (555) 234-5678',
        address: '456 Marketing Ave, New York, NY 10001',
      },
      orderDetails: {
        duration: '30 days',
        startDate: '2024-01-05',
        endDate: '2024-02-05',
      },
      paymentInfo: {
        method: 'Credit Card (****4532)',
        paid: 950,
        remaining: 0,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-01-05', description: 'Social media service started' },
        { status: 'In Progress', date: '2024-01-10', description: 'Content calendar created' },
        { status: 'Completed', date: '2024-02-05', description: 'Monthly service completed successfully' },
      ],
    },
    '7': {
      id: '7',
      orderNumber: 'ORD-2024-007',
      vendor: 'Content Creators',
      service: 'Video Production',
      amount: 2200,
      status: 'in_progress',
      orderDate: '2024-02-15',
      deliveryDate: '2024-03-15',
      description: 'Corporate video production and editing for marketing campaign including scripting, filming, and post-production.',
      vendorContact: {
        email: 'create@contentcreators.com',
        phone: '+1 (555) 567-8901',
        address: '654 Media Blvd, Austin, TX 78701',
      },
      orderDetails: {
        duration: '30 days',
        startDate: '2024-02-15',
        endDate: '2024-03-15',
      },
      paymentInfo: {
        method: 'Pending',
        paid: 1100,
        remaining: 1100,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-02-15', description: 'Video production project started' },
        { status: 'In Progress', date: '2024-02-20', description: 'Script approved, filming scheduled' },
      ],
    },
    '8': {
      id: '8',
      orderNumber: 'ORD-2024-008',
      vendor: 'Design Studio',
      service: 'UI/UX Design',
      amount: 1800,
      status: 'cancelled',
      orderDate: '2024-01-10',
      description: 'Mobile app UI/UX design project cancelled due to budget constraints and change in project scope.',
      vendorContact: {
        email: 'hello@designstudio.com',
        phone: '+1 (555) 345-6789',
        address: '789 Design Plaza, Los Angeles, CA 90001',
      },
      orderDetails: {
        duration: 'N/A',
        startDate: '2024-01-10',
      },
      paymentInfo: {
        method: 'N/A',
        paid: 0,
        remaining: 0,
      },
      timeline: [
        { status: 'Order Placed', date: '2024-01-10', description: 'UI/UX design project initiated' },
        { status: 'Cancelled', date: '2024-01-15', description: 'Project cancelled by client' },
      ],
    },
  };

  const order = id ? orders[id] : null;

  if (!order) {
    return (
      <DashboardLayout title="Order Not Found">
        <Card>
          <VStack align="center" gap={4} py={8}>
            <FiPackage size={64} color="#cbd5e0" />
            <Heading size="lg" color="gray.900">Order Not Found</Heading>
            <Text color="gray.600">The order you're looking for doesn't exist.</Text>
            <Button colorPalette="blue" onClick={() => navigate('/client/orders')}>
              Back to Orders
            </Button>
          </VStack>
        </Card>
      </DashboardLayout>
    );
  }

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

  return (
    <DashboardLayout title={`Order ${order.orderNumber}`}>
      <VStack align="stretch" gap={6}>
        {/* Back Button */}
        <Button
          variant="ghost"
          alignSelf="flex-start"
          onClick={() => navigate('/client/orders')}
        >
          <HStack gap={2}>
            <FiArrowLeft size={20} />
            <Text>Back to Orders</Text>
          </HStack>
        </Button>

        {/* Order Header */}
        <Card>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack gap={3}>
                <Box
                  p={4}
                  bg="blue.100"
                  borderRadius="xl"
                  color="blue.600"
                >
                  <FiPackage size={32} />
                </Box>
                <Box>
                  <Heading size="xl" color="gray.900">
                    {order.orderNumber}
                  </Heading>
                  <Text fontSize="md" color="gray.600" mt={1}>
                    {order.vendor}
                  </Text>
                </Box>
              </HStack>
              <Badge colorPalette={getStatusColor(order.status)} size="lg">
                {getStatusLabel(order.status)}
              </Badge>
            </HStack>

            <Box>
              <Heading size="lg" color="gray.900" mb={2}>
                {order.service}
              </Heading>
              <Text fontSize="md" color="gray.700">
                {order.description}
              </Text>
            </Box>

            {order.status === 'completed' && (
              <Button colorPalette="green" size="lg" alignSelf="flex-start">
                <HStack gap={2}>
                  <FiDownload size={20} />
                  <Text>Download Invoice</Text>
                </HStack>
              </Button>
            )}
          </VStack>
        </Card>

        {/* Order Details Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Order Information */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="md" color="gray.900">Order Information</Heading>
              <Separator />

              <HStack gap={3}>
                <Box color="blue.600">
                  <FiDollarSign size={20} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600">Total Amount</Text>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                    ${order.amount.toLocaleString()}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <Box color="blue.600">
                  <FiCalendar size={20} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600">Order Date</Text>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                    {new Date(order.orderDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </Box>
              </HStack>

              {order.deliveryDate && (
                <HStack gap={3}>
                  <Box color="blue.600">
                    <FiTruck size={20} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color="gray.600">Delivery Date</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      {new Date(order.deliveryDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </Box>
                </HStack>
              )}

              {order.orderDetails.duration && (
                <HStack gap={3}>
                  <Box color="blue.600">
                    <FiClock size={20} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color="gray.600">Duration</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      {order.orderDetails.duration}
                    </Text>
                  </Box>
                </HStack>
              )}
            </VStack>
          </Card>

          {/* Payment Information */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="md" color="gray.900">Payment Information</Heading>
              <Separator />

              <HStack gap={3}>
                <Box color="green.600">
                  <FiCheckCircle size={20} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600">Paid Amount</Text>
                  <Text fontSize="lg" fontWeight="semibold" color="green.600">
                    ${order.paymentInfo.paid.toLocaleString()}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <Box color="orange.600">
                  <FiClock size={20} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600">Remaining Amount</Text>
                  <Text fontSize="lg" fontWeight="semibold" color={order.paymentInfo.remaining > 0 ? "orange.600" : "gray.900"}>
                    ${order.paymentInfo.remaining.toLocaleString()}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <Box color="blue.600">
                  <FiDollarSign size={20} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="gray.600">Payment Method</Text>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                    {order.paymentInfo.method}
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Vendor Contact Information */}
        <Card>
          <VStack align="stretch" gap={4}>
            <Heading size="md" color="gray.900">Vendor Contact Information</Heading>
            <Separator />

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <HStack gap={3}>
                <Box color="blue.600">
                  <FiMail size={20} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Email</Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.900">
                    {order.vendorContact.email}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <Box color="blue.600">
                  <FiPhone size={20} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Phone</Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.900">
                    {order.vendorContact.phone}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <Box color="blue.600">
                  <FiMapPin size={20} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Address</Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.900">
                    {order.vendorContact.address}
                  </Text>
                </Box>
              </HStack>
            </SimpleGrid>
          </VStack>
        </Card>

        {/* Order Timeline */}
        <Card>
          <VStack align="stretch" gap={4}>
            <Heading size="md" color="gray.900">Order Timeline</Heading>
            <Separator />

            <VStack align="stretch" gap={4}>
              {order.timeline.map((event, index) => (
                <HStack key={index} align="start" gap={4}>
                  <Box
                    p={2}
                    bg={index === order.timeline.length - 1 ? "blue.100" : "gray.100"}
                    borderRadius="md"
                    color={index === order.timeline.length - 1 ? "blue.600" : "gray.600"}
                  >
                    <FiCheckCircle size={20} />
                  </Box>
                  <Box flex="1">
                    <HStack justify="space-between" flexWrap="wrap" mb={1}>
                      <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        {event.status}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      {event.description}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientOrderDetailPage;

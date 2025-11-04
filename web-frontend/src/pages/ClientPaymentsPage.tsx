import { useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, Badge, SimpleGrid, Input, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { FiCreditCard, FiCalendar, FiDollarSign, FiDownload, FiSearch, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface Payment {
  id: string;
  transactionId: string;
  orderNumber: string;
  vendor: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  paymentDate?: string;
  dueDate: string;
  paymentMethod: string;
  description: string;
}

const ClientPaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  // Mock data for payments
  const payments: Payment[] = [
    {
      id: '1',
      transactionId: 'TXN-2024-001',
      orderNumber: 'ORD-2024-001',
      vendor: 'Tech Solutions Inc',
      amount: 4500,
      status: 'paid',
      paymentDate: '2024-02-15',
      dueDate: '2024-02-15',
      paymentMethod: 'Credit Card (****4532)',
      description: 'Website Development - Final Payment',
    },
    {
      id: '2',
      transactionId: 'TXN-2024-002',
      orderNumber: 'ORD-2024-002',
      vendor: 'Marketing Pro',
      amount: 1200,
      status: 'paid',
      paymentDate: '2024-02-01',
      dueDate: '2024-02-01',
      paymentMethod: 'Bank Transfer',
      description: 'SEO Optimization - Monthly Fee',
    },
    {
      id: '3',
      transactionId: 'TXN-2024-003',
      orderNumber: 'ORD-2024-003',
      vendor: 'Design Studio',
      amount: 3200,
      status: 'paid',
      paymentDate: '2024-02-20',
      dueDate: '2024-02-20',
      paymentMethod: 'Credit Card (****4532)',
      description: 'Brand Identity - Full Package',
    },
    {
      id: '4',
      transactionId: 'TXN-2024-004',
      orderNumber: 'ORD-2024-004',
      vendor: 'Cloud Services',
      amount: 2800,
      status: 'pending',
      dueDate: '2024-03-10',
      paymentMethod: 'Pending',
      description: 'Cloud Infrastructure - Setup Fee',
    },
    {
      id: '5',
      transactionId: 'TXN-2024-005',
      orderNumber: 'ORD-2024-005',
      vendor: 'Tech Solutions Inc',
      amount: 4250,
      status: 'pending',
      dueDate: '2024-03-01',
      paymentMethod: 'Pending',
      description: 'Mobile App Development - Milestone 1',
    },
    {
      id: '6',
      transactionId: 'TXN-2024-006',
      orderNumber: 'ORD-2024-006',
      vendor: 'Marketing Pro',
      amount: 950,
      status: 'paid',
      paymentDate: '2024-02-05',
      dueDate: '2024-02-05',
      paymentMethod: 'Credit Card (****4532)',
      description: 'Social Media Management - Monthly',
    },
    {
      id: '7',
      transactionId: 'TXN-2024-007',
      orderNumber: 'ORD-2024-007',
      vendor: 'Content Creators',
      amount: 1100,
      status: 'overdue',
      dueDate: '2024-02-25',
      paymentMethod: 'Pending',
      description: 'Video Production - Deposit',
    },
    {
      id: '8',
      transactionId: 'TXN-2024-008',
      orderNumber: 'ORD-2024-002',
      vendor: 'Marketing Pro',
      amount: 1200,
      status: 'pending',
      dueDate: '2024-03-01',
      paymentMethod: 'Pending',
      description: 'SEO Optimization - Monthly Fee (March)',
    },
  ];

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'blue';
      case 'overdue':
        return 'red';
      case 'refunded':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: Payment['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesVendor = vendorFilter === 'all' || payment.vendor === vendorFilter;
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const vendors = Array.from(new Set(payments.map(payment => payment.vendor)));

  const stats = {
    totalPaid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    count: payments.length,
  };

  return (
    <DashboardLayout title="Payments">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            Payments
          </Heading>
          <Text fontSize="md" color="gray.600">
            Track your payments and invoices
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Total Paid
                </Text>
                <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                  <FiCheckCircle size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                ${stats.totalPaid.toLocaleString()}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Pending
                </Text>
                <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                  <FiCreditCard size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                ${stats.totalPending.toLocaleString()}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Overdue
                </Text>
                <Box p={2} bg="red.100" borderRadius="md" color="red.600">
                  <FiAlertCircle size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                ${stats.totalOverdue.toLocaleString()}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Total Payments
                </Text>
                <Box p={2} bg="purple.100" borderRadius="md" color="purple.600">
                  <FiDollarSign size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.count}
              </Heading>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                Search Payments
              </Text>
              <HStack>
                <FiSearch color="#3b82f6" />
                <Input
                  placeholder="Search by transaction ID, order number, or vendor..."
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
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="refunded">Refunded</option>
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

        {/* Payments List */}
        <VStack align="stretch" gap={4}>
          {filteredPayments.length === 0 ? (
            <Card>
              <Box textAlign="center" py={8}>
                <FiCreditCard size={48} color="#cbd5e0" style={{ margin: '0 auto' }} />
                <Text fontSize="lg" color="gray.600" mt={4}>
                  No payments found
                </Text>
              </Box>
            </Card>
          ) : (
            filteredPayments.map(payment => (
              <Card key={payment.id}>
                <VStack align="stretch" gap={4}>
                  {/* Payment Header */}
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <HStack gap={3}>
                      <Box
                        p={3}
                        bg={payment.status === 'paid' ? 'green.100' : payment.status === 'overdue' ? 'red.100' : 'blue.100'}
                        borderRadius="lg"
                        color={payment.status === 'paid' ? 'green.600' : payment.status === 'overdue' ? 'red.600' : 'blue.600'}
                      >
                        <FiCreditCard size={24} />
                      </Box>
                      <Box>
                        <Heading size="md" color="gray.900">
                          {payment.transactionId}
                        </Heading>
                        <Text fontSize="sm" color="gray.600">
                          Order: {payment.orderNumber}
                        </Text>
                      </Box>
                    </HStack>
                    <Badge colorPalette={getStatusColor(payment.status)} size="lg">
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </HStack>

                  {/* Payment Details */}
                  <Box>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900" mb={1}>
                      {payment.vendor}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {payment.description}
                    </Text>
                  </Box>

                  {/* Payment Info Grid */}
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4}>
                    <HStack gap={2}>
                      <FiDollarSign color="#3b82f6" size={18} />
                      <Box>
                        <Text fontSize="xs" color="gray.600">Amount</Text>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900">
                          ${payment.amount.toLocaleString()}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack gap={2}>
                      <FiCalendar color="#3b82f6" size={18} />
                      <Box>
                        <Text fontSize="xs" color="gray.600">Due Date</Text>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </Text>
                      </Box>
                    </HStack>

                    {payment.paymentDate && (
                      <HStack gap={2}>
                        <FiCheckCircle color="#10b981" size={18} />
                        <Box>
                          <Text fontSize="xs" color="gray.600">Paid On</Text>
                          <Text fontSize="md" fontWeight="semibold" color="gray.900">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </Text>
                        </Box>
                      </HStack>
                    )}

                    <HStack gap={2}>
                      <FiCreditCard color="#3b82f6" size={18} />
                      <Box>
                        <Text fontSize="xs" color="gray.600">Payment Method</Text>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900">
                          {payment.paymentMethod}
                        </Text>
                      </Box>
                    </HStack>
                  </SimpleGrid>

                  {/* Action Buttons */}
                  <HStack gap={3} pt={2}>
                    {payment.status === 'paid' && (
                      <Button size="sm" variant="outline" colorPalette="green">
                        <HStack gap={2}>
                          <FiDownload size={16} />
                          <Text>Download Receipt</Text>
                        </HStack>
                      </Button>
                    )}
                    {(payment.status === 'pending' || payment.status === 'overdue') && (
                      <Button size="sm" colorPalette="blue">
                        <HStack gap={2}>
                          <FiCreditCard size={16} />
                          <Text>Pay Now</Text>
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

export default ClientPaymentsPage;

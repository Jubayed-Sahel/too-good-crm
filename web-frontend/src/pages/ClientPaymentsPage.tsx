import { useState, useMemo } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { PaymentStats, PaymentFilters, PaymentsTable } from '../components/client-payments';
import type { Payment } from '../components/client-payments';

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

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesVendor = vendorFilter === 'all' || payment.vendor === vendorFilter;
      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [payments, searchQuery, statusFilter, vendorFilter]);

  const vendors = useMemo(() => {
    return Array.from(new Set(payments.map(payment => payment.vendor)));
  }, [payments]);

  const stats = useMemo(() => ({
    totalPaid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    count: payments.length,
  }), [payments]);

  const handlePayNow = (payment: Payment) => {
    console.log('Pay now:', payment);
    // Handle payment processing
  };

  const handleDownloadReceipt = (payment: Payment) => {
    console.log('Download receipt:', payment);
    // Handle receipt download
  };

  return (
    <DashboardLayout title="Payments">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="xl" color="gray.900" mb={2}>
            Payments
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Track your payments and invoices
          </Text>
        </Box>

        {/* Stats */}
        <PaymentStats
          totalPaid={stats.totalPaid}
          totalPending={stats.totalPending}
          totalOverdue={stats.totalOverdue}
          count={stats.count}
        />

        {/* Filters */}
        <PaymentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          vendorFilter={vendorFilter}
          onVendorChange={setVendorFilter}
          vendors={vendors}
        />

        {/* Payments Table */}
        <PaymentsTable
          payments={filteredPayments}
          onPayNow={handlePayNow}
          onDownloadReceipt={handleDownloadReceipt}
        />
      </VStack>
    </DashboardLayout>
  );
};

export default ClientPaymentsPage;

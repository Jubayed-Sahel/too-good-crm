import { useState, useMemo } from 'react';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { PaymentStats, PaymentFilters, PaymentsTable } from '../../components/client-payments';
import type { Payment } from '../../components/client-payments';
import { usePayments, usePaymentStats } from '@/hooks';
import type { PaymentFilters as PaymentFiltersType } from '@/types';

const ClientPaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  // Build API filters
  const apiFilters: PaymentFiltersType = useMemo(() => {
    const filters: PaymentFiltersType = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== 'all') filters.status = statusFilter as any;
    if (vendorFilter !== 'all') filters.vendor = parseInt(vendorFilter);
    return filters;
  }, [searchQuery, statusFilter, vendorFilter]);

  // Fetch data from backend
  const { data: paymentsData, isLoading, error } = usePayments(apiFilters);
  const { data: statsData } = usePaymentStats();
  
  const payments = paymentsData?.results || [];

  // Map backend payments to component format
  const mappedPayments: Payment[] = useMemo(() => {
    return payments.map(payment => {
      const status = payment.status === 'completed' ? 'paid' : payment.status;
      const isDue = payment.due_date && new Date(payment.due_date) < new Date() && payment.status === 'pending';
      
      return {
        id: payment.id.toString(),
        transactionId: payment.transaction_id || payment.payment_number,
        orderNumber: payment.order_number || 'N/A',
        vendor: payment.vendor_name || 'N/A',
        amount: parseFloat(payment.amount.toString()),
        status: isDue ? 'overdue' : status as any,
        paymentDate: payment.payment_date || '',
        dueDate: payment.due_date || '',
        paymentMethod: payment.payment_method.replace('_', ' '),
        description: payment.notes || payment.reference_number || '',
      };
    });
  }, [payments]);

  // Get unique vendors for filter
  const vendors = useMemo(() => {
    const vendorNames = payments.map(p => p.vendor_name).filter(Boolean) as string[];
    return Array.from(new Set(vendorNames));
  }, [payments]);

  // Map stats from backend
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        totalPaid: mappedPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
        totalPending: mappedPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        totalOverdue: mappedPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
        count: mappedPayments.length,
      };
    }
    return {
      totalPaid: parseFloat((statsData.by_status?.completed || 0).toString()),
      totalPending: parseFloat((statsData.by_status?.pending || 0).toString()),
      totalOverdue: 0, // Backend doesn't track overdue separately
      count: statsData.total || 0,
    };
  }, [statsData, mappedPayments]);

  const handlePayNow = (payment: Payment) => {
    console.log('Pay now:', payment);
    // Handle payment processing
  };

  const handleDownloadReceipt = (payment: Payment) => {
    console.log('Download receipt:', payment);
    // Handle receipt download
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Payments">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load payments
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
      <DashboardLayout title="Payments">
        <Box display="flex" justifyContent="center" py={12}>
          <Spinner size="xl" color="blue.500" />
        </Box>
      </DashboardLayout>
    );
  }

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
          payments={mappedPayments}
          onPayNow={handlePayNow}
          onDownloadReceipt={handleDownloadReceipt}
        />

        {/* Empty State */}
        {mappedPayments.length === 0 && (
          <Box
            textAlign="center"
            py={12}
            px={6}
            bg="gray.50"
            borderRadius="lg"
          >
            <Heading size="md" color="gray.600" mb={2}>
              No payments found
            </Heading>
            <Text color="gray.500">
              {searchQuery || statusFilter !== 'all' || vendorFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No payment records available'}
            </Text>
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientPaymentsPage;

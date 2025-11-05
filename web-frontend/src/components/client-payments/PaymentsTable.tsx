import {
  Table,
  Badge,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Box,
  Flex,
} from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { FiDownload, FiCreditCard, FiCalendar, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { Card } from '../common';
import { ResponsiveTable } from '../common';
import { useState } from 'react';

export interface Payment {
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

interface PaymentsTableProps {
  payments: Payment[];
  onPayNow?: (payment: Payment) => void;
  onDownloadReceipt?: (payment: Payment) => void;
}

const PaymentsTable = ({ payments, onPayNow, onDownloadReceipt }: PaymentsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(payments.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = selectedIds.length === payments.length && payments.length > 0;

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (payments.length === 0) {
    return (
      <Card p={6}>
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">No payments found</Text>
          <Text color="gray.600">Try adjusting your filters.</Text>
        </VStack>
      </Card>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {payments.map((payment) => (
        <Card key={payment.id} p={4}>
          <VStack align="stretch" gap={3}>
            {/* Header */}
            <Flex justify="space-between" align="start">
              <HStack gap={3}>
                <Box
                  p={3}
                  bg={payment.status === 'paid' ? 'green.100' : payment.status === 'overdue' ? 'red.100' : 'blue.100'}
                  borderRadius="lg"
                  color={payment.status === 'paid' ? 'green.600' : payment.status === 'overdue' ? 'red.600' : 'blue.600'}
                >
                  <FiCreditCard size={24} />
                </Box>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontWeight="bold" fontSize="md" color="gray.900">
                    {payment.transactionId}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Order: {payment.orderNumber}
                  </Text>
                </VStack>
              </HStack>
              
              <Badge
                colorPalette={getStatusColor(payment.status)}
                size="sm"
                textTransform="capitalize"
              >
                {getStatusLabel(payment.status)}
              </Badge>
            </Flex>

            {/* Description */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" color="gray.900" mb={1}>
                {payment.vendor}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {payment.description}
              </Text>
            </Box>

            {/* Info Grid */}
            <VStack align="stretch" gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              <HStack gap={2}>
                <FiDollarSign size={16} color="#3b82f6" />
                <Box flex={1}>
                  <Text fontSize="xs" color="gray.500">Amount</Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.900">
                    ${payment.amount.toLocaleString()}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={2}>
                <FiCalendar size={16} color="#3b82f6" />
                <Box flex={1}>
                  <Text fontSize="xs" color="gray.500">Due Date</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </Text>
                </Box>
              </HStack>

              {payment.paymentDate && (
                <HStack gap={2}>
                  <FiCheckCircle size={16} color="#10b981" />
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.500">Paid On</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </Text>
                  </Box>
                </HStack>
              )}

              <HStack gap={2}>
                <FiCreditCard size={16} color="#3b82f6" />
                <Box flex={1}>
                  <Text fontSize="xs" color="gray.500">Payment Method</Text>
                  <Text fontSize="sm" color="gray.600">
                    {payment.paymentMethod}
                  </Text>
                </Box>
              </HStack>
            </VStack>

            {/* Actions */}
            <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              {payment.status === 'paid' && onDownloadReceipt && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="green"
                  flex={1}
                  onClick={() => onDownloadReceipt(payment)}
                >
                  <FiDownload size={16} />
                  <Box ml={2}>Receipt</Box>
                </Button>
              )}
              {(payment.status === 'pending' || payment.status === 'overdue') && onPayNow && (
                <Button
                  size="sm"
                  colorPalette="blue"
                  flex={1}
                  onClick={() => onPayNow(payment)}
                >
                  <FiCreditCard size={16} />
                  <Box ml={2}>Pay Now</Box>
                </Button>
              )}
            </HStack>
          </VStack>
        </Card>
      ))}
    </VStack>
  );

  // Desktop Table View
  const DesktopView = () => (
    <Card p={0} overflow="hidden">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Box bg="blue.50" borderBottomWidth="1px" borderColor="blue.200" px={4} py={3}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="blue.900">
              {selectedIds.length} payment(s) selected
            </Text>
          </HStack>
        </Box>
      )}
      
      <Box overflowX="auto">
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader px={4} py={3} width="50px">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(details) => handleSelectAll(details.checked as boolean)}
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader>Transaction ID</Table.ColumnHeader>
              <Table.ColumnHeader>Order</Table.ColumnHeader>
              <Table.ColumnHeader>Vendor</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
              <Table.ColumnHeader>Due Date</Table.ColumnHeader>
              <Table.ColumnHeader>Paid On</Table.ColumnHeader>
              <Table.ColumnHeader>Payment Method</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {payments.map((payment) => (
              <Table.Row key={payment.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell px={4} py={3}>
                  <Checkbox
                    checked={selectedIds.includes(payment.id)}
                    onCheckedChange={(details) => handleSelectOne(payment.id, details.checked as boolean)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {payment.transactionId}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {payment.orderNumber}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {payment.vendor}
                    </Text>
                    <Text fontSize="xs" color="gray.500" lineClamp={1}>
                      {payment.description}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getStatusColor(payment.status)}
                    borderRadius="full"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                    fontSize="xs"
                  >
                    {getStatusLabel(payment.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                    ${payment.amount.toLocaleString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {payment.paymentMethod}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} justify="center">
                    {payment.status === 'paid' && onDownloadReceipt && (
                      <IconButton
                        aria-label="Download receipt"
                        size="sm"
                        variant="ghost"
                        colorPalette="green"
                        onClick={() => onDownloadReceipt(payment)}
                      >
                        <FiDownload size={16} />
                      </IconButton>
                    )}
                    {(payment.status === 'pending' || payment.status === 'overdue') && onPayNow && (
                      <Button
                        size="sm"
                        colorPalette="blue"
                        onClick={() => onPayNow(payment)}
                      >
                        <FiCreditCard size={14} />
                        <Box ml={1}>Pay</Box>
                      </Button>
                    )}
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Card>
  );

  return (
    <ResponsiveTable mobileView={<MobileView />}>
      <DesktopView />
    </ResponsiveTable>
  );
};

export default PaymentsTable;

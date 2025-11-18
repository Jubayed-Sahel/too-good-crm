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
import { FiEye, FiPackage, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { Card } from '../common';
import { ResponsiveTable } from '../common';
import { useState } from 'react';

export interface Order {
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

interface OrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
}

const OrdersTable = ({ orders, onView }: OrdersTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(orders.map(o => o.id));
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

  const isAllSelected = selectedIds.length === orders.length && orders.length > 0;

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (orders.length === 0) {
    return (
      <>
      </>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {orders.map((order) => (
        <Card key={order.id} p={4}>
          <VStack align="stretch" gap={3}>
            {/* Header */}
            <Flex justify="space-between" align="start">
              <HStack gap={3}>
                <Box
                  p={3}
                  bg="blue.100"
                  borderRadius="lg"
                  color="blue.600"
                >
                  <FiPackage size={24} />
                </Box>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontWeight="bold" fontSize="md" color="gray.900">
                    {order.orderNumber}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {order.vendor}
                  </Text>
                </VStack>
              </HStack>
              
              <Badge
                colorPalette={getStatusColor(order.status)}
                size="sm"
                textTransform="capitalize"
              >
                {getStatusLabel(order.status)}
              </Badge>
            </Flex>

            {/* Service */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" color="gray.900" mb={1}>
                {order.service}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {order.description}
              </Text>
            </Box>

            {/* Info Grid */}
            <VStack align="stretch" gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              <HStack gap={2}>
                <FiDollarSign size={16} color="#3b82f6" />
                <Box flex={1}>
                  <Text fontSize="xs" color="gray.500">Amount</Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.900">
                    ${order.amount.toLocaleString()}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={2}>
                <FiCalendar size={16} color="#3b82f6" />
                <Box flex={1}>
                  <Text fontSize="xs" color="gray.500">Order Date</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </Text>
                </Box>
              </HStack>

              {order.deliveryDate && (
                <HStack gap={2}>
                  <FiCalendar size={16} color="#3b82f6" />
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.500">Delivery Date</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </Text>
                  </Box>
                </HStack>
              )}
            </VStack>

            {/* Actions */}
            <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              <Button
                size="sm"
                variant="outline"
                colorPalette="blue"
                flex={1}
                onClick={() => onView(order)}
              >
                <FiEye size={16} />
                <Box ml={2}>View Details</Box>
              </Button>
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
              {selectedIds.length} order(s) selected
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
              <Table.ColumnHeader>Order Number</Table.ColumnHeader>
              <Table.ColumnHeader>Vendor</Table.ColumnHeader>
              <Table.ColumnHeader>Service</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
              <Table.ColumnHeader>Order Date</Table.ColumnHeader>
              <Table.ColumnHeader>Delivery Date</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell px={4} py={3}>
                  <Checkbox
                    checked={selectedIds.includes(order.id)}
                    onCheckedChange={(details) => handleSelectOne(order.id, details.checked as boolean)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {order.orderNumber}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {order.vendor}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {order.service}
                    </Text>
                    <Text fontSize="xs" color="gray.500" lineClamp={1}>
                      {order.description}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getStatusColor(order.status)}
                    borderRadius="full"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                    fontSize="xs"
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                    ${order.amount.toLocaleString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} justify="center">
                    <IconButton
                      aria-label="View order"
                      size="sm"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => onView(order)}
                    >
                      <FiEye size={16} />
                    </IconButton>
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

export default OrdersTable;

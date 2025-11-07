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
import { FiEdit, FiTrash2, FiEye, FiMail, FiPhone } from 'react-icons/fi';
import { Card } from '../common';
import { ResponsiveTable } from '../common';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/utils';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  totalValue: number;
  lastContact: string;
  avatar?: string;
}

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onBulkDelete?: (customerIds: string[]) => void;
  onBulkExport?: (customerIds: string[]) => void;
}

const CustomerTable = ({ customers, onEdit, onDelete, onView, onBulkDelete, onBulkExport }: CustomerTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(customers.map(c => c.id));
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

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    onBulkExport?.(selectedIds);
  };

  const isAllSelected = selectedIds.length === customers.length && customers.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  if (customers.length === 0) {
    return (
      <Card p={6}>
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">No customers found</Text>
          <Text color="gray.600">Try adjusting your filters or add a new customer.</Text>
        </VStack>
      </Card>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {customers.map((customer) => (
        <Card key={customer.id} p={4}>
          <VStack align="stretch" gap={3}>
            {/* Header */}
            <Flex justify="space-between" align="start">
              <VStack align="start" gap={1} flex={1}>
                <Text fontWeight="bold" fontSize="md" color="gray.900">
                  {customer.name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {customer.company}
                </Text>
              </VStack>
              
              <Badge
                colorPalette={getStatusColor(customer.status)}
                borderRadius="full"
                px={3}
                py={1}
                textTransform="capitalize"
                fontSize="xs"
              >
                {customer.status}
              </Badge>
            </Flex>

            {/* Contact Info */}
            <VStack align="stretch" gap={2}>
              <HStack gap={2}>
                <FiMail size={14} color="#718096" />
                <Text fontSize="sm" color="gray.600">
                  {customer.email}
                </Text>
              </HStack>
              {customer.phone && (
                <HStack gap={2}>
                  <FiPhone size={14} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {customer.phone}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Stats */}
            <Flex justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="gray.500">Total Value</Text>
                <Text fontSize="md" fontWeight="bold" color="gray.900">
                  {formatCurrency(customer.totalValue)}
                </Text>
              </VStack>
              <VStack align="end" gap={0}>
                <Text fontSize="xs" color="gray.500">Last Contact</Text>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(customer.lastContact)}
                </Text>
              </VStack>
            </Flex>

            {/* Actions */}
            <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              <Button
                size="sm"
                variant="outline"
                colorPalette="purple"
                flex={1}
                onClick={() => onView(customer)}
              >
                <FiEye size={16} />
                <Box ml={2}>View</Box>
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="blue"
                flex={1}
                onClick={() => onEdit(customer)}
              >
                <FiEdit size={16} />
                <Box ml={2}>Edit</Box>
              </Button>
              <IconButton
                aria-label="Delete"
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={() => onDelete(customer)}
              >
                <FiTrash2 size={16} />
              </IconButton>
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
        <Box bg="purple.50" borderBottomWidth="1px" borderColor="purple.200" px={4} py={3}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="purple.900">
              {selectedIds.length} customer(s) selected
            </Text>
            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                colorPalette="purple"
                onClick={handleBulkExport}
              >
                Export Selected
              </Button>
              <Button
                size="sm"
                variant="solid"
                colorPalette="red"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </HStack>
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
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Company</Table.ColumnHeader>
              <Table.ColumnHeader>Contact</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Total Value</Table.ColumnHeader>
              <Table.ColumnHeader>Last Contact</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {customers.map((customer) => (
              <Table.Row key={customer.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell px={4} py={3}>
                  <Checkbox
                    checked={selectedIds.includes(customer.id)}
                    onCheckedChange={(details) => handleSelectOne(customer.id, details.checked as boolean)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {customer.name}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {customer.company}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <HStack gap={1}>
                      <FiMail size={12} color="#718096" />
                      <Text fontSize="sm" color="gray.600">
                        {customer.email}
                      </Text>
                    </HStack>
                    {customer.phone && (
                      <HStack gap={1}>
                        <FiPhone size={12} color="#718096" />
                        <Text fontSize="xs" color="gray.500">
                          {customer.phone}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getStatusColor(customer.status)}
                    borderRadius="full"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                    fontSize="xs"
                  >
                    {customer.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                    {formatCurrency(customer.totalValue)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(customer.lastContact)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} justify="center">
                    <IconButton
                      aria-label="View customer"
                      size="sm"
                      variant="ghost"
                      colorPalette="purple"
                      onClick={() => onView(customer)}
                    >
                      <FiEye size={16} />
                    </IconButton>
                    <IconButton
                      aria-label="Edit customer"
                      size="sm"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => onEdit(customer)}
                    >
                      <FiEdit size={16} />
                    </IconButton>
                    <IconButton
                      aria-label="Delete customer"
                      size="sm"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => onDelete(customer)}
                    >
                      <FiTrash2 size={16} />
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

export default CustomerTable;

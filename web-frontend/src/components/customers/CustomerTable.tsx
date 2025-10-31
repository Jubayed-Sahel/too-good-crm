import {
  Box,
  Badge,
  HStack,
  Text,
  IconButton,
  Flex,
  Grid,
  VStack,
  Heading,
  Stack,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiEye, FiMail, FiPhone } from 'react-icons/fi';
import { Card } from '../common';

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
}

const CustomerTable = ({ customers, onEdit, onDelete, onView }: CustomerTableProps) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Stack gap={3}>
      {/* Table Header - Desktop Only */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        bg="gray.50"
        borderRadius="lg"
        px={6}
        py={3}
      >
        <Grid
          templateColumns="2fr 1.5fr 2fr 1fr 1fr 1.5fr 80px"
          gap={4}
          alignItems="center"
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Customer
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Company
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Contact
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Status
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" textAlign="right">
            Total Value
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Last Contact
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Actions
          </Text>
        </Grid>
      </Box>

      {/* Customer Cards/Rows */}
      {customers.map((customer) => (
        <Card
          key={customer.id}
          variant="elevated"
          _hover={{
            shadow: 'md',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          }}
        >
          {/* Desktop Layout */}
          <Box display={{ base: 'none', lg: 'block' }}>
            <Grid
              templateColumns="2fr 1.5fr 2fr 1fr 1fr 1.5fr 80px"
              gap={4}
              alignItems="center"
            >
              {/* Customer Name */}
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                  {customer.name}
                </Text>
              </Box>

              {/* Company */}
              <Text fontSize="sm" color="gray.600">
                {customer.company}
              </Text>

              {/* Contact Info */}
              <VStack align="start" gap={0.5}>
                <HStack gap={1.5}>
                  <FiMail size={12} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {customer.email}
                  </Text>
                </HStack>
                <HStack gap={1.5}>
                  <FiPhone size={12} color="#718096" />
                  <Text fontSize="xs" color="gray.500">
                    {customer.phone}
                  </Text>
                </HStack>
              </VStack>

              {/* Status */}
              <Box>
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
              </Box>

              {/* Total Value */}
              <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                {formatCurrency(customer.totalValue)}
              </Text>

              {/* Last Contact */}
              <Text fontSize="sm" color="gray.600">
                {formatDate(customer.lastContact)}
              </Text>

              {/* Actions */}
              <HStack gap={1} justifyContent="flex-end">
                <IconButton
                  aria-label="View customer"
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(customer)}
                >
                  <FiEye />
                </IconButton>
                <IconButton
                  aria-label="Edit customer"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(customer)}
                >
                  <FiEdit />
                </IconButton>
                <IconButton
                  aria-label="Delete customer"
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => onDelete(customer)}
                >
                  <FiTrash2 />
                </IconButton>
              </HStack>
            </Grid>
          </Box>

          {/* Mobile/Tablet Layout */}
          <Box display={{ base: 'block', lg: 'none' }}>
            <VStack align="stretch" gap={3}>
              {/* Header Row */}
              <Flex justifyContent="space-between" alignItems="start">
                <Box flex="1">
                  <Heading size="sm" mb={1}>
                    {customer.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {customer.company}
                  </Text>
                </Box>
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
              <VStack align="stretch" gap={1}>
                <HStack gap={2}>
                  <FiMail size={14} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {customer.email}
                  </Text>
                </HStack>
                <HStack gap={2}>
                  <FiPhone size={14} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {customer.phone}
                  </Text>
                </HStack>
              </VStack>

              {/* Stats Row */}
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    Total Value
                  </Text>
                  <Text fontWeight="semibold" fontSize="md" color="gray.900">
                    {formatCurrency(customer.totalValue)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    Last Contact
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(customer.lastContact)}
                  </Text>
                </Box>
              </Grid>

              {/* Actions Row */}
              <Flex gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
                <IconButton
                  aria-label="View customer"
                  size="sm"
                  variant="outline"
                  flex="1"
                  onClick={() => onView(customer)}
                >
                  <FiEye />
                  <Text ml={2} fontSize="sm">View</Text>
                </IconButton>
                <IconButton
                  aria-label="Edit customer"
                  size="sm"
                  variant="outline"
                  flex="1"
                  onClick={() => onEdit(customer)}
                >
                  <FiEdit />
                  <Text ml={2} fontSize="sm">Edit</Text>
                </IconButton>
                <IconButton
                  aria-label="Delete customer"
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => onDelete(customer)}
                >
                  <FiTrash2 />
                </IconButton>
              </Flex>
            </VStack>
          </Box>
        </Card>
      ))}
    </Stack>
  );
};

export default CustomerTable;

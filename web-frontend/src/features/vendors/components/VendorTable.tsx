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
import { Checkbox } from '@/components/ui/checkbox';
import { FiExternalLink, FiEye, FiMail, FiPhone, FiStar, FiPackage, FiVideo } from 'react-icons/fi';
import { Card } from '@/components/common';
import { ResponsiveTable } from '@/components/common';
import { useState } from 'react';

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  status: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  lastOrder: string;
  user_id?: number | null; // For Jitsi video calls
}

interface VendorTableProps {
  vendors: Vendor[];
  onContact: (vendor: Vendor) => void;
  onCall?: (vendor: Vendor) => void;
  onViewOrders: (vendorName: string) => void;
  onView?: (vendor: Vendor) => void;
}

const VendorTable = ({ vendors, onContact, onCall, onViewOrders, onView }: VendorTableProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(vendors.map(v => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = selectedIds.length === vendors.length && vendors.length > 0;

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'active' ? 'green' : 'gray';
  };

  if (vendors.length === 0) {
    return (
      <>
      </>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {vendors.map((vendor) => (
        <Card key={vendor.id} p={4}>
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
                    {vendor.name}
                  </Text>
                  <Badge
                    colorPalette="blue"
                    size="sm"
                    textTransform="capitalize"
                  >
                    {vendor.category}
                  </Badge>
                </VStack>
              </HStack>
              
              <Badge
                colorPalette={getStatusColor(vendor.status)}
                size="sm"
                textTransform="capitalize"
              >
                {vendor.status}
              </Badge>
            </Flex>

            {/* Description */}
            <Text fontSize="sm" color="gray.600">
              {vendor.description}
            </Text>

            {/* Contact Info */}
            <VStack align="stretch" gap={2}>
              <HStack gap={2} p={2} bg="blue.50" borderRadius="md">
                <FiMail size={14} color="#3b82f6" />
                <Text fontSize="sm" color="gray.700">
                  {vendor.email}
                </Text>
              </HStack>
              <HStack gap={2} p={2} bg="blue.50" borderRadius="md">
                <FiPhone size={14} color="#3b82f6" />
                <Text fontSize="sm" color="gray.700">
                  {vendor.phone}
                </Text>
              </HStack>
            </VStack>

            {/* Stats */}
            <Flex justify="space-between" gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100" flexWrap="wrap">
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="xs" color="gray.500">Orders</Text>
                <Text fontSize="md" fontWeight="bold" color="gray.900">
                  {vendor.totalOrders}
                </Text>
              </VStack>
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="xs" color="gray.500">Total Spent</Text>
                <Text fontSize="md" fontWeight="bold" color="blue.600">
                  ${vendor.totalSpent.toLocaleString()}
                </Text>
              </VStack>
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="xs" color="gray.500">Rating</Text>
                <HStack gap={1}>
                  <FiStar size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text fontSize="md" fontWeight="bold" color="orange.600">
                    {vendor.rating}
                  </Text>
                </HStack>
              </VStack>
            </Flex>

            {/* Actions */}
            <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              <Button
                size="sm"
                variant="solid"
                colorPalette="blue"
                flex={1}
                onClick={() => onViewOrders(vendor.name)}
              >
                <FiPackage size={16} />
                <Box ml={2}>View Orders</Box>
              </Button>
              {vendor.user_id && onCall && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="green"
                  onClick={() => onCall(vendor)}
                  title="Audio call vendor via Jitsi"
                >
                  <FiVideo size={16} />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                colorPalette="purple"
                flex={1}
                onClick={() => onContact(vendor)}
              >
                <FiExternalLink size={16} />
                <Box ml={2}>Contact</Box>
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
              {selectedIds.length} vendor(s) selected
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
              <Table.ColumnHeader>Vendor</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader>Contact</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Orders</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Total Spent</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Rating</Table.ColumnHeader>
              <Table.ColumnHeader>Last Order</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vendors.map((vendor) => (
              <Table.Row key={vendor.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell px={4} py={3}>
                  <Checkbox
                    checked={selectedIds.includes(vendor.id)}
                    onCheckedChange={(details) => handleSelectOne(vendor.id, details.checked as boolean)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {vendor.name}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette="blue"
                    size="sm"
                    textTransform="capitalize"
                  >
                    {vendor.category}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <HStack gap={1}>
                      <FiMail size={14} color="#3b82f6" />
                      <Text fontSize="sm" color="gray.600">
                        {vendor.email}
                      </Text>
                    </HStack>
                    <HStack gap={1}>
                      <FiPhone size={14} color="#3b82f6" />
                      <Text fontSize="xs" color="gray.500">
                        {vendor.phone}
                      </Text>
                    </HStack>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getStatusColor(vendor.status)}
                    borderRadius="full"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                    fontSize="xs"
                  >
                    {vendor.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                    {vendor.totalOrders}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="blue.600" textAlign="right">
                    ${vendor.totalSpent.toLocaleString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} justify="center">
                    <FiStar size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text fontSize="sm" fontWeight="bold" color="orange.600">
                      {vendor.rating}
                    </Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {vendor.lastOrder}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} justify="center">
                    {onView && (
                      <IconButton
                        aria-label="View vendor"
                        size="sm"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={() => onView(vendor)}
                      >
                        <FiEye size={16} />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="View orders"
                      size="sm"
                      variant="ghost"
                      colorPalette="purple"
                      onClick={() => onViewOrders(vendor.name)}
                    >
                      <FiPackage size={16} />
                    </IconButton>
                    {vendor.user_id && onCall && (
                      <IconButton
                        aria-label="Audio call vendor via Jitsi"
                        size="sm"
                        variant="ghost"
                        colorPalette="green"
                        onClick={() => onCall(vendor)}
                      >
                        <FiVideo size={16} />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="Contact vendor"
                      size="sm"
                      variant="ghost"
                      colorPalette="orange"
                      onClick={() => onContact(vendor)}
                    >
                      <FiExternalLink size={16} />
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

export default VendorTable;

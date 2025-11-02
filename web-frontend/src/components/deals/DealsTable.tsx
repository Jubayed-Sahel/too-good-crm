import {
  Table,
  Badge,
  HStack,
  VStack,
  Text,
  IconButton,
  Box,
  Button,
} from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { FiEdit, FiTrash2, FiEye, FiUser } from 'react-icons/fi';
import { Card } from '../common';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/utils';

// Simple progress bar component
const SimpleProgress = ({ value, colorPalette }: { value: number; colorPalette: string }) => {
  const colors: Record<string, string> = {
    green: '#48BB78',
    orange: '#ED8936',
    red: '#F56565',
  };
  
  return (
    <Box w="full">
      <Box
        h="6px"
        bg="gray.100"
        borderRadius="full"
        overflow="hidden"
        position="relative"
      >
        <Box
          h="100%"
          w={`${value}%`}
          bg={colors[colorPalette] || colors.green}
          borderRadius="full"
          transition="width 0.3s"
        />
      </Box>
    </Box>
  );
};

export interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdDate: string;
}

interface DealsTableProps {
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onBulkDelete?: (dealIds: string[]) => void;
  onBulkExport?: (dealIds: string[]) => void;
}

const DealsTable = ({ deals, onEdit, onDelete, onView, onBulkDelete, onBulkExport }: DealsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(deals.map(d => d.id));
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
    if (confirm(`Are you sure you want to delete ${selectedIds.length} deal(s)?`)) {
      onBulkDelete?.(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    onBulkExport?.(selectedIds);
  };

  const isAllSelected = selectedIds.length === deals.length && deals.length > 0;
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'gray';
      case 'qualified':
        return 'blue';
      case 'proposal':
        return 'purple';
      case 'negotiation':
        return 'orange';
      case 'closed-won':
        return 'green';
      case 'closed-lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStageName = (stage: string) => {
    return stage
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (deals.length === 0) {
    return (
      <Card p={6}>
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">No deals found</Text>
          <Text color="gray.600">Try adjusting your filters or add a new deal.</Text>
        </VStack>
      </Card>
    );
  }

  return (
    <Card p={0} overflow="hidden">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Box bg="purple.50" borderBottomWidth="1px" borderColor="purple.200" px={4} py={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium" color="purple.900">
              {selectedIds.length} deal(s) selected
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
      
      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row bg="gray.50">
            <Table.ColumnHeader px={4} py={3} width="50px">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(details) => handleSelectAll(details.checked as boolean)}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader>Deal Title</Table.ColumnHeader>
            <Table.ColumnHeader>Customer</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Value</Table.ColumnHeader>
            <Table.ColumnHeader>Stage</Table.ColumnHeader>
            <Table.ColumnHeader>Probability</Table.ColumnHeader>
            <Table.ColumnHeader>Expected Close</Table.ColumnHeader>
            <Table.ColumnHeader>Owner</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {deals.map((deal) => (
            <Table.Row key={deal.id} _hover={{ bg: 'gray.50' }}>
              <Table.Cell px={4} py={3}>
                <Checkbox
                  checked={selectedIds.includes(deal.id)}
                  onCheckedChange={(details) => handleSelectOne(deal.id, details.checked as boolean)}
                />
              </Table.Cell>
              <Table.Cell>
                <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                  {deal.title}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <HStack gap={1.5}>
                  <FiUser size={12} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {deal.customer}
                  </Text>
                </HStack>
              </Table.Cell>
              <Table.Cell>
                <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                  {formatCurrency(deal.value)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={getStageColor(deal.stage)}
                  borderRadius="full"
                  px={3}
                  py={1}
                  textTransform="capitalize"
                  fontSize="xs"
                >
                  {getStageName(deal.stage)}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <VStack gap={1} align="stretch">
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    {deal.probability}%
                  </Text>
                  <SimpleProgress
                    value={deal.probability}
                    colorPalette={deal.probability >= 70 ? 'green' : deal.probability >= 40 ? 'orange' : 'red'}
                  />
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(deal.expectedCloseDate)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  {deal.owner}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <HStack gap={1} justify="center">
                  <IconButton
                    aria-label="View deal"
                    size="sm"
                    variant="ghost"
                    colorPalette="purple"
                    onClick={() => onView(deal)}
                  >
                    <FiEye size={16} />
                  </IconButton>
                  <IconButton
                    aria-label="Edit deal"
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    onClick={() => onEdit(deal)}
                  >
                    <FiEdit size={16} />
                  </IconButton>
                  <IconButton
                    aria-label="Delete deal"
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => onDelete(deal)}
                  >
                    <FiTrash2 size={16} />
                  </IconButton>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
};

export default DealsTable;

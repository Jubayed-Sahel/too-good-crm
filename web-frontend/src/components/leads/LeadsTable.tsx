import { 
  Table, 
  HStack, 
  VStack,
  Text, 
  IconButton,
  Badge,
  Button,
  Box,
} from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../common';
import type { Lead } from '../../types';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadScoreIndicator } from './LeadScoreIndicator';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils';
import { useState } from 'react';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onView?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onConvert?: (lead: Lead) => void;
  onBulkDelete?: (leadIds: string[]) => void;
  onBulkExport?: (leadIds: string[]) => void;
}

const priorityColors = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const LeadsTable = ({ 
  leads, 
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onConvert,
  onBulkDelete,
  onBulkExport,
}: LeadsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leads.map(l => l.id));
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
    if (confirm(`Are you sure you want to delete ${selectedIds.length} lead(s)?`)) {
      onBulkDelete?.(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    onBulkExport?.(selectedIds);
  };

  const isAllSelected = selectedIds.length === leads.length && leads.length > 0;
  if (isLoading) {
    return (
      <Card p={6}>
        <Text color="gray.600">Loading leads...</Text>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card p={6}>
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">No leads found</Text>
          <Text color="gray.600">Try adjusting your filters or create a new lead.</Text>
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
              {selectedIds.length} lead(s) selected
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
            <Table.ColumnHeader>Lead</Table.ColumnHeader>
            <Table.ColumnHeader>Company</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Priority</Table.ColumnHeader>
            <Table.ColumnHeader>Score</Table.ColumnHeader>
            <Table.ColumnHeader>Source</Table.ColumnHeader>
            <Table.ColumnHeader>Est. Value</Table.ColumnHeader>
            <Table.ColumnHeader>Created</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {leads.map((lead) => (
            <Table.Row key={lead.id} _hover={{ bg: 'gray.50' }}>
              <Table.Cell px={4} py={3}>
                <Checkbox
                  checked={selectedIds.includes(lead.id)}
                  onCheckedChange={(details) => handleSelectOne(lead.id, details.checked as boolean)}
                />
              </Table.Cell>
              <Table.Cell>
                <VStack align="flex-start" gap={0}>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {lead.firstName} {lead.lastName}
                  </Text>
                  {lead.email && (
                    <Text fontSize="xs" color="gray.600">{lead.email}</Text>
                  )}
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <VStack align="flex-start" gap={0}>
                  <Text fontWeight="medium" fontSize="sm" color="gray.700">{lead.company}</Text>
                  {lead.title && (
                    <Text fontSize="xs" color="gray.600">{lead.title}</Text>
                  )}
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <LeadStatusBadge status={lead.status} size="sm" />
              </Table.Cell>
              <Table.Cell>
                <Badge 
                  colorPalette={priorityColors[lead.priority]}
                  size="sm"
                  borderRadius="full"
                  px={3}
                  py={1}
                  textTransform="capitalize"
                  fontSize="xs"
                >
                  {lead.priority}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <LeadScoreIndicator score={lead.score} showLabel={false} size="sm" />
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" textTransform="capitalize" color="gray.600">
                  {lead.source.replace('_', ' ')}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                  {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '-'}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(lead.createdAt)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <HStack gap={1} justify="center">
                  {onView && (
                    <IconButton
                      aria-label="View lead details"
                      size="sm"
                      variant="ghost"
                      colorPalette="purple"
                      onClick={() => onView(lead)}
                    >
                      <FiEye size={16} />
                    </IconButton>
                  )}
                  {onEdit && (
                    <IconButton
                      aria-label="Edit lead"
                      size="sm"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => onEdit(lead)}
                    >
                      <FiEdit size={16} />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      aria-label="Delete lead"
                      size="sm"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => onDelete(lead.id)}
                    >
                      <FiTrash2 size={16} />
                    </IconButton>
                  )}
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
};

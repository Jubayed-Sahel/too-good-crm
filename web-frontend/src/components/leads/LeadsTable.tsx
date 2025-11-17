import { 
  Table, 
  HStack, 
  VStack,
  Text, 
  IconButton,
  Button,
  Box,
  Flex,
} from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { Card, ResponsiveTable } from '../common';
import type { Lead } from '../../types';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadScoreIndicator } from './LeadScoreIndicator';
import { FiEdit, FiTrash2, FiEye, FiMail, FiBriefcase } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils';
import { useState } from 'react';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onView?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onConvert?: (lead: Lead) => void;
  onBulkDelete?: (leadIds: string[]) => void;
  onBulkExport?: (leadIds: string[]) => void;
  onBulkConvertToDeal?: (leadIds: string[]) => void;
}

export const LeadsTable = ({ 
  leads, 
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onConvert,
  onBulkDelete,
  onBulkExport,
  onBulkConvertToDeal,
}: LeadsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leads.map(l => l.id.toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const idStr = id.toString();
    if (checked) {
      setSelectedIds([...selectedIds, idStr]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== idStr));
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

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {leads.map((lead) => (
        <Card key={lead.id} p={4}>
          <VStack align="stretch" gap={3}>
            {/* Header */}
            <Flex justify="space-between" align="start">
              <VStack align="start" gap={1} flex={1}>
                <Text fontWeight="bold" fontSize="md" color="gray.900">
                  {lead.name}
                </Text>
                <HStack gap={1.5}>
                  <FiBriefcase size={14} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {lead.company || 'No company'}
                  </Text>
                </HStack>
                {lead.job_title && (
                  <Text fontSize="xs" color="gray.500">
                    {lead.job_title}
                  </Text>
                )}
              </VStack>
              
              <LeadStatusBadge status={lead.qualification_status} size="sm" />
            </Flex>

            {/* Email */}
            {lead.email && (
              <HStack gap={1.5}>
                <FiMail size={14} color="#718096" />
                <Text fontSize="sm" color="gray.600">
                  {lead.email}
                </Text>
              </HStack>
            )}

            {/* Metrics */}
            <Flex justify="space-between" align="center" pt={2} borderTopWidth="1px" borderColor="gray.100">
              <VStack align="start" gap={1}>
                <Text fontSize="xs" color="gray.500">Score</Text>
                <LeadScoreIndicator score={lead.lead_score} showLabel={true} size="sm" />
              </VStack>

              <VStack align="end" gap={1}>
                <Text fontSize="xs" color="gray.500">Est. Value</Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  {lead.estimated_value ? formatCurrency(lead.estimated_value) : '-'}
                </Text>
              </VStack>
            </Flex>

            {/* Details */}
            <Flex justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="gray.500">Source</Text>
                <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                  {lead.source.replace(/_/g, ' ')}
                </Text>
              </VStack>
              <VStack align="end" gap={0}>
                <Text fontSize="xs" color="gray.500">Created</Text>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(lead.created_at)}
                </Text>
              </VStack>
            </Flex>

            {/* Actions */}
            <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="purple"
                  flex={1}
                  onClick={() => onView(lead)}
                >
                  <FiEye size={16} />
                  <Box ml={2}>View</Box>
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="blue"
                  flex={1}
                  onClick={() => onEdit(lead)}
                >
                  <FiEdit size={16} />
                  <Box ml={2}>Edit</Box>
                </Button>
              )}
              {onDelete && (
                <IconButton
                  aria-label="Delete"
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => onDelete(lead)}
                >
                  <FiTrash2 size={16} />
                </IconButton>
              )}
            </HStack>

            {/* Convert Button */}
            {onConvert && (
              <Button
                size="sm"
                variant="solid"
                colorPalette="green"
                width="full"
                onClick={() => onConvert(lead)}
              >
                Convert to Customer
              </Button>
            )}
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
              {selectedIds.length} lead(s) selected
            </Text>
            <HStack gap={2}>
              {onBulkConvertToDeal && (
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette="green"
                  onClick={() => onBulkConvertToDeal(selectedIds)}
                >
                  Convert to Deal
                </Button>
              )}
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
              <Table.ColumnHeader>Lead</Table.ColumnHeader>
              <Table.ColumnHeader>Company</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
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
                    checked={selectedIds.includes(lead.id.toString())}
                    onCheckedChange={(details) => handleSelectOne(lead.id, details.checked as boolean)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                      {lead.name}
                    </Text>
                    {lead.email && (
                      <Text fontSize="xs" color="gray.600">{lead.email}</Text>
                    )}
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <Text fontWeight="medium" fontSize="sm" color="gray.700">{lead.company || '-'}</Text>
                    {lead.job_title && (
                      <Text fontSize="xs" color="gray.600">{lead.job_title}</Text>
                    )}
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <LeadStatusBadge status={lead.qualification_status} size="sm" />
                </Table.Cell>
                <Table.Cell>
                  <LeadScoreIndicator score={lead.lead_score} showLabel={false} size="sm" />
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" textTransform="capitalize" color="gray.600">
                    {lead.source.replace(/_/g, ' ')}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {lead.estimated_value ? formatCurrency(lead.estimated_value) : '-'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(lead.created_at)}
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
                        onClick={() => onDelete(lead)}
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
      </Box>
    </Card>
  );

  return (
    <ResponsiveTable mobileView={<MobileView />}>
      <DesktopView />
    </ResponsiveTable>
  );
};

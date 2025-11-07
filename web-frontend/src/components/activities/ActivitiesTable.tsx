import {
  Table,
  HStack,
  VStack,
  Text,
  IconButton,
  Badge,
  Box,
  Flex,
  Button,
} from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { Card, ResponsiveTable } from '../common';
import {
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiCalendar,
  FiFileText,
  FiCheckSquare,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiUser,
} from 'react-icons/fi';
import { useState } from 'react';
import type { Activity, ActivityType, ActivityStatus } from '@/types/activity.types';

interface ActivitiesTableProps {
  activities: Activity[];
  isLoading?: boolean;
  onView?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
  onMarkComplete?: (activityId: number) => void;
  onBulkDelete?: (activityIds: number[]) => void;
  onBulkExport?: (activityIds: number[]) => void;
  onBulkComplete?: (activityIds: number[]) => void;
}

const getActivityIcon = (type: ActivityType) => {
  const icons = {
    call: FiPhone,
    email: FiMail,
    telegram: FiMessageSquare,
    meeting: FiCalendar,
    note: FiFileText,
    task: FiCheckSquare,
  };
  return icons[type] || FiFileText;
};

const getActivityColor = (type: ActivityType) => {
  const colors = {
    call: 'blue',
    email: 'purple',
    telegram: 'cyan',
    meeting: 'orange',
    note: 'yellow',
    task: 'green',
  };
  return colors[type] || 'gray';
};

const getStatusColor = (status: ActivityStatus) => {
  const colors: Record<ActivityStatus, string> = {
    completed: 'green',
    in_progress: 'orange',
    scheduled: 'blue',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ActivitiesTable = ({
  activities,
  isLoading = false,
  onView,
  onDelete,
  onMarkComplete,
  onBulkDelete,
  onBulkExport,
  onBulkComplete,
}: ActivitiesTableProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(activities.map(a => a.id));
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

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkExportClick = () => {
    if (selectedIds.length === 0) return;
    onBulkExport?.(selectedIds);
  };

  const handleBulkCompleteClick = () => {
    if (selectedIds.length === 0) return;
    onBulkComplete?.(selectedIds);
    setSelectedIds([]);
  };

  const isAllSelected = selectedIds.length === activities.length && activities.length > 0;

  if (isLoading) {
    return (
      <Card>
        <Box textAlign="center" py={12}>
          <Text color="gray.500">Loading activities...</Text>
        </Box>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
            No activities found
          </Text>
          <Text fontSize="sm" color="gray.500">
            Create your first activity to get started
          </Text>
        </Box>
      </Card>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.activity_type);
        const typeColor = getActivityColor(activity.activity_type);

        return (
          <Card key={activity.id} p={4}>
            <VStack align="stretch" gap={3}>
              {/* Header with Icon and Title */}
              <Flex justify="space-between" align="start">
                <HStack gap={3} flex={1}>
                  <Box
                    p={2.5}
                    bg={`${typeColor}.50`}
                    borderRadius="md"
                    color={`${typeColor}.600`}
                    flexShrink={0}
                  >
                    <Icon size={20} />
                  </Box>
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontWeight="bold" fontSize="md" color="gray.900" lineClamp={1}>
                      {activity.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600" lineClamp={2}>
                      {activity.description}
                    </Text>
                  </VStack>
                </HStack>
                
                <Badge
                  colorPalette={getStatusColor(activity.status)}
                  size="sm"
                  variant="subtle"
                  textTransform="capitalize"
                  borderRadius="full"
                  px={3}
                  py={1}
                  flexShrink={0}
                >
                  {activity.status}
                </Badge>
              </Flex>

              {/* Customer */}
              <HStack gap={1.5} pt={2} borderTopWidth="1px" borderColor="gray.100">
                <FiUser size={14} color="#718096" />
                <Text fontSize="sm" color="gray.700" fontWeight="medium">
                  {activity.customer_name}
                </Text>
              </HStack>

              {/* Date Information */}
              <Flex justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="gray.500">Created</Text>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(activity.created_at)}
                  </Text>
                </VStack>
                {activity.scheduled_at && activity.status === 'scheduled' && (
                  <VStack align="end" gap={0}>
                    <Text fontSize="xs" color="gray.500">Due Date</Text>
                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                      {formatDate(activity.scheduled_at)}
                    </Text>
                  </VStack>
                )}
              </Flex>

              {/* Created By */}
              <Flex justify="space-between" align="center" pt={2} borderTopWidth="1px" borderColor="gray.100">
                <Text fontSize="xs" color="gray.500">Created by: <Text as="span" color="gray.600" fontWeight="medium">User #{activity.created_by}</Text></Text>
              </Flex>

              {/* Actions */}
              <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
                {onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    flex={1}
                    onClick={() => onView(activity)}
                  >
                    <FiEye size={16} />
                    <Box ml={2}>View</Box>
                  </Button>
                )}
                {onMarkComplete && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="green"
                    flex={1}
                    onClick={() => onMarkComplete(activity.id)}
                    disabled={activity.status === 'completed'}
                    opacity={activity.status === 'completed' ? 0.5 : 1}
                  >
                    <FiCheckCircle size={16} />
                    <Box ml={2}>{activity.status === 'completed' ? 'Completed' : 'Complete'}</Box>
                  </Button>
                )}
                {onDelete && (
                  <IconButton
                    aria-label="Delete"
                    size="sm"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => onDelete(activity)}
                  >
                    <FiTrash2 size={16} />
                  </IconButton>
                )}
              </HStack>
            </VStack>
          </Card>
        );
      })}
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
              {selectedIds.length} activity(ies) selected
            </Text>
            <HStack gap={2}>
              {onBulkComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="green"
                  onClick={handleBulkCompleteClick}
                >
                  Mark as Complete
                </Button>
              )}
              {onBulkExport && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="purple"
                  onClick={handleBulkExportClick}
                >
                  Export Selected
                </Button>
              )}
              {onBulkDelete && (
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette="red"
                  onClick={handleBulkDeleteClick}
                >
                  Delete Selected
                </Button>
              )}
            </HStack>
          </HStack>
        </Box>
      )}

      <Box overflowX="auto">
        <Table.Root size="md">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader px={4} py={3} width="50px">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(details) => handleSelectAll(details.checked as boolean)}
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader>Activity</Table.ColumnHeader>
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Date</Table.ColumnHeader>
              <Table.ColumnHeader>Created By</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              const typeColor = getActivityColor(activity.activity_type);
              const isSelected = selectedIds.includes(activity.id);

              return (
                <Table.Row 
                  key={activity.id} 
                  _hover={{ bg: 'gray.50' }}
                  bg={isSelected ? 'purple.50' : 'transparent'}
                >
                  <Table.Cell px={4}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(details) => handleSelectOne(activity.id, details.checked as boolean)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={3}>
                      <Box
                        p={2}
                        bg={`${typeColor}.50`}
                        borderRadius="md"
                        color={`${typeColor}.600`}
                      >
                        <Icon size={18} />
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                          {activity.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600" lineClamp={1}>
                          {activity.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                      {activity.customer_name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={getStatusColor(activity.status)}
                      size="sm"
                      variant="subtle"
                      textTransform="capitalize"
                    >
                      {activity.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" color="gray.700">
                        {formatDate(activity.created_at)}
                      </Text>
                      {activity.scheduled_at && activity.status === 'scheduled' && (
                        <Text fontSize="xs" color="blue.600" fontWeight="medium">
                          Due: {formatDate(activity.scheduled_at)}
                        </Text>
                      )}
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="gray.600">
                      User #{activity.created_by}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={1} justify="center">
                      {onView && (
                        <IconButton
                          aria-label="View activity"
                          size="sm"
                          variant="ghost"
                          colorPalette="purple"
                          onClick={() => onView(activity)}
                        >
                          <FiEye size={16} />
                        </IconButton>
                      )}
                      {onMarkComplete && (
                        <IconButton
                          aria-label="Mark as complete"
                          size="sm"
                          variant="ghost"
                          colorPalette="green"
                          onClick={() => onMarkComplete(activity.id)}
                          disabled={activity.status === 'completed'}
                          opacity={activity.status === 'completed' ? 0.5 : 1}
                          cursor={activity.status === 'completed' ? 'not-allowed' : 'pointer'}
                        >
                          <FiCheckCircle size={16} />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton
                          aria-label="Delete activity"
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => onDelete(activity)}
                        >
                          <FiTrash2 size={16} />
                        </IconButton>
                      )}
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              );
            })}
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

export default ActivitiesTable;

import {
  Table,
  HStack,
  VStack,
  Text,
  IconButton,
  Badge,
  Box,
} from '@chakra-ui/react';
import { Card } from '../common';
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
} from 'react-icons/fi';
import type { Activity, ActivityType, ActivityStatus } from '@/types/activity.types';

interface ActivitiesTableProps {
  activities: Activity[];
  isLoading?: boolean;
  onView?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  onMarkComplete?: (activityId: string) => void;
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
  const colors = {
    completed: 'green',
    pending: 'orange',
    scheduled: 'blue',
    failed: 'red',
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
}: ActivitiesTableProps) => {
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

  return (
    <Card>
      <Table.Root size="md">
        <Table.Header>
          <Table.Row>
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
            const Icon = getActivityIcon(activity.type);
            const typeColor = getActivityColor(activity.type);

            return (
              <Table.Row key={activity.id} _hover={{ bg: 'gray.50' }}>
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
                    {activity.customerName}
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
                      {formatDate(activity.createdAt)}
                    </Text>
                    {activity.scheduledAt && activity.status === 'scheduled' && (
                      <Text fontSize="xs" color="blue.600" fontWeight="medium">
                        Due: {formatDate(activity.scheduledAt)}
                      </Text>
                    )}
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {activity.createdBy}
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
                    {onMarkComplete && activity.status !== 'completed' && (
                      <IconButton
                        aria-label="Mark as complete"
                        size="sm"
                        variant="ghost"
                        colorPalette="green"
                        onClick={() => onMarkComplete(activity.id)}
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
                        onClick={() => onDelete(activity.id)}
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
    </Card>
  );
};

export default ActivitiesTable;

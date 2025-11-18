import {
  Table,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Badge,
  Box,
} from '@chakra-ui/react';
import { Card, ResponsiveTable } from '../common';
import {
  FiAlertCircle,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

export interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  vendor: string;
  orderNumber?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface IssuesTableProps {
  issues: Issue[];
  isLoading?: boolean;
  onView?: (issue: Issue) => void;
  onDelete?: (issueId: string) => void;
  onComplete?: (issueId: string) => void;
}

const getPriorityColor = (priority: Issue['priority']) => {
  const colors = {
    urgent: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'gray',
  };
  return colors[priority] || 'gray';
};

const getStatusColor = (status: Issue['status']) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
    resolved: 'green',
    closed: 'gray',
  };
  return colors[status] || 'gray';
};

const getStatusLabel = (status: Issue['status']) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const IssuesTable = ({
  issues,
  isLoading = false,
  onView,
  onDelete,
  onComplete,
}: IssuesTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <Box textAlign="center" py={12}>
          <Text color="gray.500">Loading issues...</Text>
        </Box>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <>
      </>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {issues.map((issue) => (
        <Card key={issue.id} p={4}>
          <VStack align="stretch" gap={3}>
            {/* Header */}
            <HStack justify="space-between" align="start">
              <HStack gap={3} flex={1}>
                <Box
                  p={3}
                  bg={`${getPriorityColor(issue.priority)}.100`}
                  borderRadius="lg"
                  color={`${getPriorityColor(issue.priority)}.600`}
                >
                  <FiAlertCircle size={20} />
                </Box>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontWeight="bold" fontSize="sm" color="gray.900" lineClamp={1}>
                    {issue.issueNumber}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {issue.vendor}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorPalette={getStatusColor(issue.status)}
                size="sm"
                textTransform="capitalize"
              >
                {getStatusLabel(issue.status)}
              </Badge>
            </HStack>

            {/* Title & Description */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" color="gray.900" mb={1}>
                {issue.title}
              </Text>
              <Text fontSize="sm" color="gray.600" lineClamp={2}>
                {issue.description}
              </Text>
            </Box>

            {/* Details */}
            <HStack gap={4} fontSize="xs" color="gray.500" flexWrap="wrap">
              <HStack gap={1}>
                <Text fontWeight="medium">Priority:</Text>
                <Badge
                  colorPalette={getPriorityColor(issue.priority)}
                  size="sm"
                  textTransform="capitalize"
                >
                  {issue.priority}
                </Badge>
              </HStack>
              {issue.orderNumber && (
                <HStack gap={1}>
                  <Text fontWeight="medium">Order:</Text>
                  <Text>{issue.orderNumber}</Text>
                </HStack>
              )}
              <HStack gap={1}>
                <Text fontWeight="medium">Category:</Text>
                <Text textTransform="capitalize">{issue.category}</Text>
              </HStack>
            </HStack>

            {/* Date */}
            <HStack gap={1} fontSize="xs" color="gray.500">
              <FiClock size={12} />
              <Text>Created {formatDate(issue.createdAt)}</Text>
            </HStack>

            {/* Actions */}
            <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.200">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="blue"
                  flex={1}
                  onClick={() => onView(issue)}
                >
                  <FiEye size={16} />
                  <Box ml={2}>View</Box>
                </Button>
              )}
              {onComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="green"
                  flex={1}
                  onClick={() => onComplete(issue.id)}
                  disabled={issue.status === 'resolved' || issue.status === 'closed'}
                  opacity={issue.status === 'resolved' || issue.status === 'closed' ? 0.5 : 1}
                >
                  <FiCheckCircle size={16} />
                  <Box ml={2}>
                    {issue.status === 'resolved' || issue.status === 'closed' ? 'Completed' : 'Complete'}
                  </Box>
                </Button>
              )}
              {onDelete && (
                <IconButton
                  aria-label="Delete issue"
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => onDelete(issue.id)}
                >
                  <FiTrash2 size={16} />
                </IconButton>
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
      <Box overflowX="auto">
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>Issue</Table.ColumnHeader>
              <Table.ColumnHeader>Title</Table.ColumnHeader>
              <Table.ColumnHeader>Vendor</Table.ColumnHeader>
              <Table.ColumnHeader>Priority</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {issues.map((issue) => (
              <Table.Row key={issue.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                      {issue.issueNumber}
                    </Text>
                    {issue.orderNumber && (
                      <Text fontSize="xs" color="gray.500">
                        Order: {issue.orderNumber}
                      </Text>
                    )}
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900" lineClamp={1}>
                      {issue.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500" lineClamp={1}>
                      {issue.description}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {issue.vendor}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getPriorityColor(issue.priority)}
                    size="sm"
                    textTransform="capitalize"
                  >
                    {issue.priority}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getStatusColor(issue.status)}
                    size="sm"
                    textTransform="capitalize"
                  >
                    {getStatusLabel(issue.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                    {issue.category}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(issue.createdAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} justify="center">
                    {onView && (
                      <IconButton
                        aria-label="View issue"
                        size="sm"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={() => onView(issue)}
                      >
                        <FiEye size={16} />
                      </IconButton>
                    )}
                    {onComplete && (
                      <IconButton
                        aria-label="Mark as complete"
                        size="sm"
                        variant="ghost"
                        colorPalette="green"
                        onClick={() => onComplete(issue.id)}
                        disabled={issue.status === 'resolved' || issue.status === 'closed'}
                        opacity={issue.status === 'resolved' || issue.status === 'closed' ? 0.5 : 1}
                        cursor={issue.status === 'resolved' || issue.status === 'closed' ? 'not-allowed' : 'pointer'}
                      >
                        <FiCheckCircle size={16} />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        aria-label="Delete issue"
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => onDelete(issue.id)}
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

export default IssuesTable;

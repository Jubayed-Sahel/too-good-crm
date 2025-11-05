import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Button,
  IconButton,
  Textarea,
} from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiTrash2,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiPackage,
  FiCalendar,
  FiMessageSquare,
  FiTag,
  FiEdit2,
} from 'react-icons/fi';
import { toaster } from '../components/ui/toaster';

// Mock data - replace with actual API call
const mockIssues = [
  {
    id: '1',
    issueNumber: 'ISS-001',
    title: 'Product quality concern',
    description: 'The product received does not match the quality shown in photos. Material feels cheap and colors are different.',
    vendor: 'Tech Solutions Inc',
    orderNumber: 'ORD-2024-001',
    priority: 'high' as const,
    status: 'open' as const,
    category: 'quality',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    comments: [
      {
        id: '1',
        author: 'Support Team',
        message: 'We have received your complaint and are investigating the matter.',
        createdAt: '2024-01-15T11:00:00Z',
      },
      {
        id: '2',
        author: 'Tech Solutions Inc',
        message: 'We sincerely apologize for the quality issue. We are preparing a replacement shipment.',
        createdAt: '2024-01-15T14:30:00Z',
      },
    ],
  },
  {
    id: '2',
    issueNumber: 'ISS-002',
    title: 'Delayed delivery',
    description: 'Order was supposed to arrive 5 days ago but still not received.',
    vendor: 'Marketing Pro',
    orderNumber: 'ORD-2024-002',
    priority: 'urgent' as const,
    status: 'in_progress' as const,
    category: 'delivery',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-17T08:20:00Z',
    comments: [],
  },
];

const ClientIssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  // Mock data - replace with actual hook
  const issue = mockIssues.find((i) => i.id === id);
  const isLoading = false;

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'gray',
    };
    return colors[priority as keyof typeof colors] || 'gray';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'blue',
      in_progress: 'orange',
      resolved: 'green',
      closed: 'gray',
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleComplete = () => {
    toaster.create({
      title: 'Issue Completed',
      description: 'Issue has been marked as complete.',
      type: 'success',
      duration: 3000,
    });
    // In real app, make API call to update status
  };

  const handleDelete = () => {
    if (!issue) return;
    if (confirm(`Are you sure you want to delete issue "${issue.title}"?`)) {
      toaster.create({
        title: 'Issue Deleted',
        description: `Issue "${issue.title}" has been deleted.`,
        type: 'info',
        duration: 3000,
      });
      navigate('/client/issues');
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    toaster.create({
      title: 'Comment Added',
      description: 'Your comment has been added successfully.',
      type: 'success',
      duration: 3000,
    });
    setNewComment('');
    // In real app, make API call to add comment
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Issue Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <VStack gap={4}>
            <Text fontSize="md" color="gray.600">
              Loading issue details...
            </Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (!issue) {
    return (
      <DashboardLayout title="Issue Details">
        <Box textAlign="center" py={12}>
          <Box
            w={16}
            h={16}
            bg="red.50"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={4}
          >
            <Text fontSize="3xl">⚠️</Text>
          </Box>
          <Heading size="lg" color="red.600" mb={3}>
            Issue Not Found
          </Heading>
          <Text color="gray.600" fontSize="md" mb={6}>
            The issue you are looking for does not exist.
          </Text>
          <Button
            colorPalette="blue"
            onClick={() => navigate('/client/issues')}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Issues</Text>
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={issue.issueNumber}>
      <VStack align="stretch" gap={5}>
        {/* Back Button and Actions */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Button
            variant="ghost"
            colorPalette="gray"
            onClick={() => navigate('/client/issues')}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Issues</Text>
          </Button>
          <HStack gap={2}>
            <Button
              variant="solid"
              colorPalette="green"
              onClick={handleComplete}
            >
              <FiCheckCircle />
              <Text ml={2}>Mark as Complete</Text>
            </Button>
            <IconButton
              aria-label="Delete issue"
              variant="outline"
              colorPalette="red"
              onClick={handleDelete}
            >
              <FiTrash2 />
            </IconButton>
          </HStack>
        </HStack>

        {/* Header Section with Issue Info */}
        <Box
          bg="linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          color="white"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative Background Elements */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="200px"
            h="200px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(40px)"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="150px"
            h="150px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(30px)"
          />

          {/* Content */}
          <VStack align="stretch" gap={4} position="relative" zIndex={1}>
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <VStack align="start" gap={2}>
                <HStack gap={2}>
                  <Box
                    p={2}
                    bg="whiteAlpha.200"
                    borderRadius="lg"
                  >
                    <FiAlertCircle size={24} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" opacity={0.9}>
                      Issue #{issue.issueNumber}
                    </Text>
                    <Heading size="xl" fontWeight="bold">
                      {issue.title}
                    </Heading>
                  </Box>
                </HStack>
              </VStack>
              <HStack gap={2}>
                <Badge
                  colorPalette={getPriorityColor(issue.priority)}
                  size="lg"
                  textTransform="uppercase"
                  px={3}
                  py={1}
                >
                  {issue.priority}
                </Badge>
                <Badge
                  colorPalette={getStatusColor(issue.status)}
                  size="lg"
                  px={3}
                  py={1}
                >
                  {getStatusLabel(issue.status)}
                </Badge>
              </HStack>
            </HStack>

            <Text fontSize="md" lineHeight="1.7" opacity={0.95}>
              {issue.description}
            </Text>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
              pt={2}
            >
              <HStack gap={2}>
                <FiUser size={16} />
                <Box>
                  <Text fontSize="xs" opacity={0.8}>
                    Vendor
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {issue.vendor}
                  </Text>
                </Box>
              </HStack>
              {issue.orderNumber && (
                <HStack gap={2}>
                  <FiPackage size={16} />
                  <Box>
                    <Text fontSize="xs" opacity={0.8}>
                      Order Number
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {issue.orderNumber}
                    </Text>
                  </Box>
                </HStack>
              )}
              <HStack gap={2}>
                <FiTag size={16} />
                <Box>
                  <Text fontSize="xs" opacity={0.8}>
                    Category
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" textTransform="capitalize">
                    {issue.category}
                  </Text>
                </Box>
              </HStack>
            </Grid>
          </VStack>
        </Box>

        {/* Details Grid */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={5}>
          {/* Dates Card */}
          <Card>
            <VStack align="stretch" gap={4}>
              <HStack gap={2}>
                <Box p={2} bg="blue.50" borderRadius="md" color="blue.600">
                  <FiCalendar size={18} />
                </Box>
                <Heading size="md" color="gray.900">
                  Timeline
                </Heading>
              </HStack>

              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <FiClock size={16} color="gray" />
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Created
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.900" fontWeight="semibold">
                    {formatDate(issue.createdAt)}
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <HStack gap={2}>
                    <FiEdit2 size={16} color="gray" />
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Last Updated
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.900" fontWeight="semibold">
                    {formatDate(issue.updatedAt)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Issue Details Card */}
          <Card>
            <VStack align="stretch" gap={4}>
              <HStack gap={2}>
                <Box p={2} bg="purple.50" borderRadius="md" color="purple.600">
                  <FiAlertCircle size={18} />
                </Box>
                <Heading size="md" color="gray.900">
                  Issue Details
                </Heading>
              </HStack>

              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Priority Level
                  </Text>
                  <Badge
                    colorPalette={getPriorityColor(issue.priority)}
                    size="md"
                    textTransform="capitalize"
                  >
                    {issue.priority}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Current Status
                  </Text>
                  <Badge
                    colorPalette={getStatusColor(issue.status)}
                    size="md"
                  >
                    {getStatusLabel(issue.status)}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Category
                  </Text>
                  <Text fontSize="sm" color="gray.900" fontWeight="semibold" textTransform="capitalize">
                    {issue.category}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </Grid>

        {/* Comments Section */}
        <Card>
          <VStack align="stretch" gap={5}>
            <HStack gap={2}>
              <Box p={2} bg="green.50" borderRadius="md" color="green.600">
                <FiMessageSquare size={18} />
              </Box>
              <Heading size="md" color="gray.900">
                Comments & Updates
              </Heading>
              <Badge colorPalette="gray" ml="auto">
                {issue.comments?.length || 0} Comments
              </Badge>
            </HStack>

            {/* Existing Comments */}
            {issue.comments && issue.comments.length > 0 ? (
              <VStack align="stretch" gap={3}>
                {issue.comments.map((comment) => (
                  <Box
                    key={comment.id}
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack gap={2}>
                        <Box
                          w={8}
                          h={8}
                          bg="blue.100"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="sm" fontWeight="bold" color="blue.600">
                            {comment.author.charAt(0)}
                          </Text>
                        </Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                          {comment.author}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(comment.createdAt)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700" ml={10}>
                      {comment.message}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box textAlign="center" py={6}>
                <Text color="gray.500" fontSize="sm">
                  No comments yet. Be the first to add a comment.
                </Text>
              </Box>
            )}

            {/* Add Comment Form */}
            <Box pt={3} borderTopWidth="1px" borderColor="gray.200">
              <VStack align="stretch" gap={3}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Add a Comment
                </Text>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment or update here..."
                  rows={3}
                  size="lg"
                />
                <HStack justify="flex-end">
                  <Button
                    colorPalette="blue"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <FiMessageSquare />
                    <Text ml={2}>Add Comment</Text>
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssueDetailPage;

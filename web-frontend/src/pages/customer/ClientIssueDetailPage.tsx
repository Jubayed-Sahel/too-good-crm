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
  Spinner,
  Textarea,
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, StandardButton, ConfirmDialog, ErrorState } from '../../components/common';
import { issueService } from '../../services/issue.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Issue } from '../../types';
import {
  FiArrowLeft,
  FiTrash2,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiPackage,
  FiCalendar,
  FiTag,
  FiEdit2,
  FiMessageSquare,
} from 'react-icons/fi';
import { toaster } from '../../components/ui/toaster';

const ClientIssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch issue data
  const { data: issue, isLoading, error } = useQuery<Issue>({
    queryKey: ['issue', id],
    queryFn: () => issueService.getById(Number(id)),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => issueService.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toaster.create({
        title: 'Issue Deleted',
        description: 'Issue has been successfully deleted',
        type: 'success',
        duration: 3000,
      });
      navigate('/client/issues');
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Delete Failed',
        description: error.response?.data?.details || 'Failed to delete issue',
        type: 'error',
        duration: 3000,
      });
    },
  });

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

  const handleDelete = () => {
    if (!issue) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !issue) return;
    
    setIsSubmittingComment(true);
    try {
      await issueService.clientAddComment(Number(issue.id), newComment);
      
      toaster.create({
        title: 'Comment Added',
        description: 'Your comment has been added successfully.',
        type: 'success',
        duration: 3000,
      });
      
      setNewComment('');
      // Refresh issue data to show updated description with comment
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    } catch (error: any) {
      toaster.create({
        title: 'Failed to add comment',
        description: error.response?.data?.details || 'Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Issue Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="purple.500" />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !issue) {
    return (
      <DashboardLayout title="Issue Details">
        <ErrorState
          title="Failed to load issue"
          error={error}
          onRetry={() => navigate('/client/issues')}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={issue.issue_number}>
      <VStack align="stretch" gap={5}>
        {/* Back Button and Actions */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <StandardButton
            variant="ghost"
            onClick={() => navigate('/client/issues')}
            leftIcon={<FiArrowLeft />}
          >
            Back to Issues
          </StandardButton>
          <StandardButton
            variant="danger"
            onClick={handleDelete}
            leftIcon={<FiTrash2 />}
          >
            Delete
          </StandardButton>
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
                      Issue #{issue.issue_number}
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
                    {issue.vendor_name || `Vendor #${issue.vendor}`}
                  </Text>
                </Box>
              </HStack>
              {issue.order_number && (
                <HStack gap={2}>
                  <FiPackage size={16} />
                  <Box>
                    <Text fontSize="xs" opacity={0.8}>
                      Order Number
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {issue.order_number}
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
                  <FiCalendar size={20} />
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
                    {formatDate(issue.created_at)}
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
                    {formatDate(issue.updated_at)}
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
                  <FiAlertCircle size={20} />
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
                <FiMessageSquare size={20} />
              </Box>
              <Heading size="md" color="gray.900">
                Discussion & Updates
              </Heading>
            </HStack>

            {/* Current Description with Comments */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Full Description & Comments:
              </Text>
              <Box
                p={4}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                whiteSpace="pre-wrap"
              >
                <Text fontSize="sm" color="gray.700" lineHeight="1.7">
                  {issue.description}
                </Text>
              </Box>
            </Box>

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
                  size="sm"
                />
                <HStack justify="flex-end">
                  <StandardButton
                    variant="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    loading={isSubmittingComment}
                    leftIcon={<FiMessageSquare />}
                  >
                    Add Comment
                  </StandardButton>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Issue"
          message={
            issue
              ? `Are you sure you want to delete issue "${issue.title}"? This action cannot be undone.`
              : 'Are you sure you want to delete this issue?'
          }
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
        />
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssueDetailPage;

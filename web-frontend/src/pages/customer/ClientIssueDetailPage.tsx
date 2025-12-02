import { useState, useEffect } from 'react';
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
  Input,
  Separator,
} from '@chakra-ui/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, StandardButton, ConfirmDialog, ErrorState } from '@/components/common';
import { issueService } from '@/features/issues/services/issue.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Issue, IssueComment, IssuePriority, IssueCategory } from '@/types';
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
  FiFileText,
  FiSend,
  FiSave,
  FiCheckCircle,
} from 'react-icons/fi';
import { toaster } from '../../components/ui/toaster';

const ClientIssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form fields for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<IssuePriority>('medium');
  const [editCategory, setEditCategory] = useState<IssueCategory>('general');

  // Fetch issue data
  const { data: issue, isLoading, error } = useQuery<Issue>({
    queryKey: ['issue', id],
    queryFn: () => issueService.getById(Number(id)),
    enabled: !!id,
  });

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } = useQuery<{ comments: IssueComment[]; count: number }>({
    queryKey: ['issueComments', id],
    queryFn: () => issueService.getComments(Number(id)),
    enabled: !!id,
  });

  const comments = commentsData?.comments || [];

  // Initialize edit form when issue loads
  useEffect(() => {
    if (issue) {
      setEditTitle(issue.title);
      setEditDescription(issue.description);
      setEditPriority(issue.priority);
      setEditCategory(issue.category);
    }
  }, [issue]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Issue>) => issueService.update(Number(id), data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setIsEditing(false);
      toaster.create({
        title: 'Issue Updated',
        description: data.linear_synced 
          ? 'Issue has been updated and synced to Linear' 
          : 'Issue has been updated successfully',
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Update Failed',
        description: error.response?.data?.details || 'Failed to update issue',
        type: 'error',
        duration: 3000,
      });
    },
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

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => issueService.addComment(Number(id), content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issueComments', id] });
      setNewComment('');
      toaster.create({
        title: 'Comment Added',
        description: data.synced_to_linear 
          ? 'Your comment has been added and synced to Linear' 
          : 'Your comment has been added successfully',
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Failed to Add Comment',
        description: error.response?.data?.details || 'An error occurred',
        type: 'error',
        duration: 4000,
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

  const handleSave = () => {
    if (!issue) return;
    
    const updateData: Partial<Issue> = {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      category: editCategory,
    };
    
    updateMutation.mutate(updateData);
  };

  const handleCancelEdit = () => {
    if (issue) {
      setEditTitle(issue.title);
      setEditDescription(issue.description);
      setEditPriority(issue.priority);
      setEditCategory(issue.category);
    }
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
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
          <HStack gap={2}>
            {isEditing ? (
              <>
                <StandardButton
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </StandardButton>
                <StandardButton
                  variant="primary"
                  onClick={handleSave}
                  loading={updateMutation.isPending}
                  leftIcon={<FiSave />}
                >
                  Save Changes
                </StandardButton>
              </>
            ) : (
              <>
                <StandardButton
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<FiEdit2 />}
                >
                  Edit
                </StandardButton>
                <StandardButton
                  variant="danger"
                  onClick={handleDelete}
                  leftIcon={<FiTrash2 />}
                >
                  Delete
                </StandardButton>
              </>
            )}
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
              <VStack align="start" gap={2} flex={1}>
                <HStack gap={2}>
                  <Box
                    p={2}
                    bg="whiteAlpha.200"
                    borderRadius="lg"
                  >
                    <FiAlertCircle size={24} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" opacity={0.9}>
                      Issue #{issue.issue_number}
                    </Text>
                    {isEditing ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        size="lg"
                        bg="whiteAlpha.200"
                        borderColor="whiteAlpha.300"
                        color="white"
                        fontWeight="bold"
                        _placeholder={{ color: 'whiteAlpha.600' }}
                      />
                    ) : (
                      <Heading size="xl" fontWeight="bold">
                        {issue.title}
                      </Heading>
                    )}
                  </Box>
                </HStack>
              </VStack>
              <HStack gap={2}>
                {isEditing ? (
                  <>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as IssuePriority)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      <option value="low" style={{ color: 'black' }}>Low</option>
                      <option value="medium" style={{ color: 'black' }}>Medium</option>
                      <option value="high" style={{ color: 'black' }}>High</option>
                      <option value="critical" style={{ color: 'black' }}>Critical</option>
                    </select>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as IssueCategory)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      <option value="general" style={{ color: 'black' }}>General</option>
                      <option value="quality" style={{ color: 'black' }}>Quality</option>
                      <option value="delivery" style={{ color: 'black' }}>Delivery</option>
                      <option value="billing" style={{ color: 'black' }}>Billing</option>
                      <option value="payment" style={{ color: 'black' }}>Payment</option>
                      <option value="communication" style={{ color: 'black' }}>Communication</option>
                      <option value="technical" style={{ color: 'black' }}>Technical</option>
                      <option value="other" style={{ color: 'black' }}>Other</option>
                    </select>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </HStack>
            </HStack>

            {isEditing && (
              <Text fontSize="xs" opacity={0.8} fontStyle="italic">
                Note: You can edit the title, description, priority, and category. Status changes are managed by the vendor.
              </Text>
            )}

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

        {/* Description Section */}
        <Card>
          <VStack align="stretch" gap={4}>
            <HStack align="center" gap={2}>
              <FiFileText color="#3B82F6" size={20} />
              <Heading size="md">Description</Heading>
            </HStack>

            <Separator />

            {isEditing ? (
              <>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter issue description..."
                  minH="150px"
                  borderColor="gray.300"
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3B82F6' }}
                />
                <Text fontSize="xs" color="gray.600" fontStyle="italic">
                  Note: This is the main issue description only. Use the Comments section below for updates and discussions.
                </Text>
              </>
            ) : (
              <Box
                p={4}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Text color="gray.700" fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">
                  {issue.description}
                </Text>
              </Box>
            )}
          </VStack>
        </Card>

        {/* Comments & Activity Section */}
        <Card>
          <VStack align="stretch" gap={4}>
            <HStack align="center" gap={2}>
              <FiMessageSquare color="#805AD5" size={20} />
              <Heading size="md">Comments & Activity</Heading>
              <Badge colorPalette="purple" size="sm">
                {comments.length}
              </Badge>
            </HStack>

            <Separator />

            {/* Comments List */}
            {isLoadingComments ? (
              <Box display="flex" justifyContent="center" py={8}>
                <Spinner size="lg" color="purple.500" />
              </Box>
            ) : comments.length > 0 ? (
              <VStack align="stretch" gap={3}>
                {comments.map((comment) => (
                  <Box
                    key={comment.id}
                    p={4}
                    bg="purple.50"
                    borderRadius="lg"
                    borderLeftWidth="3px"
                    borderLeftColor="purple.500"
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack gap={2}>
                        <FiUser size={14} color="#805AD5" />
                        <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                          {comment.author_name}
                        </Text>
                        {comment.synced_to_linear && (
                          <Badge size="xs" colorPalette="green">
                            Synced to Linear
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(comment.created_at)}
                      </Text>
                    </HStack>
                    <Text color="gray.700" fontSize="sm" lineHeight="tall">
                      {comment.content}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box
                p={6}
                textAlign="center"
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                borderStyle="dashed"
              >
                <FiMessageSquare size={32} color="#CBD5E0" style={{ margin: '0 auto 8px' }} />
                <Text color="gray.500" fontSize="sm">
                  No comments yet. Be the first to add a comment!
                </Text>
              </Box>
            )}

            <Separator />

            {/* Add Comment Form */}
            <VStack align="stretch" gap={3}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Add a Comment
              </Text>
              <Text fontSize="xs" color="gray.600">
                Add updates, discussions, and follow-up information here. Comments are separate from the main description above.
              </Text>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment, add updates, or ask questions..."
                minH="100px"
                borderColor="gray.300"
                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
              />
              <HStack justify="flex-end">
                <StandardButton
                  variant="primary"
                  onClick={handleAddComment}
                  loading={addCommentMutation.isPending}
                  disabled={!newComment.trim()}
                  leftIcon={<FiSend />}
                  size="sm"
                >
                  Add Comment
                </StandardButton>
              </HStack>
            </VStack>
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

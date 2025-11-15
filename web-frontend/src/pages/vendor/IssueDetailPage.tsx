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
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, StandardButton, ConfirmDialog, ErrorState } from '../../components/common';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService } from '../../services/issue.service';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiTrash2,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiPackage,
  FiCalendar,
  FiEdit2,
  FiSave,
} from 'react-icons/fi';
import { toaster } from '../../components/ui/toaster';
import type { Issue, IssueStatus, IssuePriority, IssueCategory } from '../../types';

const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Check if URL contains /edit to determine initial edit mode
  const isEditRoute = window.location.pathname.endsWith('/edit');

  const [isEditing, setIsEditing] = useState(isEditRoute);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Form fields for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<IssueStatus>('open');
  const [editPriority, setEditPriority] = useState<IssuePriority>('medium');
  const [editCategory, setEditCategory] = useState<IssueCategory>('general');

  // Fetch issue
  const { data: issue, isLoading, error } = useQuery<Issue>({
    queryKey: ['issue', id],
    queryFn: () => issueService.getById(Number(id)),
    enabled: !!id,
  });

  // Initialize edit form when issue loads
  useEffect(() => {
    if (issue) {
      setEditTitle(issue.title);
      setEditDescription(issue.description);
      setEditStatus(issue.status);
      setEditPriority(issue.priority);
      setEditCategory(issue.category);
    }
  }, [issue]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Issue>) => issueService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toaster.create({
        title: 'Issue Updated',
        description: 'Issue has been successfully updated',
        type: 'success',
        duration: 3000,
      });
      setIsEditing(false);
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

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: ({ issueId, notes }: { issueId: number; notes: string }) =>
      issueService.resolve(issueId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toaster.create({
        title: 'Issue Resolved',
        description: 'Issue has been marked as resolved',
        type: 'success',
        duration: 3000,
      });
      setIsResolveDialogOpen(false);
      setResolutionNotes('');
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Failed to Resolve',
        description: error.response?.data?.details || 'Failed to resolve issue',
        type: 'error',
        duration: 3000,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => issueService.delete(Number(id)),
    onSuccess: () => {
      toaster.create({
        title: 'Issue Deleted',
        description: 'Issue has been successfully deleted',
        type: 'success',
        duration: 3000,
      });
      navigate('/issues');
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

  const handleSave = () => {
    updateMutation.mutate({
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      category: editCategory,
    });
  };

  const handleResolve = () => {
    resolveMutation.mutate({ issueId: Number(id), notes: resolutionNotes });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'red',
      critical: 'red',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          onRetry={() => navigate('/issues')}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Issue ${issue.issue_number}`}>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack gap={3}>
            <StandardButton
              variant="ghost"
              onClick={() => navigate('/issues')}
              leftIcon={<FiArrowLeft />}
            >
              Back
            </StandardButton>
            <Heading size="lg">{issue.issue_number}</Heading>
            <Badge colorPalette={getStatusColor(issue.status)} size="lg">
              {issue.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </HStack>
          <HStack gap={2}>
            {!isEditing && (
              <>
                {issue.status !== 'resolved' && issue.status !== 'closed' && (
                  <>
                    <StandardButton
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      leftIcon={<FiEdit2 />}
                    >
                      Edit
                    </StandardButton>
                    <StandardButton
                      variant="primary"
                      colorPalette="green"
                      onClick={() => setIsResolveDialogOpen(true)}
                      leftIcon={<FiCheckCircle />}
                    >
                      Resolve
                    </StandardButton>
                  </>
                )}
                <StandardButton
                  variant="outline"
                  colorPalette="red"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  leftIcon={<FiTrash2 />}
                >
                  Delete
                </StandardButton>
              </>
            )}
            {isEditing && (
              <>
                <StandardButton
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </StandardButton>
                <StandardButton
                  variant="primary"
                  onClick={handleSave}
                  isLoading={updateMutation.isPending}
                  leftIcon={<FiSave />}
                >
                  Save Changes
                </StandardButton>
              </>
            )}
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
          {/* Main Content */}
          <VStack align="stretch" gap={6}>
            {/* Title */}
            <Card>
              <VStack align="stretch" gap={4}>
                <HStack align="center" gap={2}>
                  <FiAlertCircle color="#805AD5" size={24} />
                  <Heading size="md">Title</Heading>
                </HStack>
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Issue title"
                    size="lg"
                  />
                ) : (
                  <Heading size="lg" fontWeight="semibold">
                    {issue.title}
                  </Heading>
                )}
              </VStack>
            </Card>

            {/* Description */}
            <Card>
              <VStack align="stretch" gap={4}>
                <Heading size="md">Description</Heading>
                {isEditing ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Issue description"
                    minH="200px"
                  />
                ) : (
                  <Text color="gray.700" whiteSpace="pre-wrap">
                    {issue.description}
                  </Text>
                )}
              </VStack>
            </Card>

            {/* Resolution Notes (if resolved) */}
            {issue.resolution_notes && (
              <Card>
                <VStack align="stretch" gap={4}>
                  <HStack align="center" gap={2}>
                    <FiCheckCircle color="#38A169" size={20} />
                    <Heading size="md">Resolution Notes</Heading>
                  </HStack>
                  <Text color="gray.700" whiteSpace="pre-wrap">
                    {issue.resolution_notes}
                  </Text>
                  {issue.resolved_at && (
                    <Text fontSize="sm" color="gray.500">
                      Resolved on {formatDate(issue.resolved_at)}
                      {issue.resolved_by_name && ` by ${issue.resolved_by_name}`}
                    </Text>
                  )}
                </VStack>
              </Card>
            )}
          </VStack>

          {/* Sidebar */}
          <VStack align="stretch" gap={6}>
            {/* Details */}
            <Card>
              <VStack align="stretch" gap={4}>
                <Heading size="md">Details</Heading>

                {/* Priority */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Priority
                  </Text>
                  {isEditing ? (
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as IssuePriority)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  ) : (
                    <Badge colorPalette={getPriorityColor(issue.priority)} size="lg">
                      {issue.priority.toUpperCase()}
                    </Badge>
                  )}
                </Box>

                {/* Status */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Status
                  </Text>
                  {isEditing ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <Badge colorPalette={getStatusColor(issue.status)} size="lg">
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  )}
                </Box>

                {/* Category */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Category
                  </Text>
                  {isEditing ? (
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as IssueCategory)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <option value="general">General</option>
                      <option value="quality">Quality</option>
                      <option value="delivery">Delivery</option>
                      <option value="billing">Billing</option>
                      <option value="payment">Payment</option>
                      <option value="communication">Communication</option>
                      <option value="technical">Technical</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <Text textTransform="capitalize">{issue.category}</Text>
                  )}
                </Box>

                {/* Vendor */}
                {issue.vendor_name && (
                  <Box>
                    <HStack gap={2} mb={2}>
                      <FiUser size={16} color="#718096" />
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Vendor
                      </Text>
                    </HStack>
                    <Text>{issue.vendor_name}</Text>
                  </Box>
                )}

                {/* Order */}
                {issue.order_number && (
                  <Box>
                    <HStack gap={2} mb={2}>
                      <FiPackage size={16} color="#718096" />
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Order
                      </Text>
                    </HStack>
                    <Text>{issue.order_number}</Text>
                  </Box>
                )}

                {/* Created */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <FiCalendar size={16} color="#718096" />
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                      Created
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.700">
                    {formatDate(issue.created_at)}
                  </Text>
                  {issue.created_by_name && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      by {issue.created_by_name}
                    </Text>
                  )}
                </Box>

                {/* Updated */}
                {issue.updated_at !== issue.created_at && (
                  <Box>
                    <HStack gap={2} mb={2}>
                      <FiClock size={16} color="#718096" />
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Last Updated
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      {formatDate(issue.updated_at)}
                    </Text>
                  </Box>
                )}

                {/* Client Issue Badge */}
                {(issue as any).is_client_issue && (
                  <Box>
                    <Badge colorPalette="purple" size="md">
                      Client Issue
                    </Badge>
                    {(issue as any).raised_by_customer_name && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Raised by {(issue as any).raised_by_customer_name}
                      </Text>
                    )}
                  </Box>
                )}

                {/* Linear Link */}
                {(issue as any).linear_issue_url && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                      Linear
                    </Text>
                    <a
                      href={(issue as any).linear_issue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <StandardButton variant="outline" size="sm">
                        View in Linear
                      </StandardButton>
                    </a>
                  </Box>
                )}
              </VStack>
            </Card>
          </VStack>
        </Grid>

        {/* Resolve Dialog */}
        <ConfirmDialog
          isOpen={isResolveDialogOpen}
          onClose={() => setIsResolveDialogOpen(false)}
          onConfirm={handleResolve}
          title="Resolve Issue"
          confirmText="Resolve"
          cancelText="Cancel"
          colorScheme="green"
          isLoading={resolveMutation.isPending}
        >
          <VStack align="stretch" gap={4}>
            <Text>Add resolution notes (optional):</Text>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how the issue was resolved..."
              minH="100px"
            />
          </VStack>
        </ConfirmDialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Issue"
          message={`Are you sure you want to delete issue "${issue.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
          isLoading={deleteMutation.isPending}
        />
      </VStack>
    </DashboardLayout>
  );
};

export default IssueDetailPage;

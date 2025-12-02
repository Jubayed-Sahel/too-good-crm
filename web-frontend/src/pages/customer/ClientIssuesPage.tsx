import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { IssueStats, IssueFilters, IssuesTable, ClientRaiseIssueModal } from '@/components/client-issues';
import { ErrorState, ConfirmDialog } from '@/components/common';
import type { Issue as ComponentIssue } from '@/components/client-issues';
import { useIssues, useIssueStats } from '@/features/issues/hooks/useIssues';
import { issueService } from '@/features/issues/services/issue.service';
import type { Issue as BackendIssue, IssuePriority, ClientRaiseIssueData } from '@/types';
import { toaster } from '@/components/ui/toaster';

const ClientIssuesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<ComponentIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Build filter object for API
  const apiFilters = useMemo(() => ({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    priority: priorityFilter !== 'all' ? (priorityFilter as IssuePriority) : undefined,
  }), [searchQuery, statusFilter, priorityFilter]);

  // Fetch issues from backend
  const { data: issuesData, isLoading, error } = useIssues(apiFilters);
  const backendIssues = issuesData?.results || [];

  // Map backend issues to component format
  const issues: ComponentIssue[] = useMemo(() => {
    return backendIssues.map((issue: BackendIssue) => ({
      id: issue.id.toString(),
      issueNumber: issue.issue_number,
      title: issue.title,
      description: issue.description,
      vendor: issue.vendor_name || `Vendor #${issue.vendor}`,
      orderNumber: issue.order_number,
      priority: issue.priority === 'critical' ? 'urgent' : issue.priority as 'low' | 'medium' | 'high' | 'urgent',
      status: issue.status,
      category: issue.category,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    }));
  }, [backendIssues]);

  // Fetch stats from backend
  const { data: statsData } = useIssueStats();

  // Raise issue mutation
  const raiseIssueMutation = useMutation({
    mutationFn: (data: ClientRaiseIssueData) => issueService.clientRaise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
      toaster.create({
        title: 'Issue Raised',
        description: 'Your issue has been successfully submitted to the organization.',
        type: 'success',
        duration: 5000,
      });
      setIsRaiseModalOpen(false);
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to raise issue. Please try again.',
        type: 'error',
        duration: 5000,
      });
    },
  });

  // Delete mutation
  const deleteIssueMutation = useMutation({
    mutationFn: (id: number) => issueService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
      setIsDeleteDialogOpen(false);
      setIssueToDelete(null);
      toaster.create({
        title: 'Issue Deleted',
        description: 'Issue has been successfully deleted.',
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete issue.',
        type: 'error',
        duration: 3000,
      });
    },
  });

  // Calculate stats from backend data or use default
  const stats = useMemo(() => {
    if (statsData) {
      return {
        total: statsData.total || 0,
        open: statsData.by_status?.open || 0,
        inProgress: statsData.by_status?.in_progress || 0,
        resolved: statsData.by_status?.resolved || 0,
      };
    }
    return {
      total: issues.length,
      open: issues.filter(i => i.status === 'open').length,
      inProgress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
    };
  }, [statsData, issues]);

  // Handlers
  const handleView = (issue: ComponentIssue) => {
    console.log('View clicked for issue:', issue);
    navigate(`/client/issues/${issue.id}`);
  };

  const handleDelete = (issueId: string) => {
    console.log('Delete clicked for issue ID:', issueId);
    const issue = issues.find(i => i.id === issueId);
    console.log('Found issue:', issue);
    if (issue) {
      setIssueToDelete(issue);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (issueToDelete) {
      deleteIssueMutation.mutate(Number(issueToDelete.id));
    }
  };

  const handleRaiseIssue = (data: ClientRaiseIssueData) => {
    raiseIssueMutation.mutate(data);
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Issues">
        <ErrorState
          title="Failed to load issues"
          error={error}
          onRetry={() => window.location.reload()}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Issues">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            My Issues
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Track and manage issues related to vendors, orders and projects
          </Text>
        </Box>

        {/* Stats */}
        <IssueStats 
          total={stats.total}
          open={stats.open}
          inProgress={stats.inProgress}
          resolved={stats.resolved}
        />

        {/* Filters */}
        <IssueFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onCreateIssue={() => setIsRaiseModalOpen(true)}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : (
          <>
            {/* Issues Table */}
            <IssuesTable
              issues={issues}
              onView={handleView}
              onDelete={handleDelete}
            />

            {/* Raise Issue Modal */}
            <ClientRaiseIssueModal
              isOpen={isRaiseModalOpen}
              onClose={() => setIsRaiseModalOpen(false)}
              onSubmit={handleRaiseIssue}
              isLoading={raiseIssueMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
              isOpen={isDeleteDialogOpen}
              onClose={() => {
                setIsDeleteDialogOpen(false);
                setIssueToDelete(null);
              }}
              onConfirm={confirmDelete}
              title="Delete Issue"
              message={
                issueToDelete
                  ? `Are you sure you want to delete issue "${issueToDelete.title}"? This action cannot be undone.`
                  : 'Are you sure you want to delete this issue?'
              }
              confirmText="Delete"
              cancelText="Cancel"
              colorScheme="red"
              isLoading={deleteIssueMutation.isPending}
            />
          </>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssuesPage;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, Box, Spinner, Text } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { IssueStatsGrid, IssueFiltersPanel, IssuesDataTable, ResolveIssueModal } from '../../components/issues';
import { ErrorState, PageHeader, StandardButton, ConfirmDialog } from '../../components/common';
import { useIssues, useIssueStats, useIssueMutations } from '../../hooks/useIssues';
import type { Issue, IssuePriority, IssueStatus, IssueCategory } from '../../types';
import { toaster } from '../../components/ui/toaster';

const EmployeeIssuesPage = () => {
  const navigate = useNavigate();
  const [selectedIssueForResolve, setSelectedIssueForResolve] = useState<Issue | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');

  // Build filter object for API
  const apiFilters = useMemo(() => ({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  }), [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Fetch data
  const { data: issuesData, isLoading, error, refetch } = useIssues(apiFilters);
  const issues = issuesData?.results || [];
  const { data: statsData, refetch: refetchStats } = useIssueStats();

  // Mutations
  const { updateIssue, deleteIssue, resolveIssue } = useIssueMutations();

  // Calculate stats
  const stats = useMemo(() => {
    if (statsData) {
      return {
        total: statsData.total || 0,
        open: statsData.by_status?.open || 0,
        inProgress: statsData.by_status?.in_progress || 0,
        resolved: statsData.by_status?.resolved || 0,
        closed: statsData.by_status?.closed || 0,
        byPriority: statsData.by_priority || {},
        byCategory: statsData.by_category || {},
      };
    }
    return {
      total: issues.length,
      open: issues.filter(i => i.status === 'open').length,
      inProgress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      closed: issues.filter(i => i.status === 'closed').length,
      byPriority: {},
      byCategory: {},
    };
  }, [statsData, issues]);

  // Handlers
  const handleView = (issue: Issue) => {
    navigate(`/issues/${issue.id}`);
  };

  const handleEdit = (issue: Issue) => {
    navigate(`/issues/${issue.id}/edit`);
  };

  const handleUpdateStatus = async (issueId: number, newStatus: IssueStatus) => {
    try {
      await updateIssue.mutateAsync({
        id: issueId,
        data: { status: newStatus },
      });
      
      toaster.create({
        title: 'Status Updated',
        description: `Issue status changed to ${newStatus}`,
        type: 'success',
        duration: 3000,
      });
      
      // Refresh data to show updated status
      refetch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.details || error.message || 'Failed to update issue status';
      toaster.create({
        title: 'Update Failed',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handleResolve = (issue: Issue) => {
    setSelectedIssueForResolve(issue);
  };

  const handleResolveSubmit = (issueId: number, resolutionNotes: string) => {
    resolveIssue.mutate(
      { issueId, resolutionNotes },
      {
        onSuccess: () => {
          setSelectedIssueForResolve(null);
        },
      }
    );
  };

  const handleDelete = (issueId: number) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setIssueToDelete(issue);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!issueToDelete) return;

    try {
      await deleteIssue.mutateAsync(issueToDelete.id);
      setIsDeleteDialogOpen(false);
      setIssueToDelete(null);
      
      toaster.create({
        title: 'Issue Deleted',
        description: 'Issue has been deleted successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toaster.create({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete issue',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Issues">
        <ErrorState
          title="Failed to load issues"
          error={error}
          onRetry={handleRefresh}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Issues">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <PageHeader
          title="Issue Management"
          description="Track and manage issues raised by customers"
        />

        {/* Stats */}
        <IssueStatsGrid
          total={stats.total}
          open={stats.open}
          inProgress={stats.inProgress}
          resolved={stats.resolved}
          closed={stats.closed}
          byPriority={stats.byPriority}
          byCategory={stats.byCategory}
        />

        {/* Filters */}
        <IssueFiltersPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : (
          <IssuesDataTable
            issues={issues}
            onView={handleView}
            onEdit={handleEdit}
            onResolve={handleResolve}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Modals */}
        {selectedIssueForResolve && (
          <ResolveIssueModal
            isOpen={!!selectedIssueForResolve}
            issue={selectedIssueForResolve}
            onClose={() => setSelectedIssueForResolve(null)}
            onSubmit={handleResolveSubmit}
            isLoading={resolveIssue.isPending}
          />
        )}

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
          isLoading={deleteIssue.isPending}
        />
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeIssuesPage;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, Box, Spinner, Text, HStack } from '@chakra-ui/react';
import { FiPlus, FiRefreshCw, FiDownload } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { IssueStatsGrid, IssueFiltersPanel, IssuesDataTable, CreateIssueModal, ResolveIssueModal } from '../components/issues';
import { ErrorState, PageHeader, StandardButton, ConfirmDialog } from '../components/common';
import { RequirePermission } from '../components/guards/RequirePermission';
import { useIssues, useIssueStats, useIssueMutations } from '../hooks/useIssues';
import { useProfile } from '../contexts/ProfileContext';
import { issueService } from '../services/issue.service';
import type { Issue, IssuePriority, IssueStatus, IssueCategory } from '../types';
import { toaster } from '../components/ui/toaster';

const IssuesPage = () => {
  const navigate = useNavigate();
  const { activeProfileType } = useProfile();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssueForResolve, setSelectedIssueForResolve] = useState<Issue | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);
  
  // Only customers can raise issues - vendors and employees can only view and update
  const canRaiseIssue = activeProfileType === 'customer';
  // Vendors and employees can fetch from Linear
  const canFetchFromLinear = activeProfileType === 'vendor' || activeProfileType === 'employee';
  
  // Fetch from Linear state
  const [isFetchingFromLinear, setIsFetchingFromLinear] = useState(false);
  const [linearIssues, setLinearIssues] = useState<any[]>([]);
  const [showLinearIssues, setShowLinearIssues] = useState(false);
  
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

  // Get organization ID
  const { activeOrganizationId } = useProfile();
  
  // Check if organization is missing
  if (!activeOrganizationId) {
    return (
      <DashboardLayout title="Issues">
        <ErrorState
          title="Organization Required"
          error={new Error("Please select an active profile with an organization to view issues.")}
          onRetry={() => window.location.reload()}
        />
      </DashboardLayout>
    );
  }
  
  // Fetch data
  const { data: issuesData, isLoading, error, refetch } = useIssues(apiFilters);
  const issues = issuesData?.results || [];
  const { data: statsData, refetch: refetchStats } = useIssueStats();

  // Mutations
  const { createIssue, updateIssue, deleteIssue, resolveIssue } = useIssueMutations();

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
      const response = await updateIssue.mutateAsync({
        id: issueId,
        data: { status: newStatus },
      });
      
      const message = response.linear_synced 
        ? `Issue status changed to ${newStatus} and synced to Linear`
        : `Issue status changed to ${newStatus}`;
      
      toaster.create({
        title: 'Status Updated',
        description: message,
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

  const handleCreateSubmit = async (data: any) => {
    try {
      await createIssue.mutateAsync(data);
      setIsCreateDialogOpen(false);
      
      toaster.create({
        title: 'Issue Created',
        description: 'New issue has been created successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Creation Failed',
        description: 'Failed to create issue',
        type: 'error',
        duration: 3000,
      });
    }
  };


  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  const handleFetchFromLinear = async (syncToCrm: boolean = false) => {
    if (!canFetchFromLinear) {
      toaster.create({
        title: 'Permission Denied',
        description: 'Only vendors and employees can fetch issues from Linear',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsFetchingFromLinear(true);
    try {
      const response = await issueService.fetchFromLinear(50, syncToCrm);
      setLinearIssues(response.linear_issues || []);
      setShowLinearIssues(true);
      
      const message = syncToCrm
        ? `Fetched ${response.linear_issues?.length || 0} issues from Linear and synced ${response.synced_issues?.length || 0} to CRM`
        : `Fetched ${response.linear_issues?.length || 0} issues from Linear`;
      
      toaster.create({
        title: 'Issues Fetched',
        description: message,
        type: 'success',
        duration: 5000,
      });
      
      // Refresh local issues if synced
      if (syncToCrm) {
        refetch();
        refetchStats();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.details || error.message || 'Failed to fetch issues from Linear';
      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsFetchingFromLinear(false);
    }
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
      <RequirePermission resource="issues">
        <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <PageHeader
          title="Issue Management"
          description={
            canRaiseIssue 
              ? "Raise and track issues across vendors, orders, and projects"
              : "Track and manage issues raised by customers"
          }
          actions={
            <>
              <StandardButton
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoading}
                leftIcon={<FiRefreshCw />}
              >
                Refresh
              </StandardButton>
              {canFetchFromLinear && (
                <>
                  <StandardButton
                    variant="outline"
                    onClick={() => handleFetchFromLinear(false)}
                    disabled={isFetchingFromLinear}
                    leftIcon={<FiDownload />}
                  >
                    {isFetchingFromLinear ? 'Fetching...' : 'Fetch from Linear'}
                  </StandardButton>
                  <StandardButton
                    variant="primary"
                    onClick={() => handleFetchFromLinear(true)}
                    disabled={isFetchingFromLinear}
                    leftIcon={<FiDownload />}
                  >
                    {isFetchingFromLinear ? 'Syncing...' : 'Sync from Linear'}
                  </StandardButton>
                </>
              )}
              {canRaiseIssue && (
                <StandardButton
                  variant="primary"
                  onClick={() => setIsCreateDialogOpen(true)}
                  leftIcon={<FiPlus />}
                >
                  Raise Issue
                </StandardButton>
              )}
            </>
          }
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
          <>
            {/* Issues Table */}
            <IssuesDataTable
              issues={issues}
              onView={handleView}
              onEdit={handleEdit}
              onResolve={handleResolve}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
            />

            {/* Empty State */}
            {issues.length === 0 && (
              <Box textAlign="center" py={12}>
                <Text color="gray.500" fontSize="lg" mb={4}>
                  {canRaiseIssue 
                    ? "No issues found matching your filters"
                    : "No issues have been raised by customers yet"}
                </Text>
                {canRaiseIssue && (
                  <StandardButton
                    onClick={() => setIsCreateDialogOpen(true)}
                    variant="primary"
                    leftIcon={<FiPlus />}
                  >
                    Raise Your First Issue
                  </StandardButton>
                )}
              </Box>
            )}
          </>
        )}

        {/* Modals */}
        <CreateIssueModal
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateSubmit}
          isLoading={createIssue.isPending}
        />

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
      </RequirePermission>
    </DashboardLayout>
  );
};

export default IssuesPage;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner, Button, HStack, Badge } from '@chakra-ui/react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { IssueStatsGrid, IssueFiltersPanel, IssuesDataTable, CreateIssueModal, RaiseIssueModal, ResolveIssueModal } from '../components/issues';
import { ErrorState } from '../components/common';
import { useIssues, useIssueStats, useIssueMutations } from '../hooks/useIssues';
import type { Issue, IssuePriority, IssueStatus, IssueCategory } from '../types';
import { toaster } from '../components/ui/toaster';

const IssuesPage = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRaiseDialogOpen, setIsRaiseDialogOpen] = useState(false);
  const [selectedIssueForResolve, setSelectedIssueForResolve] = useState<Issue | null>(null);
  
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
  const { createIssue, updateIssue, deleteIssue, raiseIssue, resolveIssue } = useIssueMutations();

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
    } catch (error) {
      toaster.create({
        title: 'Update Failed',
        description: 'Failed to update issue status',
        type: 'error',
        duration: 3000,
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

  const handleDelete = async (issueId: number) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      await deleteIssue.mutateAsync(issueId);
      
      toaster.create({
        title: 'Issue Deleted',
        description: 'Issue has been deleted successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Delete Failed',
        description: 'Failed to delete issue',
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

  const handleRaiseSubmit = async (data: any) => {
    try {
      await raiseIssue.mutateAsync(data);
      setIsRaiseDialogOpen(false);
      
      toaster.create({
        title: 'Issue Raised',
        description: data.auto_sync_linear 
          ? 'Issue raised and synced to Linear successfully' 
          : 'Issue raised successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Raise Failed',
        description: 'Failed to raise issue',
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
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={2}>
            <Box>
              <Heading size="xl" color="gray.900" mb={2}>
                Issue Management
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Track and manage issues across vendors, orders, and projects
              </Text>
            </Box>
            
            <HStack gap={3}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <FiRefreshCw />
                <Text ml={2}>Refresh</Text>
              </Button>
              
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                colorPalette="purple"
                size="sm"
              >
                <FiPlus />
                <Text ml={2}>Create Issue</Text>
              </Button>
              
              <Button
                onClick={() => setIsRaiseDialogOpen(true)}
                colorPalette="red"
                size="sm"
              >
                <FiPlus />
                <Text ml={2}>Raise Issue</Text>
              </Button>
            </HStack>
          </HStack>

          {/* Linear Integration Badge */}
          <Badge colorPalette="blue" size="sm" mt={2}>
            Linear Integration Enabled
          </Badge>
        </Box>

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
                  No issues found matching your filters
                </Text>
                <Button
                  onClick={() => setIsRaiseDialogOpen(true)}
                  colorPalette="purple"
                  size="sm"
                >
                  <FiPlus />
                  <Text ml={2}>Raise Your First Issue</Text>
                </Button>
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

        <RaiseIssueModal
          isOpen={isRaiseDialogOpen}
          onClose={() => setIsRaiseDialogOpen(false)}
          onSubmit={handleRaiseSubmit}
          isLoading={raiseIssue.isPending}
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
      </VStack>
    </DashboardLayout>
  );
};

export default IssuesPage;

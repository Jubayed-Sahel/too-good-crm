import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { IssueStats, IssueFilters, IssuesTable, CreateIssueDialog } from '../components/client-issues';
import { ErrorState } from '../components/common';
import type { Issue as ComponentIssue, CreateIssueData as ComponentCreateIssueData } from '../components/client-issues';
import { useIssues, useIssueStats, useIssueMutations } from '../hooks/useIssues';
import type { Issue as BackendIssue, IssuePriority } from '../types';

const ClientIssuesPage = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  // Mutations
  const { createIssue, deleteIssue, resolveIssue } = useIssueMutations();

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
    navigate(`/client/issues/${issue.id}`);
  };

  const handleResolve = (issueId: string) => {
    resolveIssue.mutate(Number(issueId));
  };

  const handleDelete = (issueId: string) => {
    deleteIssue.mutate(Number(issueId));
  };

  const handleSubmit = (data: ComponentCreateIssueData) => {
    // Map component data to backend format
    const backendData = {
      title: data.title,
      description: data.description,
      priority: data.priority === 'urgent' ? 'critical' : data.priority as IssuePriority,
      category: data.category as any,
      status: 'open' as any, // New issues start as open
      vendor: 1, // TODO: Get from vendor selection
      order: data.orderNumber ? Number(data.orderNumber) : undefined,
    };

    createIssue.mutate(backendData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
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
          <Heading size="xl" color="gray.900" mb={2}>
            Issues
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
          onCreateIssue={() => setIsCreateDialogOpen(true)}
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
              onComplete={handleResolve}
              onDelete={handleDelete}
            />

            {/* Empty State */}
            {issues.length === 0 && (
              <Box textAlign="center" py={12}>
                <Text color="gray.500" fontSize="lg">
                  No issues found matching your filters
                </Text>
              </Box>
            )}

            {/* Create Issue Dialog */}
            <CreateIssueDialog
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleSubmit}
              isLoading={createIssue.isPending}
            />
          </>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssuesPage;

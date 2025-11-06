import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { toaster } from '../components/ui/toaster';
import { IssueStats, IssueFilters, IssuesTable, CreateIssueDialog } from '../components/client-issues';
import type { Issue, CreateIssueData } from '../components/client-issues';

const ClientIssuesPage = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data for issues
  const issues: Issue[] = [
    {
      id: '1',
      issueNumber: 'ISS-2024-001',
      title: 'Delayed Project Delivery',
      description: 'Website development project is 2 weeks behind schedule',
      vendor: 'Tech Solutions Inc',
      orderNumber: 'ORD-2024-001',
      priority: 'high',
      status: 'in_progress',
      category: 'delivery',
      createdAt: '2024-02-20',
      updatedAt: '2024-02-22',
    },
    {
      id: '2',
      issueNumber: 'ISS-2024-002',
      title: 'Invoice Discrepancy',
      description: 'Received invoice amount does not match quoted price',
      vendor: 'Marketing Pro',
      orderNumber: 'ORD-2024-002',
      priority: 'medium',
      status: 'resolved',
      category: 'billing',
      createdAt: '2024-02-18',
      updatedAt: '2024-02-19',
    },
    {
      id: '3',
      issueNumber: 'ISS-2024-003',
      title: 'Poor Communication',
      description: 'Vendor not responding to emails and messages',
      vendor: 'Design Studio',
      priority: 'medium',
      status: 'open',
      category: 'communication',
      createdAt: '2024-02-25',
      updatedAt: '2024-02-25',
    },
    {
      id: '4',
      issueNumber: 'ISS-2024-004',
      title: 'Quality Issues',
      description: 'Delivered work does not meet agreed specifications',
      vendor: 'Content Creators',
      orderNumber: 'ORD-2024-007',
      priority: 'urgent',
      status: 'in_progress',
      category: 'quality',
      createdAt: '2024-02-23',
      updatedAt: '2024-02-24',
    },
  ];

  // Filter issues based on search and filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.vendor.toLowerCase().includes(searchLower) ||
        issue.issueNumber.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [issues, searchQuery, statusFilter, priorityFilter]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  }), [issues]);

  // Handlers
  const handleView = (issue: Issue) => {
    navigate(`/client/issues/${issue.id}`);
  };

  const handleResolve = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    console.log('Complete issue:', issue);
    toaster.create({
      title: 'Issue Completed',
      description: `Issue has been marked as complete.`,
      type: 'success',
      duration: 3000,
    });
    // In real app, make API call to update status
  };

  const handleDelete = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    console.log('Delete issue:', issue);
    toaster.create({
      title: 'Issue Deleted',
      description: `Issue has been deleted.`,
      type: 'info',
      duration: 3000,
    });
    // In real app, make API call to delete
  };

  const handleSubmit = (data: CreateIssueData) => {
    toaster.create({
      title: 'Issue Submitted',
      description: `Your issue "${data.title}" has been logged and will be addressed soon.`,
      type: 'success',
      duration: 5000,
    });

    setIsCreateDialogOpen(false);
  };

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
        {false ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : (
          <>
            {/* Issues Table */}
            <IssuesTable
              issues={filteredIssues}
              onView={handleView}
              onComplete={handleResolve}
              onDelete={handleDelete}
            />

            {/* Create Issue Dialog */}
            <CreateIssueDialog
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssuesPage;

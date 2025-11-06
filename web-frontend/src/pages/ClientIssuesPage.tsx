import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Button, Input, Textarea, NativeSelectRoot, NativeSelectField, Grid, HStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { toaster } from '../components/ui/toaster';
import { IssueStats, IssueFilters, IssuesTable } from '../components/client-issues';
import type { Issue } from '../components/client-issues';
import { FiXCircle } from 'react-icons/fi';

const ClientIssuesPage = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vendor: '',
    orderNumber: '',
    priority: 'medium',
    category: 'general',
  });

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

  const vendors = ['Tech Solutions Inc', 'Marketing Pro', 'Design Studio', 'Cloud Services', 'Content Creators'];
  
  const categories = [
    { value: 'general', label: 'General Issue' },
    { value: 'delivery', label: 'Delivery Delay' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'billing', label: 'Billing Problem' },
    { value: 'communication', label: 'Communication Issue' },
    { value: 'technical', label: 'Technical Problem' },
    { value: 'other', label: 'Other' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.vendor) {
      toaster.create({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    toaster.create({
      title: 'Issue Submitted',
      description: `Your issue "${formData.title}" has been logged and will be addressed soon.`,
      type: 'success',
      duration: 5000,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      vendor: '',
      orderNumber: '',
      priority: 'medium',
      category: 'general',
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
        {isLoading ? (
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

            {/* Create Issue Form */}
            {isCreateDialogOpen && (
              <Card>
                <form onSubmit={handleSubmit}>
                  <VStack align="stretch" gap={5}>
                    <HStack justify="space-between">
                      <Heading size="lg" color="gray.900">
                        Lodge New Issue
                      </Heading>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        <FiXCircle size={20} />
                      </Button>
                    </HStack>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                          Issue Title *
                        </Text>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Brief description of the issue"
                          size="lg"
                          required
                        />
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                          Vendor *
                        </Text>
                        <NativeSelectRoot size="lg">
                          <NativeSelectField
                            value={formData.vendor}
                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                          >
                            <option value="">Select vendor</option>
                            {vendors.map(vendor => (
                              <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                          Category *
                        </Text>
                        <NativeSelectRoot size="lg">
                          <NativeSelectField
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                          Priority *
                        </Text>
                        <NativeSelectRoot size="lg">
                          <NativeSelectField
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                          Related Order Number (Optional)
                        </Text>
                        <Input
                          value={formData.orderNumber}
                          onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                          placeholder="e.g., ORD-2024-001"
                          size="lg"
                        />
                      </Box>
                    </Grid>

                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Description *
                      </Text>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide detailed information about the issue..."
                        rows={6}
                        size="lg"
                        required
                      />
                    </Box>

                    <HStack gap={3} justify="flex-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        colorPalette="blue"
                        size="lg"
                      >
                        Submit Issue
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </Card>
            )}
          </>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssuesPage;

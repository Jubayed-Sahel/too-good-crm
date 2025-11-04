import { useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, Badge, SimpleGrid, Input, Textarea, NativeSelectRoot, NativeSelectField, Grid } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { toaster } from '../components/ui/toaster';
import { FiAlertCircle, FiPlus, FiClock, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi';

interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  vendor: string;
  orderNumber?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  updatedAt: string;
}

const ClientIssuesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'blue';
      case 'in_progress':
        return 'orange';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: Issue['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
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
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="2xl" color="gray.900" mb={2}>
              Issues & Support
            </Heading>
            <Text fontSize="md" color="gray.600">
              Report and track issues with your vendors and orders
            </Text>
          </Box>
          <Button
            colorPalette="blue"
            size="lg"
            onClick={() => setIsCreateDialogOpen(!isCreateDialogOpen)}
          >
            <HStack gap={2}>
              <FiPlus size={20} />
              <Text>Lodge Issue</Text>
            </HStack>
          </Button>
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Total Issues
                </Text>
                <Box p={2} bg="purple.100" borderRadius="md" color="purple.600">
                  <FiAlertCircle size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.total}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Open
                </Text>
                <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                  <FiMessageSquare size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.open}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  In Progress
                </Text>
                <Box p={2} bg="orange.100" borderRadius="md" color="orange.600">
                  <FiClock size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.inProgress}
              </Heading>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Resolved
                </Text>
                <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                  <FiCheckCircle size={18} />
                </Box>
              </HStack>
              <Heading size="xl" color="gray.900">
                {stats.resolved}
              </Heading>
            </VStack>
          </Card>
        </SimpleGrid>

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

        {/* Issues List */}
        <VStack align="stretch" gap={4}>
          <Heading size="md" color="gray.900">
            Your Issues
          </Heading>

          {issues.map(issue => (
            <Card key={issue.id}>
              <VStack align="stretch" gap={4}>
                {/* Issue Header */}
                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <HStack gap={3}>
                    <Box
                      p={3}
                      bg={`${getPriorityColor(issue.priority)}.100`}
                      borderRadius="lg"
                      color={`${getPriorityColor(issue.priority)}.600`}
                    >
                      <FiAlertCircle size={24} />
                    </Box>
                    <Box>
                      <Heading size="md" color="gray.900">
                        {issue.issueNumber}
                      </Heading>
                      <Text fontSize="sm" color="gray.600">
                        {issue.vendor}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack gap={2}>
                    <Badge colorPalette={getPriorityColor(issue.priority)} size="lg">
                      {issue.priority.toUpperCase()}
                    </Badge>
                    <Badge colorPalette={getStatusColor(issue.status)} size="lg">
                      {getStatusLabel(issue.status)}
                    </Badge>
                  </HStack>
                </HStack>

                {/* Issue Details */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={1}>
                    {issue.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {issue.description}
                  </Text>
                </Box>

                {/* Issue Info */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.600">Category</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="capitalize">
                      {issue.category}
                    </Text>
                  </Box>

                  {issue.orderNumber && (
                    <Box>
                      <Text fontSize="xs" color="gray.600">Order Number</Text>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        {issue.orderNumber}
                      </Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontSize="xs" color="gray.600">Created</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.600">Last Updated</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {new Date(issue.updatedAt).toLocaleDateString()}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Action Button */}
                <HStack gap={3} pt={2}>
                  <Button size="sm" variant="outline" colorPalette="blue">
                    View Details
                  </Button>
                  {issue.status !== 'resolved' && issue.status !== 'closed' && (
                    <Button size="sm" variant="outline" colorPalette="purple">
                      Add Comment
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Card>
          ))}
        </VStack>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientIssuesPage;

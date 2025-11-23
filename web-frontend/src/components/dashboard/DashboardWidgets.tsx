/**
 * Dashboard Widgets
 * Permission-aware dashboard widgets for CRM modules
 * 
 * Each widget only renders if the user has the required permissions
 */
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  SimpleGrid, 
  Button,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { Card } from '@/components/common';
import { 
  FiUsers, 
  FiFileText, 
  FiUserPlus, 
  FiActivity, 
  FiCheckSquare,
  FiTrendingUp,
  FiBriefcase,
  FiList,
  FiGrid,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionContext';
import { usePermissionActions } from '@/hooks/usePermissionActions';
import { Can } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

/**
 * Leads Widget
 * Shows recent leads and quick actions
 */
export const LeadsWidget = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermissions();
  const permissions = usePermissionActions(CRM_RESOURCES.LEADS);

  // Don't render while permissions are loading
  if (isLoading) {
    return null;
  }

  // Check if user has read permission for leads
  const canRead = hasPermission(CRM_RESOURCES.LEADS, 'read').hasPermission;

  if (!canRead) {
    return null;
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon as={FiUserPlus} w={5} h={5} color="green.600" />
            <Heading size="md">Leads</Heading>
          </HStack>
          <Badge colorPalette="green">12 New</Badge>
        </HStack>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Total Leads</Text>
            <Text fontWeight="bold">245</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Qualified</Text>
            <Text fontWeight="bold" color="green.600">89</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Conversion Rate</Text>
            <Text fontWeight="bold">36.3%</Text>
          </HStack>
        </VStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/leads')}
            flex={1}
          >
            View All
          </Button>
          {permissions.canCreate && (
            <Button
              size="sm"
              colorPalette="green"
              onClick={() => navigate('/leads?action=create')}
              flex={1}
            >
              New Lead
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

/**
 * Deals Widget
 * Shows pipeline and deal statistics
 */
export const DealsWidget = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermissions();
  const permissions = usePermissionActions(CRM_RESOURCES.DEALS);

  // Don't render while permissions are loading
  if (isLoading) {
    return null;
  }

  const canRead = hasPermission(CRM_RESOURCES.DEALS, 'read').hasPermission;

  if (!canRead) {
    return null;
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon as={FiFileText} w={5} h={5} color="blue.600" />
            <Heading size="md">Deals</Heading>
          </HStack>
          <Badge colorPalette="blue">$2.4M</Badge>
        </HStack>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Active Deals</Text>
            <Text fontWeight="bold">34</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Won This Month</Text>
            <Text fontWeight="bold" color="green.600">12</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Pipeline Value</Text>
            <Text fontWeight="bold">$2.4M</Text>
          </HStack>
        </VStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/deals')}
            flex={1}
          >
            View Pipeline
          </Button>
          {permissions.canCreate && (
            <Button
              size="sm"
              colorPalette="blue"
              onClick={() => navigate('/deals?action=create')}
              flex={1}
            >
              New Deal
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

/**
 * Customers Widget
 * Shows customer statistics and recent activity
 */
export const CustomersWidget = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermissions();
  const permissions = usePermissionActions(CRM_RESOURCES.CUSTOMERS);

  // Don't render while permissions are loading
  if (isLoading) {
    return null;
  }

  const canRead = hasPermission(CRM_RESOURCES.CUSTOMERS, 'read').hasPermission;

  if (!canRead) {
    return null;
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon as={FiUsers} w={5} h={5} color="purple.600" />
            <Heading size="md">Customers</Heading>
          </HStack>
          <Badge colorPalette="purple">Active</Badge>
        </HStack>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Total Customers</Text>
            <Text fontWeight="bold">1,234</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">New This Month</Text>
            <Text fontWeight="bold" color="green.600">+45</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Growth Rate</Text>
            <Text fontWeight="bold">+3.7%</Text>
          </HStack>
        </VStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/customers')}
            flex={1}
          >
            View All
          </Button>
          {permissions.canCreate && (
            <Button
              size="sm"
              colorPalette="purple"
              onClick={() => navigate('/customers?action=create')}
              flex={1}
            >
              New Customer
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

/**
 * Activities Widget
 * Shows recent activities and tasks
 */
export const ActivitiesWidget = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermissions();
  const permissions = usePermissionActions(CRM_RESOURCES.ACTIVITIES);

  // Don't render while permissions are loading
  if (isLoading) {
    return null;
  }

  const canRead = hasPermission(CRM_RESOURCES.ACTIVITIES, 'read').hasPermission;

  if (!canRead) {
    return null;
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon as={FiActivity} w={5} h={5} color="orange.600" />
            <Heading size="md">Activities</Heading>
          </HStack>
          <Badge colorPalette="orange">5 Today</Badge>
        </HStack>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Today's Activities</Text>
            <Text fontWeight="bold">5</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">This Week</Text>
            <Text fontWeight="bold">23</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Overdue</Text>
            <Text fontWeight="bold" color="red.600">2</Text>
          </HStack>
        </VStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/activities')}
            flex={1}
          >
            View All
          </Button>
          {permissions.canCreate && (
            <Button
              size="sm"
              colorPalette="orange"
              onClick={() => navigate('/activities?action=create')}
              flex={1}
            >
              New Activity
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

/**
 * Tasks Widget
 * Shows task statistics and quick actions
 */
export const TasksWidget = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermissions();
  const permissions = usePermissionActions(CRM_RESOURCES.TASKS);

  // Don't render while permissions are loading
  if (isLoading) {
    return null;
  }

  const canRead = hasPermission(CRM_RESOURCES.TASKS, 'read').hasPermission;

  if (!canRead) {
    return null;
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon as={FiCheckSquare} w={5} h={5} color="teal.600" />
            <Heading size="md">Tasks</Heading>
          </HStack>
          <Badge colorPalette="teal">8 Pending</Badge>
        </HStack>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Pending</Text>
            <Text fontWeight="bold">8</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Completed Today</Text>
            <Text fontWeight="bold" color="green.600">12</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Completion Rate</Text>
            <Text fontWeight="bold">85%</Text>
          </HStack>
        </VStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/tasks')}
            flex={1}
          >
            View All
          </Button>
          {permissions.canCreate && (
            <Button
              size="sm"
              colorPalette="teal"
              onClick={() => navigate('/tasks?action=create')}
              flex={1}
            >
              New Task
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

/**
 * Pipelines Widget
 * Shows pipeline overview
 */
export const PipelinesWidget = () => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePermissions();
  const permissions = usePermissionActions(CRM_RESOURCES.PIPELINES);

  // Don't render while permissions are loading
  if (isLoading) {
    return null;
  }

  const canRead = hasPermission(CRM_RESOURCES.PIPELINES, 'read').hasPermission;

  if (!canRead) {
    return null;
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon as={FiGrid} w={5} h={5} color="indigo.600" />
            <Heading size="md">Pipelines</Heading>
          </HStack>
          <Badge colorPalette="indigo">3 Active</Badge>
        </HStack>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Active Pipelines</Text>
            <Text fontWeight="bold">3</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Total Stages</Text>
            <Text fontWeight="bold">15</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Avg. Deal Value</Text>
            <Text fontWeight="bold">$45K</Text>
          </HStack>
        </VStack>

        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/pipelines')}
        >
          Manage Pipelines
        </Button>
      </VStack>
    </Card>
  );
};

/**
 * Dashboard Widgets Grid
 * Renders all available widgets based on permissions
 */
export const DashboardWidgetsGrid = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
      <LeadsWidget />
      <DealsWidget />
      <CustomersWidget />
      <ActivitiesWidget />
      <TasksWidget />
      <PipelinesWidget />
    </SimpleGrid>
  );
};


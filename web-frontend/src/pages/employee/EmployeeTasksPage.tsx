import { Box, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { PageHeader, StandardButton, Card } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionContext';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'deal' | 'lead' | 'customer' | 'activity' | 'issue';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedBy?: string;
}

const EmployeeTasksPage = () => {
  const navigate = useNavigate();
  const { canAccess } = usePermissions();

  // Mock tasks - in real app, fetch from API
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Follow up with Acme Corp',
      description: 'Call to discuss proposal details',
      type: 'deal',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-01-15',
      assignedBy: 'John Manager',
    },
    {
      id: '2',
      title: 'Qualify new lead - Tech Startup',
      description: 'Review lead information and schedule call',
      type: 'lead',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-01-14',
      assignedBy: 'Sarah Lead',
    },
    {
      id: '3',
      title: 'Update customer profile',
      description: 'Add recent purchase information',
      type: 'customer',
      status: 'pending',
      priority: 'low',
      dueDate: '2024-01-16',
      assignedBy: 'Mike Admin',
    },
  ].filter(task => {
    // Filter tasks based on permissions
    const resourceMap: Record<string, string> = {
      'deal': 'deals',
      'lead': 'leads',
      'customer': 'customers',
      'activity': 'activities',
      'issue': 'issues',
    };
    return canAccess(resourceMap[task.type] || 'activities');
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return FiCheckCircle;
      case 'in_progress': return FiClock;
      case 'pending': return FiAlertCircle;
      default: return FiAlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const getTypePath = (type: string, id: string) => {
    const pathMap: Record<string, string> = {
      'deal': `/employee/deals/${id}`,
      'lead': `/employee/leads/${id}`,
      'customer': `/employee/customers/${id}`,
      'activity': `/employee/activities/${id}`,
      'issue': `/issues/${id}`,
    };
    return pathMap[type] || '#';
  };

  return (
    <DashboardLayout title="My Tasks">
      <VStack align="stretch" gap={6}>
        <PageHeader
          title="My Tasks"
          description="View and manage your assigned tasks and activities"
          actions={
            <StandardButton
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={() => navigate('/employee/activities')}
            >
              New Activity
            </StandardButton>
          }
        />

        {tasks.length === 0 ? (
          <Card p={8}>
            <VStack gap={4}>
              <Box
                w={16}
                h={16}
                bg="gray.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiCheckCircle size={32} color="#CBD5E0" />
              </Box>
              <Heading size="md" color="gray.700">
                No Tasks Assigned
              </Heading>
              <Text color="gray.600" textAlign="center" maxW="400px">
                You don't have any assigned tasks at the moment. Your manager will assign tasks to you here.
              </Text>
            </VStack>
          </Card>
        ) : (
          <VStack align="stretch" gap={4}>
            {tasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              return (
                <Card
                  key={task.id}
                  p={5}
                  cursor="pointer"
                  _hover={{
                    boxShadow: 'lg',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  onClick={() => navigate(getTypePath(task.type, task.id))}
                >
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={1} flex={1}>
                        <Heading size="sm" color="gray.900">
                          {task.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.600">
                          {task.description}
                        </Text>
                      </VStack>
                      <HStack gap={2}>
                        <Badge colorPalette={getStatusColor(task.status)} size="sm">
                          <StatusIcon style={{ marginRight: '4px' }} />
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge colorPalette={getPriorityColor(task.priority)} size="sm" variant="subtle">
                          {task.priority}
                        </Badge>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <HStack gap={4}>
                        {task.dueDate && (
                          <Text>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                        )}
                        {task.assignedBy && (
                          <Text>
                            Assigned by: {task.assignedBy}
                          </Text>
                        )}
                      </HStack>
                      <Badge colorPalette="purple" size="xs" textTransform="capitalize">
                        {task.type}
                      </Badge>
                    </HStack>
                  </VStack>
                </Card>
              );
            })}
          </VStack>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeTasksPage;

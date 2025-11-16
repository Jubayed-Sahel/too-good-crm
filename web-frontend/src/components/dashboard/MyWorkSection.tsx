/**
 * My Work Section - Shows employee's assigned work
 * Displays recent activities, assigned deals, leads, etc.
 */
import { VStack, HStack, Text, Box, Heading, Badge } from '@chakra-ui/react';
import { FiFileText, FiUserPlus, FiUsers, FiActivity, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionContext';
import { StandardButton, Card } from '@/components/common';

interface MyWorkItem {
  id: string;
  type: 'deal' | 'lead' | 'customer' | 'activity';
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
  path: string;
}

export const MyWorkSection = () => {
  const navigate = useNavigate();
  const { canAccess } = usePermissions();

  // Mock data - in real app, fetch from API
  const myWorkItems: MyWorkItem[] = [
    // Only show items for resources employee has access to
    ...(canAccess('deals') ? [{
      id: '1',
      type: 'deal' as const,
      title: 'Enterprise Deal - Acme Corp',
      subtitle: '$50,000 • Negotiation',
      status: 'active',
      date: '2 days ago',
      path: '/employee/deals/1',
    }] : []),
    ...(canAccess('leads') ? [{
      id: '2',
      type: 'lead' as const,
      title: 'New Lead - Tech Startup',
      subtitle: 'Qualified • High Priority',
      status: 'new',
      date: '1 day ago',
      path: '/employee/leads/2',
    }] : []),
    ...(canAccess('customers') ? [{
      id: '3',
      type: 'customer' as const,
      title: 'Customer Follow-up',
      subtitle: 'Needs attention',
      status: 'pending',
      date: '3 days ago',
      path: '/employee/customers/3',
    }] : []),
    ...(canAccess('activities') ? [{
      id: '4',
      type: 'activity' as const,
      title: 'Call Scheduled',
      subtitle: 'Tomorrow at 2:00 PM',
      status: 'scheduled',
      date: 'Today',
      path: '/employee/activities/4',
    }] : []),
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'deal': return FiFileText;
      case 'lead': return FiUserPlus;
      case 'customer': return FiUsers;
      case 'activity': return FiActivity;
      default: return FiFileText;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'new': return 'green';
      case 'pending': return 'orange';
      case 'scheduled': return 'purple';
      default: return 'gray';
    }
  };

  if (myWorkItems.length === 0) {
    return (
      <Card p={6}>
        <VStack gap={3}>
          <Heading size="md" color="gray.700">
            My Work
          </Heading>
          <Text color="gray.500" fontSize="sm" textAlign="center">
            No assigned work items yet. Your assigned tasks and activities will appear here.
          </Text>
        </VStack>
      </Card>
    );
  }

  return (
    <Card p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Heading size="md" color="gray.700">
            My Work
          </Heading>
          <StandardButton
            variant="ghost"
            size="xs"
            onClick={() => navigate('/employee/tasks')}
          >
            View All
            <FiArrowRight style={{ marginLeft: '4px' }} />
          </StandardButton>
        </HStack>

        <VStack align="stretch" gap={3}>
          {myWorkItems.slice(0, 5).map((item) => {
            const Icon = getIcon(item.type);
            return (
              <Box
                key={item.id}
                p={4}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{
                  bg: 'gray.100',
                  borderColor: 'blue.300',
                  transform: 'translateX(4px)',
                }}
                transition="all 0.2s"
                onClick={() => navigate(item.path)}
              >
                <HStack justify="space-between" align="start">
                  <HStack gap={3} flex={1}>
                    <Box
                      p={2}
                      bg="blue.50"
                      borderRadius="md"
                      color="blue.600"
                    >
                      <Icon size={18} />
                    </Box>
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text fontSize="xs" color="gray.600">
                          {item.subtitle}
                        </Text>
                      )}
                      <HStack gap={2}>
                        {item.status && (
                          <Badge colorPalette={getStatusColor(item.status)} size="xs">
                            {item.status}
                          </Badge>
                        )}
                        {item.date && (
                          <Text fontSize="xs" color="gray.500">
                            {item.date}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                  <FiArrowRight color="#718096" size={16} />
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
};


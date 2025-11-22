import { Box, Text, VStack, HStack, Badge, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { FiPhone, FiMail, FiCalendar, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { useRecentActivities } from '@/hooks/useAnalytics';

const RecentActivities = () => {
  const { data: activities, isLoading, error } = useRecentActivities(6);

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading recent activities...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load recent activities</Text>
        </VStack>
      </Card>
    );
  }

  const activitiesList = activities || [];
  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call': return <FiPhone size={14} />;
      case 'email': return <FiMail size={14} />;
      case 'meeting': return <FiCalendar size={14} />;
      case 'deal': return <FiCheckCircle size={14} />;
      case 'comment': return <FiMessageSquare size={14} />;
      default: return <FiCheckCircle size={14} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call': return 'blue';
      case 'email': return 'purple';
      case 'meeting': return 'orange';
      case 'deal': return 'green';
      case 'comment': return 'cyan';
      default: return 'gray';
    }
  };

  const formatActivityTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch {
      return dateString || 'recently';
    }
  };

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <Text 
          fontSize="sm" 
          fontWeight="semibold"
          color="gray.600"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Recent Activities
        </Text>

        <VStack align="stretch" gap={3}>
          {activitiesList.length > 0 ? (
            activitiesList.map((activity: any, index: number) => {
              // Map activity type
              const activityType = activity.activity_type || activity.type || 'note';
              
              // Get activity title
              let activityTitle = activity.title || 'Activity';
              
              // Enhance title based on related entity
              if (activity.deal_name && !activityTitle.includes(activity.deal_name)) {
                activityTitle = `${activityTitle} - ${activity.deal_name}`;
              } else if (activity.customer_name && !activityTitle.includes(activity.customer_name)) {
                activityTitle = `${activityTitle} - ${activity.customer_name}`;
              } else if (activity.lead_name && !activityTitle.includes(activity.lead_name)) {
                activityTitle = `${activityTitle} - ${activity.lead_name}`;
              }
              
              // Get user name
              const activityUser = activity.assigned_to_name 
                || activity.created_by_name
                || (activity.created_by?.first_name && activity.created_by?.last_name
                  ? `${activity.created_by.first_name} ${activity.created_by.last_name}`
                  : activity.created_by?.email || 'Unknown');
              
              // Format time
              const activityTime = formatActivityTime(activity.created_at || new Date().toISOString());
              
              return (
                <Box key={activity.id || index}>
                  <HStack
                    gap={3}
                    py={3}
                    _hover={{ bg: 'gray.50' }}
                    px={2}
                    mx={-2}
                    borderRadius="md"
                    transition="all 0.2s"
                  >
                    <Box
                      minW="8"
                      h="8"
                      borderRadius="full"
                      bg={`${getActivityColor(activityType)}.50`}
                      color={`${getActivityColor(activityType)}.600`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {getActivityIcon(activityType)}
                    </Box>

                    <VStack align="stretch" gap={0.5} flex="1">
                      <Text fontSize="sm" color="gray.900" fontWeight="semibold">
                        {activityTitle}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                          by {activityUser}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          •
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {activityTime}
                        </Text>
                      </HStack>
                    </VStack>

                    {activity.status && (
                      <Badge
                        colorPalette={activity.status === 'won' || activity.status === 'completed' ? 'green' : 'gray'}
                        size="sm"
                        variant="subtle"
                        px={2}
                        py={0.5}
                        fontSize="xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </HStack>
                  {index < activitiesList.length - 1 && (
                    <Box borderBottomWidth="1px" borderColor="gray.100" />
                  )}
                </Box>
              );
            })
          ) : (
            <Box py={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">No recent activities</Text>
            </Box>
          )}
        </VStack>

        <Box pt={2} borderTopWidth="1px" borderColor="gray.100">
          <Text 
            fontSize="sm" 
            color="purple.600" 
            fontWeight="semibold" 
            textAlign="center" 
            cursor="pointer" 
            _hover={{ color: 'purple.700' }}
          >
            View All Activities
          </Text>
        </Box>
      </VStack>
    </Card>
  );
};

export default RecentActivities;

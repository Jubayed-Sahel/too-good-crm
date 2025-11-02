import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { Card } from '../common';
import { FiPhone, FiMail, FiCalendar, FiCheckCircle } from 'react-icons/fi';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'deal';
  title: string;
  user: string;
  time: string;
  status?: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

const RecentActivities = ({
  activities = [
    { id: '1', type: 'deal', title: 'Enterprise CRM Solution deal closed', user: 'John Smith', time: '5 minutes ago', status: 'won' },
    { id: '2', type: 'meeting', title: 'Product demo with TechCorp Inc.', user: 'Sarah Johnson', time: '1 hour ago' },
    { id: '3', type: 'call', title: 'Follow-up call with Digital Solutions', user: 'Michael Chen', time: '2 hours ago' },
    { id: '4', type: 'email', title: 'Proposal sent to Global Systems', user: 'Emily Davis', time: '3 hours ago' },
    { id: '5', type: 'deal', title: 'Mobile App Development moved to Negotiation', user: 'John Smith', time: '4 hours ago' },
    { id: '6', type: 'call', title: 'Discovery call with Startup Ventures', user: 'Sarah Johnson', time: '5 hours ago' },
  ]
}: RecentActivitiesProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <FiPhone size={14} />;
      case 'email': return <FiMail size={14} />;
      case 'meeting': return <FiCalendar size={14} />;
      case 'deal': return <FiCheckCircle size={14} />;
      default: return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'blue';
      case 'email': return 'purple';
      case 'meeting': return 'orange';
      case 'deal': return 'green';
      default: return 'gray';
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
          {activities.map((activity, index) => (
            <Box key={activity.id}>
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
                  bg={`${getActivityColor(activity.type)}.50`}
                  color={`${getActivityColor(activity.type)}.600`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {getActivityIcon(activity.type)}
                </Box>

                <VStack align="stretch" gap={0.5} flex="1">
                  <Text fontSize="sm" color="gray.900" fontWeight="semibold">
                    {activity.title}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      by {activity.user}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      •
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {activity.time}
                    </Text>
                  </HStack>
                </VStack>

                {activity.status && (
                  <Badge
                    colorPalette={activity.status === 'won' ? 'green' : 'gray'}
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
              {index < activities.length - 1 && (
                <Box borderBottomWidth="1px" borderColor="gray.100" />
              )}
            </Box>
          ))}
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

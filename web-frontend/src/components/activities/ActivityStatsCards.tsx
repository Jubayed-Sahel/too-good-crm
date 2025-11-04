import { Box, HStack, Text, SimpleGrid } from '@chakra-ui/react';
import { FiActivity, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import type { ActivityStats } from '@/types/activity.types';

interface ActivityStatsProps extends ActivityStats {
  isLoading?: boolean;
}

export const ActivityStatsCards = ({ 
  totalActivities,
  completedActivities,
  pendingActivities,
  scheduledActivities,
  isLoading = false 
}: ActivityStatsProps) => {
  const stats = [
    {
      label: 'Total Activities',
      value: totalActivities,
      icon: FiActivity,
      color: 'purple',
      bgColor: 'purple.50',
      iconColor: 'purple.600',
    },
    {
      label: 'Completed',
      value: completedActivities,
      icon: FiCheckCircle,
      color: 'green',
      bgColor: 'green.50',
      iconColor: 'green.600',
    },
    {
      label: 'Pending',
      value: pendingActivities,
      icon: FiClock,
      color: 'orange',
      bgColor: 'orange.50',
      iconColor: 'orange.600',
    },
    {
      label: 'Scheduled',
      value: scheduledActivities,
      icon: FiCalendar,
      color: 'blue',
      bgColor: 'blue.50',
      iconColor: 'blue.600',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>
      {stats.map((stat) => (
        <Box
          key={stat.label}
          bg="white"
          p={5}
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
          position="relative"
          overflow="hidden"
          _hover={{
            boxShadow: 'md',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          }}
        >
          <HStack justify="space-between" mb={3}>
            <Box
              p={3}
              bg={stat.bgColor}
              borderRadius="lg"
              color={stat.iconColor}
            >
              <stat.icon size={24} />
            </Box>
          </HStack>
          <Text fontSize="3xl" fontWeight="bold" color="gray.900" mb={1}>
            {isLoading ? '-' : stat.value}
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {stat.label}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ActivityStatsCards;

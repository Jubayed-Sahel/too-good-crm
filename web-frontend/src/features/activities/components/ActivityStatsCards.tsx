import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '@/components/dashboard';
import { FiActivity, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';

interface ActivityStatsProps {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  scheduledActivities: number;
  isLoading?: boolean;
}

export const ActivityStatsCards = ({ 
  totalActivities,
  completedActivities,
  pendingActivities,
  scheduledActivities,
  isLoading = false 
}: ActivityStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Activities"
        value={isLoading ? '-' : totalActivities.toLocaleString()}
        icon={<FiActivity />}
        change="+12%"
        iconBg="purple.100"
        iconColor="purple.600"
      />
      <StatCard
        title="Completed"
        value={isLoading ? '-' : completedActivities.toLocaleString()}
        icon={<FiCheckCircle />}
        change="+8%"
        iconBg="green.100"
        iconColor="green.600"
      />
      <StatCard
        title="Pending"
        value={isLoading ? '-' : pendingActivities.toLocaleString()}
        icon={<FiClock />}
        change="+5%"
        iconBg="orange.100"
        iconColor="orange.600"
      />
      <StatCard
        title="Scheduled"
        value={isLoading ? '-' : scheduledActivities.toLocaleString()}
        icon={<FiCalendar />}
        change="+15%"
        iconBg="blue.100"
        iconColor="blue.600"
      />
    </SimpleGrid>
  );
};

export default ActivityStatsCards;

import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import { FiPackage, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

interface OrderStatsProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

const OrderStats = ({
  total,
  completed,
  inProgress,
  pending,
}: OrderStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Orders"
        value={total.toLocaleString()}
        icon={<FiPackage />}
        change="+12%"
        iconBg="blue.100"
        iconColor="blue.600"
      />
      <StatCard
        title="Completed"
        value={completed.toLocaleString()}
        icon={<FiCheckCircle />}
        change="+8%"
        iconBg="green.100"
        iconColor="green.600"
      />
      <StatCard
        title="In Progress"
        value={inProgress.toLocaleString()}
        icon={<FiClock />}
        change="+15%"
        iconBg="blue.100"
        iconColor="blue.600"
      />
      <StatCard
        title="Pending"
        value={pending.toLocaleString()}
        icon={<FiAlertCircle />}
        change="-5%"
        iconBg="orange.100"
        iconColor="orange.600"
      />
    </SimpleGrid>
  );
};

export default OrderStats;

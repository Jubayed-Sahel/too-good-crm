import { SimpleGrid } from '@chakra-ui/react';
import { FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';
import { StatCard } from '../dashboard';

interface IssueStatsProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

const IssueStats = ({ total, open, inProgress, resolved }: IssueStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Issues"
        value={total.toLocaleString()}
        icon={<FiAlertCircle />}
        change={`${open + inProgress} active`}
        iconBg="blue.100"
        iconColor="blue.600"
      />
      <StatCard
        title="Open"
        value={open.toLocaleString()}
        icon={<FiAlertCircle />}
        change="+2 this week"
        iconBg="blue.100"
        iconColor="blue.600"
      />
      <StatCard
        title="In Progress"
        value={inProgress.toLocaleString()}
        icon={<FiClock />}
        change="Being addressed"
        iconBg="orange.100"
        iconColor="orange.600"
      />
      <StatCard
        title="Resolved"
        value={resolved.toLocaleString()}
        icon={<FiCheckCircle />}
        change="+5 this month"
        iconBg="green.100"
        iconColor="green.600"
      />
    </SimpleGrid>
  );
};

export default IssueStats;

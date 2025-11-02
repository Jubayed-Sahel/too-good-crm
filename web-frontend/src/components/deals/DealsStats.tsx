import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import { FiTrendingUp, FiCheckCircle, FiDollarSign, FiTarget } from 'react-icons/fi';
import { formatCurrency } from '@/utils';

interface DealsStatsProps {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalValue: number;
}

const DealsStats = ({ totalDeals, activeDeals, wonDeals, totalValue }: DealsStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6} w="100%">
      <StatCard
        title="Total Deals"
        value={totalDeals.toString()}
        icon={<FiTarget />}
        iconColor="blue.600"
        iconBg="blue.100"
        change="+12%"
      />
      <StatCard
        title="Active Deals"
        value={activeDeals.toString()}
        icon={<FiTrendingUp />}
        iconColor="orange.600"
        iconBg="orange.100"
        change="+8%"
      />
      <StatCard
        title="Won Deals"
        value={wonDeals.toString()}
        icon={<FiCheckCircle />}
        iconColor="green.600"
        iconBg="green.100"
        change="+15%"
      />
      <StatCard
        title="Total Deal Value"
        value={formatCurrency(totalValue)}
        icon={<FiDollarSign />}
        iconColor="purple.600"
        iconBg="purple.100"
        change="+23%"
      />
    </SimpleGrid>
  );
};

export default DealsStats;

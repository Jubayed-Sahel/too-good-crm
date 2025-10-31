import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import { FiTrendingUp, FiCheckCircle, FiDollarSign, FiTarget } from 'react-icons/fi';

interface DealsStatsProps {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalValue: number;
}

const DealsStats = ({ totalDeals, activeDeals, wonDeals, totalValue }: DealsStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} w="100%">
      <StatCard
        title="Total Deals"
        value={totalDeals.toString()}
        icon={<FiTarget size={24} />}
        iconColor="blue.500"
        iconBg="blue.50"
        change="+12%"
      />
      <StatCard
        title="Active Deals"
        value={activeDeals.toString()}
        icon={<FiTrendingUp size={24} />}
        iconColor="orange.500"
        iconBg="orange.50"
        change="+8%"
      />
      <StatCard
        title="Won Deals"
        value={wonDeals.toString()}
        icon={<FiCheckCircle size={24} />}
        iconColor="green.500"
        iconBg="green.50"
        change="+15%"
      />
      <StatCard
        title="Total Deal Value"
        value={formatCurrency(totalValue)}
        icon={<FiDollarSign size={24} />}
        iconColor="purple.500"
        iconBg="purple.50"
        change="+23%"
      />
    </SimpleGrid>
  );
};

export default DealsStats;

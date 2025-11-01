import { SimpleGrid } from '@chakra-ui/react';
import StatCard from './StatCard';
import { FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';
import type { DashboardStats } from '@/types';

interface StatsGridProps {
  stats: DashboardStats | null;
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statsData = [
    {
      title: 'Total Customers',
      value: stats?.customers?.total?.toString() || '0',
      icon: <FiUsers />,
      change: '+12%',
      iconBg: 'purple.100',
      iconColor: 'purple.600',
    },
    {
      title: 'Active Deals',
      value: stats?.deals?.open?.toString() || '0',
      icon: <FiFileText />,
      change: '+8%',
      iconBg: 'blue.100',
      iconColor: 'blue.600',
    },
    {
      title: 'Revenue',
      value: stats?.deals?.total_won_value ? formatCurrency(stats.deals.total_won_value) : '$0',
      icon: <FiDollarSign />,
      change: '+23%',
      iconBg: 'green.100',
      iconColor: 'green.600',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </SimpleGrid>
  );
};

export default StatsGrid;

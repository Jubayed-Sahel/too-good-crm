import { SimpleGrid } from '@chakra-ui/react';
import StatCard from './StatCard';
import { SkeletonCard } from '../common';
import { FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';
import type { DashboardStats } from '@/types';
import { formatCurrency } from '@/utils';

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

const StatsGrid = ({ stats, isLoading = false }: StatsGridProps) => {
  // Show skeleton loading state
  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </SimpleGrid>
    );
  }
  const statsData = [
    {
      title: 'Total Customers',
      value: stats?.customers?.total?.toString() || '0',
      icon: <FiUsers />,
      change: stats?.customers?.growth ? `${stats.customers.growth > 0 ? '+' : ''}${stats.customers.growth.toFixed(1)}%` : '+0%',
      iconBg: 'purple.100',
      iconColor: 'purple.600',
    },
    {
      title: 'Active Deals',
      value: stats?.deals?.active?.toString() || '0',
      icon: <FiFileText />,
      change: stats?.deals?.win_rate ? `${stats.deals.win_rate.toFixed(1)}% win rate` : '0% win rate',
      iconBg: 'blue.100',
      iconColor: 'blue.600',
    },
    {
      title: 'Revenue',
      value: stats?.revenue?.total ? formatCurrency(stats.revenue.total) : '$0',
      icon: <FiDollarSign />,
      change: stats?.revenue?.pipeline_value ? `${formatCurrency(stats.revenue.pipeline_value)} in pipeline` : '$0 in pipeline',
      iconBg: 'green.100',
      iconColor: 'green.600',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </SimpleGrid>
  );
};

export default StatsGrid;

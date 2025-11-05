import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import type { LeadStats as LeadStatsType } from '../../types';
import { 
  FiTrendingUp,
  FiUsers, 
  FiAward, 
  FiCheckCircle 
} from 'react-icons/fi';

interface LeadStatsProps {
  stats: LeadStatsType;
  isLoading?: boolean;
}

export const LeadStats = ({ stats, isLoading = false }: LeadStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Leads"
        value={isLoading ? '...' : stats.totalLeads.toString()}
        icon={<FiUsers />}
        iconBg="purple.100"
        iconColor="purple.600"
        change="+12%"
      />
      <StatCard
        title="New Leads"
        value={isLoading ? '...' : (stats.statusCounts.new || 0).toString()}
        icon={<FiTrendingUp />}
        iconBg="pink.100"
        iconColor="pink.600"
        change="+8%"
      />
      <StatCard
        title="Qualified"
        value={isLoading ? '...' : (stats.statusCounts.qualified || 0).toString()}
        icon={<FiAward />}
        iconBg="blue.100"
        iconColor="blue.600"
        change="+15%"
      />
      <StatCard
        title="Converted"
        value={isLoading ? '...' : (stats.statusCounts.converted || 0).toString()}
        icon={<FiCheckCircle />}
        iconBg="green.100"
        iconColor="green.600"
        change="+23%"
      />
    </SimpleGrid>
  );
};

import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '@/components/dashboard';
import type { LeadStats as DashboardLeadStats } from '../../types/lead.types';
import { 
  FiTrendingUp,
  FiUsers, 
  FiAward, 
  FiCheckCircle 
} from 'react-icons/fi';

interface LeadStatsProps {
  stats?: DashboardLeadStats;
  isLoading?: boolean;
}

export const LeadStats = ({ stats, isLoading = false }: LeadStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Leads"
        value={isLoading || !stats ? '...' : stats.totalLeads.toString()}
        icon={<FiUsers />}
        iconBg="purple.100"
        iconColor="purple.600"
        change="+12%"
      />
      <StatCard
        title="Qualified"
        value={isLoading || !stats ? '...' : stats.statusCounts.qualified.toString()}
        icon={<FiAward />}
        iconBg="blue.100"
        iconColor="blue.600"
        change="+15%"
      />
      <StatCard
        title="Conversion Rate"
        value={isLoading || !stats ? '...' : `${(stats.conversionRate * 100).toFixed(1)}%`}
        icon={<FiTrendingUp />}
        iconBg="pink.100"
        iconColor="pink.600"
        change="+8%"
      />
      <StatCard
        title="New This Month"
        value={isLoading || !stats ? '...' : stats.statusCounts.new.toString()}
        icon={<FiCheckCircle />}
        iconBg="green.100"
        iconColor="green.600"
        change="+23%"
      />
    </SimpleGrid>
  );
};

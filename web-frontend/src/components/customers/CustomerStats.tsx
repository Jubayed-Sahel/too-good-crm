import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import { FiUsers, FiUserCheck, FiUserX, FiDollarSign } from 'react-icons/fi';

interface CustomerStatsProps {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalRevenue: number;
}

const CustomerStats = ({
  totalCustomers,
  activeCustomers,
  inactiveCustomers,
  totalRevenue,
}: CustomerStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
      <StatCard
        title="Total Customers"
        value={totalCustomers.toLocaleString()}
        icon={<FiUsers />}
        change="+12%"
        iconBg="purple.100"
        iconColor="purple.600"
      />
      <StatCard
        title="Active Customers"
        value={activeCustomers.toLocaleString()}
        icon={<FiUserCheck />}
        change="+8%"
        iconBg="green.100"
        iconColor="green.600"
      />
      <StatCard
        title="Inactive Customers"
        value={inactiveCustomers.toLocaleString()}
        icon={<FiUserX />}
        change="-3%"
        iconBg="red.100"
        iconColor="red.600"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<FiDollarSign />}
        change="+15%"
        iconBg="blue.100"
        iconColor="blue.600"
      />
    </SimpleGrid>
  );
};

export default CustomerStats;

import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import { FiPackage, FiCheckCircle, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

interface VendorStatsProps {
  totalVendors: number;
  activeVendors: number;
  totalOrders: number;
  totalSpent: number;
}

const VendorStats = ({
  totalVendors,
  activeVendors,
  totalOrders,
  totalSpent,
}: VendorStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Vendors"
        value={totalVendors.toLocaleString()}
        icon={<FiPackage />}
        change="+5%"
        iconBg="blue.100"
        iconColor="blue.600"
      />
      <StatCard
        title="Active Vendors"
        value={activeVendors.toLocaleString()}
        icon={<FiCheckCircle />}
        change="+8%"
        iconBg="green.100"
        iconColor="green.600"
      />
      <StatCard
        title="Total Orders"
        value={totalOrders.toLocaleString()}
        icon={<FiShoppingBag />}
        change="+12%"
        iconBg="purple.100"
        iconColor="purple.600"
      />
      <StatCard
        title="Total Spent"
        value={`$${totalSpent.toLocaleString()}`}
        icon={<FiDollarSign />}
        change="+15%"
        iconBg="orange.100"
        iconColor="orange.600"
      />
    </SimpleGrid>
  );
};

export default VendorStats;

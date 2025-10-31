import { SimpleGrid } from '@chakra-ui/react';
import StatCard from './StatCard';
import { FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';

const StatsGrid = () => {
  const stats = [
    {
      title: 'Total Customers',
      value: '1,234',
      icon: <FiUsers />,
      change: '+12%',
      iconBg: 'purple.100',
      iconColor: 'purple.600',
    },
    {
      title: 'Active Deals',
      value: '87',
      icon: <FiFileText />,
      change: '+8%',
      iconBg: 'blue.100',
      iconColor: 'blue.600',
    },
    {
      title: 'Revenue',
      value: '$45.2K',
      icon: <FiDollarSign />,
      change: '+23%',
      iconBg: 'green.100',
      iconColor: 'green.600',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </SimpleGrid>
  );
};

export default StatsGrid;

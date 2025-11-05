import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '../dashboard';
import { FiCheckCircle, FiCreditCard, FiAlertCircle, FiDollarSign } from 'react-icons/fi';

interface PaymentStatsProps {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  count: number;
}

const PaymentStats = ({
  totalPaid,
  totalPending,
  totalOverdue,
  count,
}: PaymentStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      <StatCard
        title="Total Paid"
        value={`$${totalPaid.toLocaleString()}`}
        icon={<FiCheckCircle />}
        change="+18%"
        iconBg="green.100"
        iconColor="green.600"
      />
      <StatCard
        title="Pending"
        value={`$${totalPending.toLocaleString()}`}
        icon={<FiCreditCard />}
        change="+10%"
        iconBg="blue.100"
        iconColor="blue.600"
      />
      <StatCard
        title="Overdue"
        value={`$${totalOverdue.toLocaleString()}`}
        icon={<FiAlertCircle />}
        change="-15%"
        iconBg="red.100"
        iconColor="red.600"
      />
      <StatCard
        title="Total Payments"
        value={count.toLocaleString()}
        icon={<FiDollarSign />}
        change="+12%"
        iconBg="purple.100"
        iconColor="purple.600"
      />
    </SimpleGrid>
  );
};

export default PaymentStats;

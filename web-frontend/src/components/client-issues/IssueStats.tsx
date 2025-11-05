import { SimpleGrid, Box, HStack, VStack, Heading, Text } from '@chakra-ui/react';
import { FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';

interface IssueStatsProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

const IssueStats = ({ total, open, inProgress, resolved }: IssueStatsProps) => {
  const stats = [
    { label: 'Total Issues', value: total, icon: FiAlertCircle, color: 'blue', change: `${open + inProgress} active` },
    { label: 'Open', value: open, icon: FiAlertCircle, color: 'blue', change: '+2 this week' },
    { label: 'In Progress', value: inProgress, icon: FiClock, color: 'orange', change: 'Being addressed' },
    { label: 'Resolved', value: resolved, icon: FiCheckCircle, color: 'green', change: '+5 this month' },
  ];

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={5}>
      {stats.map((stat) => (
        <Box
          key={stat.label}
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          p={{ base: 5, md: 6 }}
          borderWidth="1px"
          borderColor="gray.200"
        >
          <HStack justify="space-between" align="start" mb={3}>
            <VStack align="start" gap={1}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                {stat.label}
              </Text>
              <Heading size="2xl" color="gray.900">
                {stat.value}
              </Heading>
            </VStack>
            <Box p={2} bg={`${stat.color}.100`} borderRadius="md" color={`${stat.color}.600`}>
              <stat.icon size={20} />
            </Box>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {stat.change}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default IssueStats;

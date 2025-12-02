import { Box, Grid, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { FiAlertCircle, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface IssueStatsGridProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

const IssueStatsGrid = ({
  total,
  open,
  inProgress,
  resolved,
  closed,
  byPriority,
  byCategory,
}: IssueStatsGridProps) => {
  const stats = [
    {
      label: 'Total Issues',
      value: total,
      icon: FiAlertCircle,
      color: 'gray',
      bgGradient: 'linear(to-br, gray.50, gray.100)',
    },
    {
      label: 'Open',
      value: open,
      icon: FiAlertCircle,
      color: 'orange',
      bgGradient: 'linear(to-br, orange.50, orange.100)',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: FiClock,
      color: 'blue',
      bgGradient: 'linear(to-br, blue.50, blue.100)',
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: FiCheckCircle,
      color: 'green',
      bgGradient: 'linear(to-br, green.50, green.100)',
    },
    {
      label: 'Closed',
      value: closed,
      icon: FiXCircle,
      color: 'purple',
      bgGradient: 'linear(to-br, purple.50, purple.100)',
    },
  ];

  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(5, 1fr)',
      }}
      gap={4}
    >
      {stats.map((stat) => (
        <Box
          key={stat.label}
          p={5}
          bg="white"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          bgGradient={stat.bgGradient}
          transition="all 0.2s"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          }}
        >
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <Box
                as={stat.icon}
                fontSize="2xl"
                color={`${stat.color}.600`}
              />
              <Heading size="2xl" color={`${stat.color}.700`}>
                {stat.value}
              </Heading>
            </HStack>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              {stat.label}
            </Text>
          </VStack>
        </Box>
      ))}
    </Grid>
  );
};

export default IssueStatsGrid;

import { Box, Heading, Text, Grid, VStack, HStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { FiUsers, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '@/hooks';

const EmployeeDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="xl" mb={2}>
            Employee Dashboard
          </Heading>
          <Text color="gray.600">
            Welcome back, {user?.full_name || user?.email}
          </Text>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <Box p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                My Tasks
              </Text>
              <Box p={2} bg="blue.50" borderRadius="md" color="blue.600">
                <FiCheckCircle size={20} />
              </Box>
            </HStack>
            <Heading size="xl">12</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              3 pending review
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                My Customers
              </Text>
              <Box p={2} bg="green.50" borderRadius="md" color="green.600">
                <FiUsers size={20} />
              </Box>
            </HStack>
            <Heading size="xl">24</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              8 active deals
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                My Deals
              </Text>
              <Box p={2} bg="purple.50" borderRadius="md" color="purple.600">
                <FiTrendingUp size={20} />
              </Box>
            </HStack>
            <Heading size="xl">8</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              $45,200 pipeline
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Hours This Week
              </Text>
              <Box p={2} bg="orange.50" borderRadius="md" color="orange.600">
                <FiClock size={20} />
              </Box>
            </HStack>
            <Heading size="xl">32</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              8 hours remaining
            </Text>
          </Box>
        </Grid>

        {/* Recent Activity */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
          <Heading size="md" mb={4}>
            Recent Activity
          </Heading>
          <VStack align="stretch" gap={3}>
            <Text color="gray.600">No recent activity</Text>
          </VStack>
        </Box>
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeDashboardPage;

import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const EmployeeTasksPage = () => {
  return (
    <DashboardLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="2xl" mb={2}>
            My Tasks
          </Heading>
          <Text color="gray.600">
            Manage your assigned tasks and activities
          </Text>
        </Box>

        <Box p={{ base: 5, md: 6 }} bg="white" borderRadius="xl" borderWidth={1} borderColor="gray.200">
          <Text color="gray.600">No tasks assigned</Text>
        </Box>
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeTasksPage;

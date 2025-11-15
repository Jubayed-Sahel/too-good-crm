import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const EmployeeSettingsPage = () => {
  return (
    <DashboardLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="xl" mb={2}>
            Employee Settings
          </Heading>
          <Text color="gray.600">
            Manage your personal settings and preferences
          </Text>
        </Box>

        <Box p={6} bg="white" borderRadius="lg" borderWidth={1} borderColor="gray.200">
          <Text color="gray.600">Settings coming soon</Text>
        </Box>
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeSettingsPage;

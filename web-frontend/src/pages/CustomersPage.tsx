import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const CustomersPage = () => {
  return (
    <DashboardLayout title="Customers">
      <Box>
        <Heading size="lg" mb={4}>Customers</Heading>
        <Text color="gray.600">Customer management coming soon...</Text>
      </Box>
    </DashboardLayout>
  );
};

export default CustomersPage;

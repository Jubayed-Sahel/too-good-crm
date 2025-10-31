import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const DealsPage = () => {
  return (
    <DashboardLayout title="Deals">
      <Box>
        <Heading size="lg" mb={4}>Deals</Heading>
        <Text color="gray.600">Deals management coming soon...</Text>
      </Box>
    </DashboardLayout>
  );
};

export default DealsPage;

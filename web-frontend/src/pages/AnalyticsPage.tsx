import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const AnalyticsPage = () => {
  return (
    <DashboardLayout title="Analytics">
      <Box>
        <Heading size="lg" mb={4}>Analytics</Heading>
        <Text color="gray.600">Analytics dashboard coming soon...</Text>
      </Box>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

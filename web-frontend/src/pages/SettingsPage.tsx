import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const SettingsPage = () => {
  return (
    <DashboardLayout title="Settings">
      <Box>
        <Heading size="lg" mb={4}>Settings</Heading>
        <Text color="gray.600">Settings page coming soon...</Text>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;

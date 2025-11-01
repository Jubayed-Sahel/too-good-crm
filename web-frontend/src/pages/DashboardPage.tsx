import { VStack, Spinner, Box, Text } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  WelcomeBanner,
  StatsGrid,
  InfoCardsGrid,
} from '../components/dashboard';
import { useDashboardStats } from '@/hooks';

const DashboardPage = () => {
  const { stats, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <Box textAlign="center" py={12}>
          <Text color="red.600" fontSize="lg" mb={2}>
            Failed to load dashboard data
          </Text>
          <Text color="gray.500" fontSize="sm">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <VStack gap={6} align="stretch">
        <WelcomeBanner />
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : (
          <>
            <StatsGrid stats={stats} />
            <InfoCardsGrid />
          </>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default DashboardPage;

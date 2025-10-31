import { VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  WelcomeBanner,
  StatsGrid,
  InfoCardsGrid,
} from '../components/dashboard';

const DashboardPage = () => {
  return (
    <DashboardLayout title="Dashboard">
      <VStack gap={8} align="stretch">
        <WelcomeBanner />
        <StatsGrid />
        <InfoCardsGrid />
      </VStack>
    </DashboardLayout>
  );
};

export default DashboardPage;

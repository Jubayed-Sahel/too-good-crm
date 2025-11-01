import { VStack, Grid } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  AnalyticsHeader,
  RevenueChart,
  SalesPipeline,
  TopPerformers,
  ConversionFunnel,
  RecentActivities,
} from '../components/analytics';

const AnalyticsPage = () => {
  const handleExport = () => {
    alert('Export analytics report');
    // TODO: Implement export functionality
  };

  const handleDateRangeChange = () => {
    alert('Change date range');
    // TODO: Implement date range picker
  };

  return (
    <DashboardLayout title="Analytics">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <AnalyticsHeader
          onExport={handleExport}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Revenue Chart - Full Width */}
        <RevenueChart />

        {/* Two Column Layout */}
        <Grid
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={6}
        >
          <SalesPipeline />
          <TopPerformers />
        </Grid>

        {/* Two Column Layout */}
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={6}
        >
          <ConversionFunnel />
          <RecentActivities />
        </Grid>
      </VStack>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

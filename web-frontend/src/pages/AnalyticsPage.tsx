import { useState } from 'react';
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
import { exportData } from '@/utils';
import { toaster } from '@/components/ui/toaster';
import { analyticsService } from '@/services';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('30');

  const handleExport = async () => {
    try {
      // Get analytics data
      const [dashboardStats, revenueData, salesPipeline, topPerformers] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getRevenueChartData(),
        analyticsService.getSalesPipeline(),
        analyticsService.getTopPerformers(),
      ]);

      // Prepare export data
      const exportRows = [
        // Dashboard Stats
        { Metric: 'Total Revenue', Value: `$${dashboardStats.totalRevenue?.toLocaleString() || 0}` },
        { Metric: 'Total Deals', Value: dashboardStats.totalDeals || 0 },
        { Metric: 'Active Customers', Value: dashboardStats.activeCustomers || 0 },
        { Metric: 'Conversion Rate', Value: `${dashboardStats.conversionRate || 0}%` },
        // Revenue Data
        ...revenueData.monthlyData.map(month => ({
          Metric: `Revenue - ${month.month}`,
          Value: `$${month.revenue.toLocaleString()}`,
        })),
        // Top Performers
        ...topPerformers.map((performer, index) => ({
          Metric: `Top Performer #${index + 1} - ${performer.name}`,
          Value: `$${performer.revenue.toLocaleString()} (${performer.deals} deals)`,
        })),
      ];

      exportData(exportRows, 'analytics-report', 'csv');

      toaster.create({
        title: 'Export complete',
        description: 'Analytics report exported successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error exporting analytics:', error);
      toaster.create({
        title: 'Export failed',
        description: error.message || 'Failed to export analytics report',
        type: 'error',
      });
    }
  };

  const handleDateRangeChange = () => {
    // Cycle through date ranges: 7, 30, 90, 365, All
    const ranges = ['7', '30', '90', '365', 'all'];
    const currentIndex = ranges.indexOf(dateRange);
    const nextIndex = (currentIndex + 1) % ranges.length;
    const nextRange = ranges[nextIndex];
    setDateRange(nextRange);

    const rangeLabels: Record<string, string> = {
      '7': 'Last 7 Days',
      '30': 'Last 30 Days',
      '90': 'Last 90 Days',
      '365': 'Last Year',
      'all': 'All Time',
    };

    toaster.create({
      title: 'Date range updated',
      description: `Showing data for ${rangeLabels[nextRange]}`,
      type: 'info',
      duration: 2000,
    });
  };

  return (
    <DashboardLayout title="Analytics">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <AnalyticsHeader
          onExport={handleExport}
          onDateRangeChange={handleDateRangeChange}
          dateRangeLabel={
            dateRange === '7' ? 'Last 7 Days' :
            dateRange === '30' ? 'Last 30 Days' :
            dateRange === '90' ? 'Last 90 Days' :
            dateRange === '365' ? 'Last Year' :
            'All Time'
          }
        />

        {/* Revenue Chart - Full Width */}
        <RevenueChart />

        {/* Two Column Layout */}
        <Grid
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={5}
        >
          <SalesPipeline />
          <TopPerformers />
        </Grid>

        {/* Two Column Layout */}
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={5}
        >
          <ConversionFunnel />
          <RecentActivities />
        </Grid>
      </VStack>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { toaster } from '../components/ui/toaster';
import { useAccountMode } from '@/contexts/AccountModeContext';
import { ActivityStatsCards } from '../components/activities/ActivityStatsCards';
import { ActivityFiltersBar } from '../components/activities/ActivityFiltersBar';
import { ActivitiesTable } from '../components/activities/ActivitiesTable';
import { ActivityTypeMenu } from '../components/activities/ActivityTypeMenu';
import { CreateCallDialog, type CallData } from '../components/activities/CreateCallDialog';
import { SendEmailDialog, type EmailData } from '../components/activities/SendEmailDialog';
import { SendTelegramDialog, type TelegramData } from '../components/activities/SendTelegramDialog';
import {
  getActivities,
  getActivityStats,
  createActivity,
  updateActivityStatus,
  deleteActivity,
} from '../services/activity.service';
import type { Activity, ActivityType, ActivityStatus, ActivityFilters, ActivityStats } from '../types/activity.types';

export const ActivitiesPage = () => {
  const navigate = useNavigate();
  const { isClientMode } = useAccountMode();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    completedActivities: 0,
    pendingActivities: 0,
    scheduledActivities: 0,
    callsCount: 0,
    emailsCount: 0,
    telegramCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    searchQuery: '',
  });

  // Dialog states
  const [isActivityMenuOpen, setIsActivityMenuOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isTelegramDialogOpen, setIsTelegramDialogOpen] = useState(false);

  // Load activities
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const data = await getActivities(filters);
      setActivities(data);
    } catch (error) {
      toaster.create({
        title: 'Error loading activities',
        description: 'Failed to fetch activities. Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await getActivityStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadActivities();
    loadStats();
  }, [filters]);

  // Filter handlers
  const handleSearch = (searchQuery: string) => {
    setFilters({ ...filters, searchQuery });
  };

  const handleTypeChange = (value: string) => {
    const type = value === 'all' ? undefined : (value as ActivityType);
    setFilters({ ...filters, type });
  };

  const handleStatusChange = (value: string) => {
    const status = value === 'all' ? undefined : (value as ActivityStatus);
    setFilters({ ...filters, status });
  };

  const handleClearFilters = () => {
    setFilters({ searchQuery: '' });
  };

  // Action handlers
  const handleNewActivity = () => {
    setIsActivityMenuOpen(true);
  };

  const handleCreateCall = async (data: CallData) => {
    try {
      await createActivity({
        type: 'call',
        title: data.title,
        description: data.notes || '',
        customerName: data.customerName,
        customerId: '1', // TODO: Get from customer selection
        phoneNumber: data.phoneNumber,
      });

      toaster.create({
        title: 'Call logged successfully',
        description: `Call with ${data.customerName} has been recorded.`,
        type: 'success',
        duration: 3000,
      });

      loadActivities();
      loadStats();
    } catch (error) {
      toaster.create({
        title: 'Error logging call',
        description: 'Failed to log the call. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleSendEmail = async (data: EmailData) => {
    try {
      await createActivity({
        type: 'email',
        title: data.subject,
        description: data.body,
        customerName: data.customerName,
        customerId: '1', // TODO: Get from customer selection
        emailSubject: data.subject,
        emailBody: data.body,
      });

      toaster.create({
        title: 'Email sent successfully',
        description: `Email sent to ${data.customerName}.`,
        type: 'success',
        duration: 3000,
      });

      loadActivities();
      loadStats();
    } catch (error) {
      toaster.create({
        title: 'Error sending email',
        description: 'Failed to send the email. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleSendTelegram = async (data: TelegramData) => {
    try {
      await createActivity({
        type: 'telegram',
        title: `Telegram message to ${data.customerName}`,
        description: data.message,
        customerName: data.customerName,
        customerId: '1', // TODO: Get from customer selection
        telegramUsername: data.telegramUsername,
      });

      toaster.create({
        title: 'Telegram message sent',
        description: `Message sent to @${data.telegramUsername}.`,
        type: 'success',
        duration: 3000,
      });

      loadActivities();
      loadStats();
    } catch (error) {
      toaster.create({
        title: 'Error sending message',
        description: 'Failed to send Telegram message. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleMarkComplete = async (activityId: string) => {
    try {
      await updateActivityStatus(activityId, 'completed');
      
      toaster.create({
        title: 'Activity completed',
        description: 'Activity has been marked as completed.',
        type: 'success',
        duration: 2000,
      });

      loadActivities();
      loadStats();
    } catch (error) {
      toaster.create({
        title: 'Error updating activity',
        description: 'Failed to update activity status. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await deleteActivity(activityId);
      
      toaster.create({
        title: 'Activity deleted',
        description: 'Activity has been removed.',
        type: 'success',
        duration: 2000,
      });

      loadActivities();
      loadStats();
    } catch (error) {
      toaster.create({
        title: 'Error deleting activity',
        description: 'Failed to delete activity. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleViewActivity = (activity: Activity) => {
    navigate(`/activities/${activity.id}`);
  };

  return (
    <DashboardLayout title="Activities">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            Activities
          </Heading>
          <Text fontSize="md" color="gray.600">
            Manage calls, emails, Telegram messages, and other activities
          </Text>
        </Box>

        {/* Stats Cards */}
        <ActivityStatsCards {...stats} />

        {/* Filters Bar */}
        <ActivityFiltersBar
          searchQuery={filters.searchQuery || ''}
          typeFilter={(filters.type as ActivityType | 'all') || 'all'}
          statusFilter={(filters.status as ActivityStatus | 'all') || 'all'}
          onSearchChange={handleSearch}
          onTypeChange={handleTypeChange}
          onStatusChange={handleStatusChange}
          onAddActivity={handleNewActivity}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : (
          <>
            {/* Activities Table */}
            <ActivitiesTable
              activities={activities}
              isLoading={isLoading}
              onView={handleViewActivity}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDeleteActivity}
            />

            {/* Empty State */}
            {activities.length === 0 && (
              <Box
                textAlign="center"
                py={12}
                px={6}
                bg="gray.50"
                borderRadius="lg"
              >
                <Heading size="lg" color="gray.600" mb={2}>
                  No activities found
                </Heading>
                <Text color="gray.500" fontSize="md">
                  {filters.searchQuery || filters.type || filters.status
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first activity'}
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>

      {/* Activity Type Menu */}
      <ActivityTypeMenu
        isOpen={isActivityMenuOpen}
        onClose={() => setIsActivityMenuOpen(false)}
        onSelectCall={() => setIsCallDialogOpen(true)}
        onSelectEmail={() => setIsEmailDialogOpen(true)}
        onSelectTelegram={() => setIsTelegramDialogOpen(true)}
        isClientMode={isClientMode}
      />

      {/* Dialogs */}
      <CreateCallDialog
        open={isCallDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
        onSubmit={handleCreateCall}
      />

      <SendEmailDialog
        open={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        onSubmit={handleSendEmail}
      />

      <SendTelegramDialog
        open={isTelegramDialogOpen}
        onClose={() => setIsTelegramDialogOpen(false)}
        onSubmit={handleSendTelegram}
      />
    </DashboardLayout>
  );
};

export default ActivitiesPage;

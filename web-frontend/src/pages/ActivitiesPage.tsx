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
import { activityService } from '../services/activity.service';
import type { Activity, ActivityType, ActivityStatus, ActivityFilters, ActivityStats } from '../types/activity.types';

export const ActivitiesPage = () => {
  const navigate = useNavigate();
  const { isClientMode } = useAccountMode();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    by_status: {
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    },
    by_type: {
      call: 0,
      email: 0,
      telegram: 0,
      meeting: 0,
      note: 0,
      task: 0,
    },
  });

  // Compute display stats from backend stats
  const displayStats = {
    totalActivities: stats.total,
    completedActivities: stats.by_status.completed,
    pendingActivities: stats.by_status.in_progress,
    scheduledActivities: stats.by_status.scheduled,
  };
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
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
      const response = await activityService.getAll(filters);
      setActivities(response.results);
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
      const statsData = await activityService.getStats();
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
    setFilters({ ...filters, search: searchQuery });
  };

  const handleTypeChange = (value: string) => {
    const activity_type = value === 'all' ? undefined : (value as ActivityType);
    setFilters({ ...filters, activity_type });
  };

  const handleStatusChange = (value: string) => {
    const status = value === 'all' ? undefined : (value as ActivityStatus);
    setFilters({ ...filters, status });
  };

  const handleClearFilters = () => {
    setFilters({ search: '' });
  };

  // Action handlers
  const handleNewActivity = () => {
    setIsActivityMenuOpen(true);
  };

  const handleCreateCall = async (data: CallData) => {
    try {
      await activityService.create({
        activity_type: 'call',
        title: data.title,
        description: data.notes || '',
        customer: 1, // TODO: Get from customer selection
        status: 'completed',
        phone_number: data.phoneNumber,
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
      await activityService.create({
        activity_type: 'email',
        title: data.subject,
        description: data.body,
        customer: 1, // TODO: Get from customer selection
        status: 'completed',
        email_subject: data.subject,
        email_body: data.body,
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
      await activityService.create({
        activity_type: 'telegram',
        title: `Telegram message to ${data.customerName}`,
        description: data.message,
        customer: 1, // TODO: Get from customer selection
        status: 'completed',
        telegram_username: data.telegramUsername,
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

  const handleMarkComplete = async (activityId: number) => {
    try {
      await activityService.complete(activityId);
      
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

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await activityService.delete(activityId);
      
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
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <Heading size="xl" color="gray.900" mb={2}>
            Activities
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Manage calls, emails, Telegram messages, and other activities
          </Text>
        </Box>

        {/* Stats Cards */}
        <ActivityStatsCards {...displayStats} />

        {/* Filters Bar */}
        <ActivityFiltersBar
          searchQuery={filters.search || ''}
          typeFilter={(filters.activity_type as ActivityType | 'all') || 'all'}
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
            <Spinner size="xl" color="blue.500" />
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

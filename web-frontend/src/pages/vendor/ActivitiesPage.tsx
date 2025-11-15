import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, Box, Spinner } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { toaster } from '../../components/ui/toaster';
import { ConfirmDialog, PageHeader, StandardButton } from '../../components/common';
import { useAccountMode } from '@/contexts/AccountModeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { ActivityStatsCards } from '../../components/activities/ActivityStatsCards';
import { ActivityFiltersBar } from '../../components/activities/ActivityFiltersBar';
import { ActivitiesTable } from '../../components/activities/ActivitiesTable';
import { ActivityTypeMenu } from '../../components/activities/ActivityTypeMenu';
import { CreateCallDialog, type CallData } from '../../components/activities/CreateCallDialog';
import { SendEmailDialog, type EmailData } from '../../components/activities/SendEmailDialog';
import { SendTelegramDialog, type TelegramData } from '../../components/activities/SendTelegramDialog';
import { activityService } from '../../services/activity.service';
import type { Activity, ActivityType, ActivityStatus, ActivityFilters, ActivityStats } from '../../types/activity.types';

export const ActivitiesPage = () => {
  const navigate = useNavigate();
  const { isClientMode } = useAccountMode();
  const { activeOrganizationId } = useProfile();
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
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  
  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [activitiesToBulkDelete, setActivitiesToBulkDelete] = useState<number[]>([]);

  // Load activities
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      
      // Include organization filter
      const filtersWithOrg = {
        ...filters,
        ...(activeOrganizationId && { organization: activeOrganizationId }),
      };
      
      const response = await activityService.getAll(filtersWithOrg);
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
      // Include organization filter
      const statsFilter = activeOrganizationId 
        ? { organization: activeOrganizationId }
        : undefined;
        
      const statsData = await activityService.getStats(statsFilter);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    if (activeOrganizationId) {
      loadActivities();
      loadStats();
    }
  }, [filters, activeOrganizationId]);

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
        customer_name: data.customerName,
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
        customer_name: data.customerName,
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
        customer_name: data.customerName,
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

  const handleDeleteActivity = (activity: Activity) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!activityToDelete) return;

    try {
      await activityService.delete(activityToDelete.id);
      
      toaster.create({
        title: 'Activity deleted',
        description: 'Activity has been removed.',
        type: 'success',
        duration: 2000,
      });

      setDeleteDialogOpen(false);
      setActivityToDelete(null);
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
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleViewActivity = (activity: Activity) => {
    navigate(`/activities/${activity.id}`);
  };
  
  const handleBulkDelete = (activityIds: number[]) => {
    if (activityIds.length === 0) return;
    setActivitiesToBulkDelete(activityIds);
    setBulkDeleteDialogOpen(true);
  };
  
  const confirmBulkDelete = async () => {
    try {
      // Delete activities in parallel
      await Promise.all(
        activitiesToBulkDelete.map(id => activityService.delete(id))
      );
      
      toaster.create({
        title: 'Activities deleted',
        description: `${activitiesToBulkDelete.length} activity(ies) have been removed.`,
        type: 'success',
        duration: 2000,
      });
      
      setBulkDeleteDialogOpen(false);
      setActivitiesToBulkDelete([]);
      loadActivities();
      loadStats();
    } catch (error) {
      toaster.create({
        title: 'Error deleting activities',
        description: 'Failed to delete activities. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };
  
  const closeBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(false);
    setActivitiesToBulkDelete([]);
  };

  return (
    <DashboardLayout title="Activities">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <PageHeader
          title="Activities"
          description="Manage calls, emails, Telegram messages, and other activities"
          actions={
            <StandardButton
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleNewActivity}
            >
              New Activity
            </StandardButton>
          }
        />

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
              onBulkDelete={handleBulkDelete}
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
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Activity"
        message={
          activityToDelete
            ? `Are you sure you want to delete "${activityToDelete.title}"? This action cannot be undone.`
            : 'Are you sure you want to delete this activity?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={false}
      />
      
      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Activities"
        message={`Are you sure you want to delete ${activitiesToBulkDelete.length} activity(ies)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={false}
      />
    </DashboardLayout>
  );
};

export default ActivitiesPage;

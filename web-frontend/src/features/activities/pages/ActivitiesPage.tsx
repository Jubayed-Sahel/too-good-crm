import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, Box, Spinner, Text, Heading, HStack, Badge } from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogCloseTrigger } from '@/components/ui/dialog';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { toaster } from '@/components/ui/toaster';
import { ConfirmDialog, PageHeader, StandardButton } from '@/components/common';
import { RequirePermission } from '@/components/guards/RequirePermission';
import { useAccountMode } from '@/contexts/AccountModeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { ActivityStatsCards } from '../components/ActivityStatsCards';
import { ActivityFiltersBar } from '../components/ActivityFiltersBar';
import { ActivitiesTable } from '../components/ActivitiesTable';
import { ActivityTypeMenu } from '../components/ActivityTypeMenu';
import { CreateCallDialog, type CallData } from '../components/CreateCallDialog';
import { SendEmailDialog, type EmailData } from '../components/SendEmailDialog';
import { SendTelegramDialog, type TelegramData } from '../components/SendTelegramDialog';
import { activityService } from '../services/activity.service';
import { auditLogService, type AuditLog } from '@/services/auditLog.service';
import { videoService } from '@/services/video.service';
import type { Activity, ActivityType, ActivityStatus, ActivityFilters, ActivityStats } from '@/types/activity.types';
import type { VideoCallSession } from '@/types/video.types';

export const ActivitiesPage = () => {
  const navigate = useNavigate();
  const { isClientMode } = useAccountMode();
  const { activeOrganizationId } = useProfile();
  const { canAccess } = usePermissions();
  const canCreate = canAccess('activity', 'create');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [videoCalls, setVideoCalls] = useState<VideoCallSession[]>([]);
  const [selectedCall, setSelectedCall] = useState<VideoCallSession | null>(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);
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

  // Compute display stats from backend stats (includes video calls)
  const displayStats = {
    totalActivities: stats.total + videoCalls.length,
    completedActivities: stats.by_status.completed + videoCalls.filter(c => c.status === 'completed').length,
    pendingActivities: stats.by_status.in_progress + videoCalls.filter(c => c.status === 'pending' || c.status === 'ringing').length,
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
      
      // Fetch both regular activities AND audit logs
      const [activitiesResponse, auditLogsResponse] = await Promise.all([
        activityService.getAll(filtersWithOrg),
        auditLogService.getAll(filtersWithOrg)
      ]);
      
      setActivities(activitiesResponse.results);
      setAuditLogs(auditLogsResponse.results);
      
      console.log('[ActivitiesPage] 📊 Loaded activities:', activitiesResponse.results.length);
      console.log('[ActivitiesPage] 📋 Loaded audit logs:', auditLogsResponse.results.length);
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

  // Load video calls
  const loadVideoCalls = async () => {
    try {
      console.log('[ActivitiesPage] Loading video calls...');
      const calls = await videoService.getCallHistory({ my_calls: true });
      console.log('[ActivitiesPage] Loaded video calls:', calls);
      console.log('[ActivitiesPage] Video calls count:', calls.length);
      setVideoCalls(calls || []);
    } catch (error) {
      console.error('[ActivitiesPage] Error loading video calls:', error);
      setVideoCalls([]);
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

  // Load video calls separately (doesn't depend on filters)
  useEffect(() => {
    if (activeOrganizationId) {
      loadVideoCalls();
    }
  }, [activeOrganizationId]);

  // Convert audit logs to Activity format for display
  console.log('[ActivitiesPage] Converting audit logs to activities. Count:', auditLogs.length);
  const auditLogsAsActivities: Activity[] = auditLogs.map(log => ({
    id: `audit-${log.id}` as any, // Prefix to avoid ID collision
    activity_type: 'note' as ActivityType, // Use 'note' type for audit logs
    title: log.description || `${log.action_display} ${log.resource_type_display}`,
    description: log.resource_name || log.description,
    customer_name: log.customer_name || log.user_email || 'System',
    status: 'completed' as ActivityStatus, // Audit logs are always completed
    created_at: log.created_at,
    updated_at: log.updated_at,
    scheduled_at: log.created_at,
    completed_at: log.created_at,
    created_by: log.user || undefined,
    assigned_to: undefined,
    organization: log.organization,
    customer: log.related_customer || undefined,
    lead: log.related_lead || undefined,
    phone_number: undefined,
    email_subject: undefined,
    email_body: undefined,
    telegram_username: undefined,
  }));

  // Convert video calls to Activity format for display
  console.log('[ActivitiesPage] Converting video calls to activities. Count:', videoCalls.length);
  const videoCallsAsActivities: Activity[] = videoCalls.map(call => {
    const callStatusMap: Record<string, ActivityStatus> = {
      'pending': 'scheduled',
      'ringing': 'scheduled',
      'active': 'in_progress',
      'completed': 'completed',
      'missed': 'cancelled',
      'rejected': 'cancelled',
      'cancelled': 'cancelled',
      'failed': 'cancelled',
    };

    return {
      id: call.id,
      activity_type: 'call' as ActivityType,
      title: `${call.call_type === 'video' ? 'Video' : 'Audio'} Call ${call.status === 'completed' ? 'with' : 'to'} ${call.recipient_name || call.initiator_name}`,
      description: call.notes || `${call.call_type} call - ${call.status}${call.duration_formatted ? ` (${call.duration_formatted})` : ''}`,
      customer_name: call.recipient_name || call.initiator_name || 'Unknown',
      status: callStatusMap[call.status] || 'completed',
      created_at: call.created_at,
      updated_at: call.updated_at,
      scheduled_at: call.started_at || call.created_at,
      completed_at: call.ended_at,
      created_by: call.initiator,
      assigned_to: call.recipient || undefined,
      organization: call.organization,
      customer: undefined,
      lead: undefined,
      phone_number: undefined,
      email_subject: undefined,
      email_body: undefined,
      telegram_username: undefined,
    };
  });

  // Merge activities with audit logs and video calls
  const mergedActivities = [...activities, ...auditLogsAsActivities, ...videoCallsAsActivities];

  // Apply client-side filtering to the merged list
  const filteredActivities = mergedActivities.filter(activity => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        activity.title?.toLowerCase().includes(searchLower) ||
        activity.description?.toLowerCase().includes(searchLower) ||
        activity.customer_name?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.activity_type && activity.activity_type !== filters.activity_type) {
      return false;
    }

    // Status filter
    if (filters.status && activity.status !== filters.status) {
      return false;
    }

    return true;
  });

  // Sort by creation date (newest first)
  const allActivities = filteredActivities.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  console.log('[ActivitiesPage] Total activities after merge and filter:', allActivities.length, 
    '(Regular:', activities.length, '+ Audit Logs:', auditLogsAsActivities.length, '+ Calls:', videoCallsAsActivities.length, '→ Filtered:', allActivities.length, ')');

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
    // Check if this is a video call
    const isVideoCall = videoCallsAsActivities.some(vc => vc.id === activity.id);
    
    if (isVideoCall) {
      toaster.create({
        title: 'Cannot delete video calls',
        description: 'Video call records cannot be deleted from the activities page.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }
    
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
    // Check if this is a video call (converted from videoCalls array)
    const isVideoCall = videoCallsAsActivities.some(vc => vc.id === activity.id);
    
    console.log('[ActivitiesPage] View activity clicked:', activity.id, 'isVideoCall:', isVideoCall);
    
    if (isVideoCall) {
      // Find the original video call
      const videoCall = videoCalls.find(vc => vc.id === activity.id);
      if (videoCall) {
        console.log('[ActivitiesPage] Showing video call details:', videoCall);
        
        // Format the call details
        const startTime = videoCall.started_at 
          ? new Date(videoCall.started_at).toLocaleString()
          : 'Not started';
        const endTime = videoCall.ended_at 
          ? new Date(videoCall.ended_at).toLocaleString()
          : 'Not ended';
        const duration = videoCall.duration_formatted || '00:00';
        
        // Determine customer and vendor names
        const customerName = videoCall.recipient_name || 'Unknown';
        const vendorName = videoCall.initiator_name || 'Unknown';
        const callDate = new Date(videoCall.created_at).toLocaleString();
        
        console.log('[ActivitiesPage] Opening call details modal');
        setSelectedCall(videoCall);
        setIsCallDetailsOpen(true);
      }
    } else {
      // For regular activities, navigate to detail page
      console.log('[ActivitiesPage] Navigating to activity detail:', activity.id);
      navigate(`/activities/${activity.id}`);
    }
  };
  
  const handleBulkDelete = (activityIds: number[]) => {
    if (activityIds.length === 0) return;
    
    // Filter out video calls - they cannot be deleted
    const videoCallIds = videoCallsAsActivities.map(vc => vc.id);
    const regularActivityIds = activityIds.filter(id => !videoCallIds.includes(id));
    
    if (regularActivityIds.length === 0) {
      toaster.create({
        title: 'Cannot delete video calls',
        description: 'Video call records cannot be deleted from the activities page.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }
    
    if (regularActivityIds.length < activityIds.length) {
      toaster.create({
        title: 'Some items skipped',
        description: `${activityIds.length - regularActivityIds.length} video call(s) will not be deleted.`,
        type: 'info',
        duration: 3000,
      });
    }
    
    setActivitiesToBulkDelete(regularActivityIds);
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
      loadVideoCalls();
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
      <RequirePermission resource="activity">
        <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <PageHeader
          title="Activities"
          description="Manage calls, emails, Telegram messages, and other activities"
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
          onAddActivity={canCreate ? handleNewActivity : undefined}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : (
          <>
            {/* Activities Table - showing both activities and video calls */}
            <ActivitiesTable
              activities={allActivities}
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

      {/* Call Details Modal */}
      <DialogRoot 
        open={isCallDetailsOpen} 
        onOpenChange={(e: any) => !e.open && setIsCallDetailsOpen(false)}
      >
        <DialogContent maxW="600px">
          <DialogHeader>
            <Heading size="lg" color="gray.900">
              {selectedCall?.call_type === 'video' ? 'Video' : 'Audio'} Call Details
            </Heading>
            <DialogCloseTrigger />
          </DialogHeader>
          
          <DialogBody>
            {selectedCall && (
              <VStack align="stretch" gap={4} py={4}>
                {/* Status Badge */}
                <HStack justify="space-between">
                  <Text fontWeight="semibold" color="gray.700">Status:</Text>
                  <Badge
                    colorPalette={
                      selectedCall.status === 'completed' ? 'green' :
                      selectedCall.status === 'pending' ? 'orange' :
                      selectedCall.status === 'active' ? 'blue' : 'gray'
                    }
                    size="lg"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                  >
                    {selectedCall.status}
                  </Badge>
                </HStack>

                {/* Date */}
                <Box>
                  <Text fontWeight="semibold" color="gray.700" mb={1}>Date:</Text>
                  <Text color="gray.600">
                    {new Date(selectedCall.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </Box>

                {/* Customer */}
                <Box>
                  <Text fontWeight="semibold" color="gray.700" mb={1}>Customer:</Text>
                  <Text color="gray.600" fontSize="lg">
                    {selectedCall.recipient_name || 'Unknown'}
                  </Text>
                </Box>

                {/* Vendor */}
                <Box>
                  <Text fontWeight="semibold" color="gray.700" mb={1}>Vendor:</Text>
                  <Text color="gray.600" fontSize="lg">
                    {selectedCall.initiator_name || 'Unknown'}
                  </Text>
                </Box>

                {/* Duration */}
                {selectedCall.duration_formatted && selectedCall.duration_formatted !== '00:00' && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={1}>Duration:</Text>
                    <Text color="gray.600" fontSize="lg">
                      {selectedCall.duration_formatted}
                    </Text>
                  </Box>
                )}

                {/* Started At */}
                {selectedCall.started_at && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={1}>Started:</Text>
                    <Text color="gray.600">
                      {new Date(selectedCall.started_at).toLocaleString()}
                    </Text>
                  </Box>
                )}

                {/* Ended At */}
                {selectedCall.ended_at && (
                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={1}>Ended:</Text>
                    <Text color="gray.600">
                      {new Date(selectedCall.ended_at).toLocaleString()}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
      </RequirePermission>
    </DashboardLayout>
  );
};

export default ActivitiesPage;

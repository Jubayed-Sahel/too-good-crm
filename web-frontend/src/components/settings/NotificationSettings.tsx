import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../common';
import { notificationPreferencesService } from '@/services';
import { toaster } from '../ui/toaster';

interface NotificationState {
  emailNewLead: boolean;
  emailNewDeal: boolean;
  emailDealWon: boolean;
  emailDealLost: boolean;
  emailTeamActivity: boolean;
  emailWeeklySummary: boolean;
  emailMonthlyReport: boolean;
  pushNewLead: boolean;
  pushNewDeal: boolean;
  pushDealWon: boolean;
  pushDealLost: boolean;
  pushTeamActivity: boolean;
  pushMentions: boolean;
  pushTasksDue: boolean;
}

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState<NotificationState>({
    emailNewLead: true,
    emailNewDeal: true,
    emailDealWon: true,
    emailDealLost: false,
    emailTeamActivity: true,
    emailWeeklySummary: true,
    emailMonthlyReport: true,
    pushNewLead: true,
    pushNewDeal: true,
    pushDealWon: true,
    pushDealLost: false,
    pushTeamActivity: false,
    pushMentions: true,
    pushTasksDue: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationPreferencesService.getPreferences();
      setNotifications({
        emailNewLead: prefs.email_new_lead,
        emailNewDeal: prefs.email_new_deal,
        emailDealWon: prefs.email_deal_won,
        emailDealLost: prefs.email_deal_lost,
        emailTeamActivity: prefs.email_team_activity,
        emailWeeklySummary: prefs.email_weekly_summary,
        emailMonthlyReport: prefs.email_monthly_report,
        pushNewLead: prefs.push_new_lead,
        pushNewDeal: prefs.push_new_deal,
        pushDealWon: prefs.push_deal_won,
        pushDealLost: prefs.push_deal_lost,
        pushTeamActivity: prefs.push_team_activity,
        pushMentions: prefs.push_mentions,
        pushTasksDue: prefs.push_tasks_due,
      });
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load notification preferences',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const newValue = !notifications[key as keyof NotificationState];
    
    // Optimistically update UI
    setNotifications({
      ...notifications,
      [key]: newValue,
    });

    try {
      setSaving(true);
      // Map camelCase to snake_case for API
      const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      await notificationPreferencesService.updatePreferences({
        [apiKey]: newValue,
      } as any);
      
      toaster.create({
        title: 'Saved',
        description: 'Notification preference updated',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      // Revert on error
      setNotifications({
        ...notifications,
        [key]: !newValue,
      });
      toaster.create({
        title: 'Error',
        description: 'Failed to update notification preference',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const NotificationItem = ({ title, description, checked, onToggle }: {
    title: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <HStack justify="space-between" py={2} align="start">
      <Box flex="1" pr={4}>
        <Text fontSize="sm" fontWeight="medium" color="gray.900" mb={0.5}>
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {description}
        </Text>
      </Box>
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        colorPalette="blue"
        disabled={saving}
      />
    </HStack>
  );

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4} color="gray.500">Loading notification preferences...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Email Notifications */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Email Notifications
            </Text>
            {saving && <Spinner size="sm" />}
          </HStack>

          <VStack align="stretch" gap={2}>
            <NotificationItem
              title="New Lead Created"
              description="Get notified when a new lead is added to your pipeline"
              checked={notifications.emailNewLead}
              onToggle={() => handleToggle('emailNewLead')}
            />
            <NotificationItem
              title="New Deal Created"
              description="Get notified when a new deal is created"
              checked={notifications.emailNewDeal}
              onToggle={() => handleToggle('emailNewDeal')}
            />
            <NotificationItem
              title="Deal Won"
              description="Get notified when a deal is marked as won"
              checked={notifications.emailDealWon}
              onToggle={() => handleToggle('emailDealWon')}
            />
            <NotificationItem
              title="Deal Lost"
              description="Get notified when a deal is marked as lost"
              checked={notifications.emailDealLost}
              onToggle={() => handleToggle('emailDealLost')}
            />
            <NotificationItem
              title="Team Activity"
              description="Get notified about activities from your team members"
              checked={notifications.emailTeamActivity}
              onToggle={() => handleToggle('emailTeamActivity')}
            />
            <NotificationItem
              title="Weekly Summary"
              description="Receive a weekly summary of your activities"
              checked={notifications.emailWeeklySummary}
              onToggle={() => handleToggle('emailWeeklySummary')}
            />
            <NotificationItem
              title="Monthly Report"
              description="Receive a monthly performance report"
              checked={notifications.emailMonthlyReport}
              onToggle={() => handleToggle('emailMonthlyReport')}
            />
          </VStack>
        </VStack>
      </Card>

      {/* Push Notifications */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Push Notifications
            </Text>
            {saving && <Spinner size="sm" />}
          </HStack>

          <VStack align="stretch" gap={2}>
            <NotificationItem
              title="New Lead Created"
              description="Instant push notification for new leads"
              checked={notifications.pushNewLead}
              onToggle={() => handleToggle('pushNewLead')}
            />
            <NotificationItem
              title="New Deal Created"
              description="Instant push notification for new deals"
              checked={notifications.pushNewDeal}
              onToggle={() => handleToggle('pushNewDeal')}
            />
            <NotificationItem
              title="Deal Won"
              description="Instant push notification when deals are won"
              checked={notifications.pushDealWon}
              onToggle={() => handleToggle('pushDealWon')}
            />
            <NotificationItem
              title="Deal Lost"
              description="Instant push notification when deals are lost"
              checked={notifications.pushDealLost}
              onToggle={() => handleToggle('pushDealLost')}
            />
            <NotificationItem
              title="Team Activity"
              description="Real-time updates from team members"
              checked={notifications.pushTeamActivity}
              onToggle={() => handleToggle('pushTeamActivity')}
            />
            <NotificationItem
              title="Mentions"
              description="Get notified when someone mentions you"
              checked={notifications.pushMentions}
              onToggle={() => handleToggle('pushMentions')}
            />
            <NotificationItem
              title="Tasks Due"
              description="Reminders for upcoming task deadlines"
              checked={notifications.pushTasksDue}
              onToggle={() => handleToggle('pushTasksDue')}
            />
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default NotificationSettings;

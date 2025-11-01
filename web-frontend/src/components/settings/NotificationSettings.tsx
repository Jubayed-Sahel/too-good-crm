import { useState } from 'react';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../common';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
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
  });

  const handleToggle = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
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
      />
    </HStack>
  );

  return (
    <VStack align="stretch" gap={6}>
      {/* Email Notifications */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Email Notifications
          </Text>

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
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Push Notifications
          </Text>

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
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default NotificationSettings;

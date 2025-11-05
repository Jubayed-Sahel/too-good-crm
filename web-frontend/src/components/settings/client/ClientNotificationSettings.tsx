import { useState } from 'react';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { Card } from '../../common';
import { Switch } from '../../ui/switch';
import { FiBell, FiMail, FiMessageSquare, FiPackage, FiCreditCard } from 'react-icons/fi';

const ClientNotificationSettings = () => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    paymentReminders: true,
    vendorMessages: true,
    promotions: false,
    newsletter: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const handleToggle = (key: string) => {
    setSettings({
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    });
  };

  const NotificationItem = ({ 
    icon: Icon, 
    title, 
    description, 
    settingKey 
  }: {
    icon: any;
    title: string;
    description: string;
    settingKey: keyof typeof settings;
  }) => (
    <HStack
      justify="space-between"
      p={4}
      bg="gray.50"
      borderRadius="lg"
      _hover={{ bg: 'gray.100' }}
      transition="all 0.2s"
    >
      <HStack gap={3} flex={1}>
        <Box
          p={2}
          bg="white"
          borderRadius="md"
          color="blue.600"
        >
          <Icon size={20} />
        </Box>
        <VStack align="start" gap={0}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.900">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {description}
          </Text>
        </VStack>
      </HStack>
      <Switch
        checked={settings[settingKey]}
        onCheckedChange={() => handleToggle(settingKey)}
        colorPalette="blue"
      />
    </HStack>
  );

  return (
    <VStack align="stretch" gap={6}>
      {/* Email Notifications */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack gap={2}>
            <Box
              p={2}
              bg="blue.100"
              borderRadius="md"
              color="blue.600"
            >
              <FiMail size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Email Notifications
              </Text>
              <Text fontSize="xs" color="gray.600">
                Manage your email notification preferences
              </Text>
            </VStack>
          </HStack>

          <VStack align="stretch" gap={3}>
            <NotificationItem
              icon={FiPackage}
              title="Order Updates"
              description="Get notified about your order status changes"
              settingKey="orderUpdates"
            />
            <NotificationItem
              icon={FiCreditCard}
              title="Payment Reminders"
              description="Receive reminders for upcoming payments"
              settingKey="paymentReminders"
            />
            <NotificationItem
              icon={FiMessageSquare}
              title="Vendor Messages"
              description="Be notified when vendors send you messages"
              settingKey="vendorMessages"
            />
            <NotificationItem
              icon={FiBell}
              title="Promotions"
              description="Receive promotional offers and deals"
              settingKey="promotions"
            />
            <NotificationItem
              icon={FiMail}
              title="Newsletter"
              description="Get our weekly newsletter with tips and updates"
              settingKey="newsletter"
            />
          </VStack>
        </VStack>
      </Card>

      {/* Other Notifications */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack gap={2}>
            <Box
              p={2}
              bg="purple.100"
              borderRadius="md"
              color="purple.600"
            >
              <FiBell size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Other Notifications
              </Text>
              <Text fontSize="xs" color="gray.600">
                Additional notification channels
              </Text>
            </VStack>
          </HStack>

          <VStack align="stretch" gap={3}>
            <NotificationItem
              icon={FiMessageSquare}
              title="SMS Notifications"
              description="Receive important updates via text message"
              settingKey="smsNotifications"
            />
            <NotificationItem
              icon={FiBell}
              title="Push Notifications"
              description="Get push notifications in your browser"
              settingKey="pushNotifications"
            />
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default ClientNotificationSettings;

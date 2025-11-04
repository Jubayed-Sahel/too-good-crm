import { useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, Input, Grid } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { Checkbox } from '../components/ui/checkbox';
import { FiUser, FiBell, FiLock, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';
import { toaster } from '../components/ui/toaster';

const ClientSettingsPage = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Startup Inc',
    address: '123 Business St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  });

  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailNewMessages: true,
    emailPaymentReminders: true,
    smsOrderUpdates: false,
    smsPaymentReminders: true,
  });

  const handleSaveProfile = () => {
    toaster.create({
      title: 'Profile updated',
      description: 'Your profile information has been saved successfully.',
      type: 'success',
      duration: 3000,
    });
  };

  const handleSaveNotifications = () => {
    toaster.create({
      title: 'Notification preferences updated',
      description: 'Your notification settings have been saved.',
      type: 'success',
      duration: 3000,
    });
  };

  return (
    <DashboardLayout title="Client Settings">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            Settings
          </Heading>
          <Text fontSize="md" color="gray.600">
            Manage your account preferences and profile information
          </Text>
        </Box>

        {/* Profile Information */}
        <Card>
          <VStack align="stretch" gap={5}>
            <HStack gap={3} mb={2}>
              <Box
                p={3}
                bg="blue.100"
                borderRadius="lg"
                color="blue.600"
              >
                <FiUser size={24} />
              </Box>
              <Box>
                <Heading size="lg" color="gray.900">
                  Profile Information
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Update your personal details
                </Text>
              </Box>
            </HStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  First Name
                </Text>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Last Name
                </Text>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Email Address
                </Text>
                <HStack>
                  <FiMail color="#667eea" />
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    size="lg"
                  />
                </HStack>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Phone Number
                </Text>
                <HStack>
                  <FiPhone color="#667eea" />
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    size="lg"
                  />
                </HStack>
              </Box>

              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Company Name
                </Text>
                <Input
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  size="lg"
                />
              </Box>
            </Grid>

            <Box pt={2}>
              <Button
                colorPalette="blue"
                size="lg"
                onClick={handleSaveProfile}
              >
                <HStack gap={2}>
                  <FiSave size={18} />
                  <Text>Save Profile</Text>
                </HStack>
              </Button>
            </Box>
          </VStack>
        </Card>

        {/* Address Information */}
        <Card>
          <VStack align="stretch" gap={5}>
            <HStack gap={3} mb={2}>
              <Box
                p={3}
                bg="purple.100"
                borderRadius="lg"
                color="purple.600"
              >
                <FiMapPin size={24} />
              </Box>
              <Box>
                <Heading size="lg" color="gray.900">
                  Address
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Your billing and shipping address
                </Text>
              </Box>
            </HStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Street Address
                </Text>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  City
                </Text>
                <Input
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  State
                </Text>
                <Input
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  ZIP Code
                </Text>
                <Input
                  value={profile.zipCode}
                  onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                  size="lg"
                />
              </Box>
            </Grid>

            <Box pt={2}>
              <Button
                colorPalette="purple"
                size="lg"
                onClick={handleSaveProfile}
              >
                <HStack gap={2}>
                  <FiSave size={18} />
                  <Text>Save Address</Text>
                </HStack>
              </Button>
            </Box>
          </VStack>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <VStack align="stretch" gap={5}>
            <HStack gap={3} mb={2}>
              <Box
                p={3}
                bg="orange.100"
                borderRadius="lg"
                color="orange.600"
              >
                <FiBell size={24} />
              </Box>
              <Box>
                <Heading size="lg" color="gray.900">
                  Notification Preferences
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Choose how you want to be notified
                </Text>
              </Box>
            </HStack>

            <VStack align="stretch" gap={4}>
              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                  Email Notifications
                </Text>
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">Order updates and status changes</Text>
                    <Checkbox
                      checked={notifications.emailOrderUpdates}
                      onCheckedChange={(e: any) => setNotifications({ ...notifications, emailOrderUpdates: e.checked })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">New messages from vendors</Text>
                    <Checkbox
                      checked={notifications.emailNewMessages}
                      onCheckedChange={(e: any) => setNotifications({ ...notifications, emailNewMessages: e.checked })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">Payment reminders</Text>
                    <Checkbox
                      checked={notifications.emailPaymentReminders}
                      onCheckedChange={(e: any) => setNotifications({ ...notifications, emailPaymentReminders: e.checked })}
                    />
                  </HStack>
                </VStack>
              </Box>

              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                  SMS Notifications
                </Text>
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">Order status updates</Text>
                    <Checkbox
                      checked={notifications.smsOrderUpdates}
                      onCheckedChange={(e: any) => setNotifications({ ...notifications, smsOrderUpdates: e.checked })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">Payment reminders</Text>
                    <Checkbox
                      checked={notifications.smsPaymentReminders}
                      onCheckedChange={(e: any) => setNotifications({ ...notifications, smsPaymentReminders: e.checked })}
                    />
                  </HStack>
                </VStack>
              </Box>
            </VStack>

            <Box pt={2}>
              <Button
                colorPalette="orange"
                size="lg"
                onClick={handleSaveNotifications}
              >
                <HStack gap={2}>
                  <FiSave size={18} />
                  <Text>Save Preferences</Text>
                </HStack>
              </Button>
            </Box>
          </VStack>
        </Card>

        {/* Security Settings */}
        <Card>
          <VStack align="stretch" gap={5}>
            <HStack gap={3} mb={2}>
              <Box
                p={3}
                bg="red.100"
                borderRadius="lg"
                color="red.600"
              >
                <FiLock size={24} />
              </Box>
              <Box>
                <Heading size="lg" color="gray.900">
                  Security
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Manage your password and security settings
                </Text>
              </Box>
            </HStack>

            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Current Password
                </Text>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  New Password
                </Text>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  size="lg"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Confirm New Password
                </Text>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  size="lg"
                />
              </Box>
            </VStack>

            <Box pt={2}>
              <Button
                colorPalette="red"
                size="lg"
              >
                <HStack gap={2}>
                  <FiLock size={18} />
                  <Text>Update Password</Text>
                </HStack>
              </Button>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </DashboardLayout>
  );
};

export default ClientSettingsPage;

import { useState } from 'react';
import { Box, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { ClientProfileSettings } from '../components/settings/client';
import { SecuritySettings } from '../components/settings';

const ClientSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ClientProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <ClientProfileSettings />;
    }
  };

  return (
    <DashboardLayout title="Client Settings">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <Box>
          <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="2xl" mb={2}>
                Settings
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Manage your account preferences and profile information
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Tabs */}
        <Box
          overflowX="auto"
          borderBottomWidth="1px"
          borderColor="gray.200"
          bg="white"
          borderRadius="lg"
          p={1}
        >
          <HStack gap={1} minW="max-content">
            {tabs.map((tab) => (
              <Box
                key={tab.id}
                px={4}
                py={3}
                cursor="pointer"
                borderRadius="md"
                bg={activeTab === tab.id ? 'blue.50' : 'transparent'}
                color={activeTab === tab.id ? 'blue.600' : 'gray.600'}
                fontWeight={activeTab === tab.id ? 'semibold' : 'medium'}
                fontSize="sm"
                onClick={() => setActiveTab(tab.id)}
                _hover={{
                  bg: activeTab === tab.id ? 'blue.50' : 'gray.50',
                }}
                transition="all 0.2s"
                whiteSpace="nowrap"
              >
                <Text>{tab.label}</Text>
              </Box>
            ))}
          </HStack>
        </Box>

        {/* Tab Content */}
        {renderTabContent()}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientSettingsPage;

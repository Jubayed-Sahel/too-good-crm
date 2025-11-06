import { Box, HStack, Text } from '@chakra-ui/react';

interface SettingsTab {
  id: string;
  label: string;
  icon?: string;
}

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'organization', label: 'Organization' },
  { id: 'team', label: 'Team Members' },
  { id: 'roles', label: 'Roles & Permissions' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
];

const SettingsTabs = ({ activeTab, onTabChange }: SettingsTabsProps) => {
  return (
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
            onClick={() => onTabChange(tab.id)}
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
  );
};

export default SettingsTabs;

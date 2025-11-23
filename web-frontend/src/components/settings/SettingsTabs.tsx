import { Box, HStack, Text } from '@chakra-ui/react';

interface SettingsTab {
  id: string;
  label: string;
  icon?: string;
}

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs?: string[]; // Optional array of tab IDs to show
}

// All available tabs with their labels
const allTabs: Record<string, string> = {
  profile: 'Profile',
  organization: 'Organization',
  team: 'Team',
  roles: 'Roles',
  notifications: 'Notifications',
  security: 'Security',
  billing: 'Billing',
};

// Default tabs (for backward compatibility)
const defaultTabs: SettingsTab[] = [
  { id: 'organization', label: 'Organization' },
  { id: 'security', label: 'Security' },
];

const SettingsTabs = ({ activeTab, onTabChange, tabs: tabIds }: SettingsTabsProps) => {
  // If specific tabs are provided, use them; otherwise use default
  const tabs: SettingsTab[] = tabIds
    ? tabIds.map(id => ({ id, label: allTabs[id] || id }))
    : defaultTabs;
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

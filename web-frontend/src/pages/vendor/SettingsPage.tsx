import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  SettingsHeader,
  SettingsTabs,
  OrganizationSettings,
  TeamSettings,
  RolesSettings,
  NotificationSettings,
  SecuritySettings,
} from '../../components/settings';

const vendorTabs = [
  { id: 'organization', label: 'Organization' },
  { id: 'team', label: 'Team' },
  { id: 'roles', label: 'Roles' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('organization');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return <OrganizationSettings />;
      case 'team':
        return <TeamSettings />;
      case 'roles':
        return <RolesSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <OrganizationSettings />;
    }
  };

  return (
    <DashboardLayout title="Settings">
      <VStack align="stretch" gap={5}>
        <SettingsHeader />
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={vendorTabs} />
        {renderTabContent()}
      </VStack>
    </DashboardLayout>
  );
};

export default SettingsPage;

import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  SettingsHeader,
  SettingsTabs,
  ProfileSettings,
  SecuritySettings,
} from '../../components/settings';

const employeeTabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
];

const EmployeeSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <DashboardLayout title="Settings">
      <VStack align="stretch" gap={5}>
        <SettingsHeader />
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={employeeTabs} />
        {renderTabContent()}
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeSettingsPage;

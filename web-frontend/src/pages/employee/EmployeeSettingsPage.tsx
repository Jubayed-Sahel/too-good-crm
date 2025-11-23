import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  SettingsHeader,
  SettingsTabs,
  ProfileSettings,
  OrganizationSettings,
  TeamSettings,
  RolesSettings,
  NotificationSettings,
  SecuritySettings,
  BillingSettings,
} from '../../components/settings';

const EmployeeSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
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
      case 'billing':
        return <BillingSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <DashboardLayout title="Settings">
      <VStack align="stretch" gap={5}>
        <SettingsHeader />
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeSettingsPage;

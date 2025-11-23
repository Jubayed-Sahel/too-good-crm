import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  SettingsHeader,
  SettingsTabs,
  OrganizationSettings,
  TeamSettings,
  RolesSettings,
  SecuritySettings,
} from '../../components/settings';

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
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </VStack>
    </DashboardLayout>
  );
};

export default SettingsPage;

import { useState, useEffect } from 'react';
import { VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  SettingsHeader,
  SettingsTabs,
  ProfileSettings,
  OrganizationSettings,
  NotificationSettings,
  SecuritySettings,
  BillingSettings,
} from '../components/settings';
import { usePermissions } from '@/contexts/PermissionContext';

const SettingsPage = () => {
  const { isVendor } = usePermissions();
  // Vendors default to organization tab, others default to profile
  const [activeTab, setActiveTab] = useState(isVendor ? 'organization' : 'profile');

  // Update tab when vendor status changes
  useEffect(() => {
    if (isVendor && activeTab === 'profile') {
      setActiveTab('organization');
    }
  }, [isVendor, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'organization':
        return <OrganizationSettings />;
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

export default SettingsPage;

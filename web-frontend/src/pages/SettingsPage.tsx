import { useState, useEffect } from 'react';
import { VStack } from '@chakra-ui/react';
import { useProfile } from '../contexts/ProfileContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
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
} from '../components/settings';

const SettingsPage = () => {
  const { activeProfileType } = useProfile();
  const isVendor = activeProfileType === 'vendor';
  
  // Default tab based on profile type
  const defaultTab = isVendor ? 'organization' : 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Update active tab when profile type changes
  useEffect(() => {
    if (isVendor && (activeTab === 'profile' || activeTab === 'billing' || activeTab === 'notifications')) {
      setActiveTab('organization');
    } else if (!isVendor && (activeTab === 'team' || activeTab === 'roles' || activeTab === 'notifications')) {
      setActiveTab('profile');
    }
  }, [isVendor, activeTab]);

  // Define tabs based on profile type
  const tabs = isVendor
    ? [
        { id: 'organization', label: 'Organization' },
        { id: 'team', label: 'Team' },
        { id: 'roles', label: 'Roles' },
        { id: 'security', label: 'Security' },
      ]
    : [
        { id: 'profile', label: 'Profile' },
        { id: 'organization', label: 'Organization' },
        { id: 'security', label: 'Security' },
        { id: 'billing', label: 'Billing' },
      ];

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
        return isVendor ? <OrganizationSettings /> : <ProfileSettings />;
    }
  };

  return (
    <DashboardLayout title="Settings">
      <VStack align="stretch" gap={5}>
        <SettingsHeader />
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
        {renderTabContent()}
      </VStack>
    </DashboardLayout>
  );
};

export default SettingsPage;

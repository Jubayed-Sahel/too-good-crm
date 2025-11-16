/**
 * Team Page with Tabs for Team Members, Roles, and Permissions
 * Complete team management solution for vendors
 */
import { useState } from 'react';
import { Box, VStack, HStack, Text, Tabs } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/common';
import { FiUsers, FiShield, FiLock } from 'react-icons/fi';
import { TeamMembersTab } from '../../components/team/TeamMembersTab';
import { RolesTab } from '../../components/team/RolesTab';
import { PermissionsTab } from '../../components/team/PermissionsTab';

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('members');

  const tabs = [
    { id: 'members', label: 'Team Members', icon: FiUsers },
    { id: 'roles', label: 'Roles', icon: FiShield },
    { id: 'permissions', label: 'Permissions', icon: FiLock },
  ];

  return (
    <DashboardLayout title="Team">
      <VStack align="stretch" gap={5}>
        {/* Page Header */}
        <PageHeader
          title="Team Management"
          description="Manage team members, roles, and permissions for your organization"
        />

        {/* Tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(e) => setActiveTab(e.value)}
          variant="enclosed"
        >
          <Tabs.List>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tabs.Trigger key={tab.id} value={tab.id}>
                  <HStack gap={2}>
                    <Icon size={18} />
                    <Text>{tab.label}</Text>
                  </HStack>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          <Box mt={4}>
            <Tabs.Content value="members">
              <TeamMembersTab />
            </Tabs.Content>

            <Tabs.Content value="roles">
              <RolesTab />
            </Tabs.Content>

            <Tabs.Content value="permissions">
              <PermissionsTab />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </DashboardLayout>
  );
};

export default TeamPage;


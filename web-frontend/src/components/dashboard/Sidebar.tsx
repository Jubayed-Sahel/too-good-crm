import { Box, Flex, Heading, Text, VStack, Button, HStack, Badge } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiUserPlus,
  FiTrendingUp,
  FiActivity,
  FiShoppingBag,
  FiPackage,
  FiCreditCard,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckSquare,
} from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { useAccountMode } from '@/contexts/AccountModeContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks';
import { useState, useMemo, useCallback, memo } from 'react';
import { RoleSelectionDialog } from '../auth';
import { toaster } from '../ui/toaster';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { isClientMode } = useAccountMode();
  const { canAccess, isVendor, isLoading: permissionsLoading } = usePermissions();
  const { logout, switchRole } = useAuth();
  const { profiles, activeProfile } = useProfile();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Memoize current profile to prevent unnecessary recalculations
  const currentProfile = useMemo(() => 
    activeProfile || profiles?.[0],
    [activeProfile, profiles]
  );

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleOpenRoleSwitcher = useCallback(() => {
    setShowRoleSwitcher(true);
  }, []);

  const handleSwitchRole = useCallback(async (profileId: number) => {
    setIsSwitching(true);
    try {
      const selectedProfile = profiles?.find(p => p.id === profileId);
      
      toaster.create({
        title: "Switching Profile",
        description: `Switching to ${selectedProfile?.profile_type_display}...`,
        type: "info",
        duration: 2000,
      });
      
      await switchRole(profileId);
      // Note: Page will reload, so no need to reset state or close dialog
    } catch (error) {
      console.error('Failed to switch role:', error);
      setIsSwitching(false);
      
      toaster.create({
        title: "Switch Failed",
        description: "Failed to switch profile. Please try again.",
        type: "error",
        duration: 3000,
      });
      // Only reset on error since page won't reload
    }
  }, [switchRole, profiles]);

  // Vendor menu items (full access)
  const vendorMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard', resource: 'dashboard' },
    { icon: FiUsers, label: 'Customers', path: '/customers', resource: 'customers' },
    { icon: FiTrendingUp, label: 'Sales', path: '/sales', resource: 'deals' },
    { icon: FiFileText, label: 'Deals', path: '/deals', resource: 'deals' },
    { icon: FiUserPlus, label: 'Leads', path: '/leads', resource: 'leads' },
    { icon: FiActivity, label: 'Activities', path: '/activities', resource: 'activities' },
    { icon: FiAlertCircle, label: 'Issues', path: '/issues', resource: 'issues' },
    { icon: FiBarChart2, label: 'Analytics', path: '/analytics', resource: 'analytics' },
    { icon: HiUserGroup, label: 'Team', path: '/team', resource: 'employees' },
    { icon: FiSettings, label: 'Settings', path: '/settings', resource: 'settings' },
  ];

  // Employee menu items
  const employeeMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/employee/dashboard', resource: 'dashboard' },
    { icon: FiCheckSquare, label: 'My Tasks', path: '/employee/tasks', resource: 'tasks' },
    { icon: FiUsers, label: 'Customers', path: '/employee/customers', resource: 'customers' },
    { icon: FiFileText, label: 'Deals', path: '/employee/deals', resource: 'deals' },
    { icon: FiUserPlus, label: 'Leads', path: '/employee/leads', resource: 'leads' },
    { icon: FiActivity, label: 'Activities', path: '/employee/activities', resource: 'activities' },
    { icon: FiSettings, label: 'Settings', path: '/employee/settings', resource: 'settings' },
  ];

  // Client menu items
  const clientMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/client/dashboard', resource: 'vendors' },
    { icon: FiShoppingBag, label: 'My Vendors', path: '/client/vendors', resource: 'vendors' },
    { icon: FiPackage, label: 'My Orders', path: '/client/orders', resource: 'orders' },
    { icon: FiCreditCard, label: 'Payments', path: '/client/payments', resource: 'payments' },
    { icon: FiActivity, label: 'Activities', path: '/client/activities', resource: 'activities' },
    { icon: FiAlertCircle, label: 'Issues', path: '/client/issues', resource: 'issues' },
    { icon: FiSettings, label: 'Settings', path: '/client/settings', resource: 'settings' },
  ];

  // Get menu items - employees only see items they have permission for
  const menuItems = useMemo(() => {
    // Determine which menu to use based on profile type
    // Priority: currentProfile.profile_type > isClientMode
    let items;
    
    const profileType = currentProfile?.profile_type;
    
    if (profileType === 'customer' || isClientMode) {
      // Customer/Client mode - show client menu
      items = clientMenuItems;
    } else if (profileType === 'employee') {
      // Employee mode - use employee-specific menu items, filtered by permissions
      // Map vendor menu items to employee paths and filter by permissions
      items = vendorMenuItems
        .map(item => {
          // Map to employee-specific paths
          const employeePathMap: Record<string, string> = {
            '/dashboard': '/employee/dashboard',
            '/customers': '/employee/customers',
            '/sales': '/employee/deals', // Sales uses deals
            '/deals': '/employee/deals',
            '/leads': '/employee/leads',
            '/activities': '/employee/activities',
            '/issues': '/issues', // Keep same path
            '/analytics': '/analytics', // Keep same path
            '/team': '/team', // Keep same path (but will be filtered out)
            '/settings': '/employee/settings',
          };
          
          return {
            ...item,
            path: employeePathMap[item.path] || item.path,
          };
        })
        .filter((item, index, self) => {
          // Always show these items regardless of permissions
          if (item.resource === 'dashboard' || item.resource === 'settings' || item.resource === 'customers') {
            return true;
          }
          // Hide team page for employees (vendor only)
          if (item.resource === 'employees') {
            return false;
          }
          // Remove "Sales" for employees since it maps to the same path as "Deals"
          // Check if another item with the same path exists (Deals)
          const duplicatePath = self.findIndex((otherItem, otherIndex) => 
            otherIndex !== index && otherItem.path === item.path
          );
          if (duplicatePath >= 0 && item.label === 'Sales') {
            return false; // Remove Sales, keep Deals
          }
          // For other items, check if employee has permission
          return canAccess(item.resource);
        });
      
      // Add "My Tasks" as first item after Dashboard for employees
      const tasksItem = { 
        icon: FiCheckSquare, 
        label: 'My Tasks', 
        path: '/employee/tasks', 
        resource: 'tasks' 
      };
      // Insert after dashboard
      const dashboardIndex = items.findIndex(item => item.resource === 'dashboard');
      if (dashboardIndex >= 0) {
        items.splice(dashboardIndex + 1, 0, tasksItem);
      } else {
        items.unshift(tasksItem);
      }
    } else {
      // Vendor mode (default) - show vendor menu (full access)
      items = vendorMenuItems;
    }
    
    // If permissions are still loading, return empty array to avoid flicker
    if (permissionsLoading) {
      return [];
    }
    
    // All items in the list are accessible (already filtered for employees)
    return items.map(item => ({
      ...item,
      hasAccess: true, // All items shown are accessible
    }));
  }, [isClientMode, currentProfile, isVendor, canAccess, permissionsLoading]);

  // Check if user has multiple profiles (memoized)
  const hasMultipleProfiles = useMemo(() => 
    profiles && profiles.length > 1,
    [profiles]
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={19}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w={{ base: '280px', md: '280px' }}
        bg="white"
        borderRight="1px"
        borderColor="gray.200"
        zIndex={20}
        transform={{
          base: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          md: 'translateX(0)',
        }}
        transition="transform 0.3s"
        overflowY="auto"
      >
        <VStack align="stretch" h="full" gap={0}>
          {/* Logo Section */}
          <Box p={6} borderBottom="1px" borderColor="gray.200">
            <Flex align="center" gap={3} mb={4}>
              <Box
                w="10"
                h="10"
                bg={isClientMode ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="md"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Box>
              <Box>
                <Heading
                  size="md"
                  bgGradient={isClientMode ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
                  bgClip="text"
                  fontWeight="bold"
                >
                  LeadGrid
                </Heading>
                <Text fontSize="xs" color={isClientMode ? "blue.600" : "purple.600"} fontWeight="semibold">
                  {isClientMode ? 'Client Portal' : 'CRM Platform'}
                </Text>
              </Box>
            </Flex>

            {/* Current Profile */}
            {currentProfile && (
              <Box
                p={3}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                      Active Profile
                    </Text>
                    <Badge colorPalette={
                      currentProfile.profile_type === 'vendor' ? 'purple' :
                      currentProfile.profile_type === 'employee' ? 'blue' : 'green'
                    } size="sm">
                      {currentProfile.profile_type_display}
                    </Badge>
                  </HStack>
                  {hasMultipleProfiles && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="purple"
                      onClick={handleOpenRoleSwitcher}
                      w="full"
                    >
                      <FiRefreshCw size={14} />
                      <Text ml={1}>Switch Profile ({profiles?.length})</Text>
                    </Button>
                  )}
                </VStack>
              </Box>
            )}
          </Box>

          {/* Navigation Menu */}
          <VStack align="stretch" flex={1} p={4} gap={1}>
            {menuItems.map((item) => {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{ textDecoration: 'none' }}
                >
                  {({ isActive }) => (
                    <Flex
                      align="center"
                      gap={3}
                      px={4}
                      py={3}
                      borderRadius="lg"
                      bg={isActive ? (isClientMode ? 'blue.50' : 'purple.50') : 'transparent'}
                      color={
                        isActive 
                          ? (isClientMode ? 'blue.600' : 'purple.600') 
                          : 'gray.700'
                      }
                      fontWeight={isActive ? 'semibold' : 'medium'}
                      _hover={{
                        bg: isActive ? (isClientMode ? 'blue.50' : 'purple.50') : 'gray.50',
                        color: isActive 
                          ? (isClientMode ? 'blue.600' : 'purple.600') 
                          : 'gray.900',
                      }}
                      cursor="pointer"
                      transition="all 0.2s"
                      position="relative"
                    >
                      <Box as={item.icon} fontSize="lg" />
                      <Text flex={1}>{item.label}</Text>
                    </Flex>
                  )}
                </NavLink>
              );
            })}
          </VStack>

          {/* Sign Out Button */}
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              px={4}
              color="red.600"
              _hover={{ bg: 'red.50' }}
            >
              <Flex align="center" gap={3}>
                <FiLogOut />
                <Text>Sign Out</Text>
              </Flex>
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* Role Switcher Dialog - Only render when needed */}
      {showRoleSwitcher && profiles && profiles.length > 0 && (
        <RoleSelectionDialog
          open={showRoleSwitcher}
          profiles={profiles}
          onSelectRole={handleSwitchRole}
          isLoading={isSwitching}
        />
      )}
    </>
  );
};

export default memo(Sidebar);

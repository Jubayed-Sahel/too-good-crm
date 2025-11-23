import { Box, Flex, Heading, Text, VStack, Button, HStack, Badge } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
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
  FiBriefcase,
  FiGrid,
  FiChevronDown,
  FiChevronRight,
  FiMessageSquare,
} from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { useAccountMode } from '@/contexts/AccountModeContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks';
import { useState, useMemo, useCallback, memo } from 'react';
import { RoleSelectionDialog } from '../auth';
import { toaster } from '../ui/toaster';
import { CRM_RESOURCES } from '@/utils/permissions';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { isClientMode } = useAccountMode();
  const { hasPermission, isVendor, isLoading: permissionsLoading, isEmployee, isOwner } = usePermissions();
  const { logout, switchRole } = useAuth();
  const { profiles, activeProfile } = useProfile();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

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

  // Define all CRM menu items with their permissions
  // This structure supports nested menus (children)
  interface MenuItem {
    icon: React.ComponentType;
    label: string;
    path: string;
    resource?: string;
    action?: string;
    children?: MenuItem[];
    alwaysShow?: boolean; // For dashboard, settings, etc.
  }

  // Vendor menu items - same structure for both vendors and employees
  // Employees will see filtered items based on their permissions
  const vendorMenuItems: MenuItem[] = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard', alwaysShow: true },
    { icon: FiUsers, label: 'Customers', path: '/customers', resource: CRM_RESOURCES.CUSTOMER, action: 'read' },
    { icon: FiTrendingUp, label: 'Sales', path: '/sales', resource: CRM_RESOURCES.ORDER, action: 'read' },
    { icon: FiActivity, label: 'Activities', path: '/activities', resource: CRM_RESOURCES.ACTIVITY, action: 'read' },
    { icon: FiMessageSquare, label: 'Messages', path: '/messages', alwaysShow: true },
    { icon: FiAlertCircle, label: 'Issues', path: '/issues', resource: CRM_RESOURCES.ISSUE, action: 'read' },
    { icon: HiUserGroup, label: 'Team', path: '/team', resource: CRM_RESOURCES.EMPLOYEE, action: 'read' },
    { icon: FiSettings, label: 'Settings', path: '/settings', alwaysShow: true },
  ];

  // Client menu items
  const clientMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/client/dashboard', alwaysShow: true },
    { icon: FiShoppingBag, label: 'My Vendors', path: '/client/vendors', resource: CRM_RESOURCES.VENDOR, action: 'read' },
    { icon: FiPackage, label: 'My Orders', path: '/client/orders', resource: CRM_RESOURCES.ORDER, action: 'read' },
    { icon: FiMessageSquare, label: 'Messages', path: '/messages', alwaysShow: true },
    { icon: FiAlertCircle, label: 'Issues', path: '/client/issues', resource: CRM_RESOURCES.ISSUE, action: 'read' },
    { icon: FiSettings, label: 'Settings', path: '/client/settings', alwaysShow: true },
  ];

  /**
   * Check if a menu item should be shown based on permissions
   */
  const shouldShowMenuItem = useCallback((item: MenuItem): boolean => {
    // Always show items marked as alwaysShow
    if (item.alwaysShow) {
      return true;
    }

    // Vendors and owners see everything
    if (isVendor || isOwner) {
      return true;
    }

    // If no resource specified, show it
    if (!item.resource) {
      return true;
    }

    // Check permission using hasPermission helper
    const result = hasPermission(item.resource, item.action || 'read');
    return result.hasPermission;
  }, [hasPermission, isVendor, isOwner]);

  /**
   * Check if a parent menu should be shown (if at least one child is allowed)
   */
  const shouldShowParentMenu = useCallback((item: MenuItem): boolean => {
    // If no children, check the item itself
    if (!item.children || item.children.length === 0) {
      return shouldShowMenuItem(item);
    }

    // Check if at least one child is allowed
    return item.children.some(child => shouldShowMenuItem(child));
  }, [shouldShowMenuItem]);

  /**
   * Toggle expanded state for nested menus
   */
  const toggleMenu = useCallback((path: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // Get menu items - employees see same menu as vendors but filtered by permissions
  const menuItems = useMemo(() => {
    // Determine which menu to use based on profile type
    const profileType = currentProfile?.profile_type;
    
    if (profileType === 'customer' || isClientMode) {
      // Customer/Client mode - show client menu
      return clientMenuItems;
    } else if (profileType === 'employee') {
      // Employee mode - use vendor menu structure but filter by permissions
      if (permissionsLoading) {
        return []; // Don't show anything while loading
      }

      // Filter and process vendor menu items based on employee permissions
      return vendorMenuItems
        .map(item => {
          // Check if parent should be shown
          if (!shouldShowParentMenu(item)) {
            return null;
          }

          // If item has children, filter them
          if (item.children && item.children.length > 0) {
            const visibleChildren = item.children.filter(child =>
              shouldShowMenuItem(child)
            );

            // Only show parent if at least one child is visible
            if (visibleChildren.length === 0) {
              return null;
            }

            return {
              ...item,
              children: visibleChildren,
            };
          }

          // Regular menu item
          return item;
        })
        .filter((item): item is MenuItem => item !== null);
    } else {
      // Vendor mode (default) - show vendor menu (full access, no filtering)
      return vendorMenuItems;
    }
  }, [
    isClientMode, 
    currentProfile, 
    isVendor, 
    permissionsLoading, 
    isEmployee,
    shouldShowMenuItem,
    shouldShowParentMenu,
  ]);

  // Check if user has multiple profiles (memoized)
  // Filter profiles:
  // - Vendor profiles: Always show (new users can sign up as vendors)
  // - Customer profiles: Always show (new users can sign up as customers)
  // - Employee profiles: Only show if assigned by vendor (has organization)
  const validProfiles = useMemo(() => {
    const filtered = profiles?.filter(profile => {
      if (profile.profile_type === 'employee') {
        // Employee profiles: Only show if they have an organization (assigned by vendor)
        return !!profile.organization;
      }
      // Vendor and customer profiles: Always show
      return true;
    }) || [];
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log('[Sidebar] Profile check:', {
        totalProfiles: profiles?.length,
        validProfiles: filtered.length,
        profileTypes: filtered.map(p => p.profile_type),
        currentProfile: currentProfile?.profile_type
      });
    }
    
    return filtered;
  }, [profiles, currentProfile]);

  const hasMultipleProfiles = useMemo(() => 
    validProfiles && validProfiles.length > 1,
    [validProfiles]
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
                      <Text ml={1}>Switch Profile ({validProfiles?.length})</Text>
                    </Button>
                  )}
                </VStack>
              </Box>
            )}
          </Box>

          {/* Navigation Menu */}
          <VStack align="stretch" flex={1} p={4} gap={1} overflowY="auto">
            {permissionsLoading && isEmployee ? (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">Loading permissions...</Text>
              </Box>
            ) : menuItems.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No menu items available based on your permissions.
                </Text>
              </Box>
            ) : (
              menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus.has(item.path);

                // Render nested menu (with children)
                if (hasChildren) {
                  return (
                    <Box key={item.path}>
                      <Box
                        as="button"
                        w="full"
                        px={4}
                        py={3}
                        borderRadius="lg"
                        bg="transparent"
                        color="gray.700"
                        fontWeight="medium"
                        _hover={{
                          bg: 'gray.50',
                          color: 'gray.900',
                        }}
                        cursor="pointer"
                        transition="all 0.2s"
                        textAlign="left"
                        onClick={() => toggleMenu(item.path)}
                      >
                        <Flex align="center" gap={3}>
                          <Box as={item.icon} fontSize="lg" />
                          <Text flex={1}>{item.label}</Text>
                          <Box 
                            as={isExpanded ? FiChevronDown : FiChevronRight} 
                            fontSize="sm" 
                          />
                        </Flex>
                      </Box>
                      {isExpanded && item.children && (
                        <VStack align="stretch" pl={8} gap={1} mt={1}>
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              style={{ textDecoration: 'none' }}
                              onClick={onClose}
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
                                >
                                  <Box as={child.icon} fontSize="lg" />
                                  <Text flex={1}>{child.label}</Text>
                                </Flex>
                              )}
                            </NavLink>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  );
                }

                // Render regular menu item (no children)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={{ textDecoration: 'none' }}
                    onClick={onClose}
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
              })
            )}
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
      {showRoleSwitcher && validProfiles && validProfiles.length > 0 && (
        <RoleSelectionDialog
          open={showRoleSwitcher}
          profiles={validProfiles}
          onSelectRole={handleSwitchRole}
          isLoading={isSwitching}
        />
      )}
    </>
  );
};

export default memo(Sidebar);

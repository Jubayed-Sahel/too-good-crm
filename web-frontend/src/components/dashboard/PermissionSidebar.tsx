/**
 * Permission-Aware Sidebar Component
 * 
 * Features:
 * - Shows menu items only if employee has required permission
 * - Supports nested menus (parent shows if at least one child is allowed)
 * - Uses hasPermission() helper for permission checks
 * - Route protection for sidebar links
 * - Production-ready with proper TypeScript types
 */
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  Button, 
  HStack, 
  Badge,
} from '@chakra-ui/react';
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
  FiCheckSquare,
  FiBriefcase,
  FiGrid,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { usePermissions } from '@/contexts/PermissionContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks';
import { useState, useMemo, useCallback, memo } from 'react';
import { CRM_RESOURCES } from '@/utils/permissions';
import type { ReactNode } from 'react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  icon: React.ComponentType;
  label: string;
  path: string;
  resource?: string;
  action?: string;
  children?: MenuItem[];
  alwaysShow?: boolean; // For dashboard, settings, etc.
}

/**
 * Check if a menu item should be shown based on permissions
 */
function shouldShowMenuItem(
  item: MenuItem,
  hasPermission: (resource: string, action?: string) => { hasPermission: boolean },
  isVendor: boolean,
  isOwner: boolean
): boolean {
  // Always show items marked as alwaysShow
  if (item.alwaysShow) {
    return true;
  }

  // Vendors and owners see everything
  if (isVendor || isOwner) {
    return true;
  }

  // If no resource specified, show it (for items like dashboard)
  if (!item.resource) {
    return true;
  }

  // Check permission
  const result = hasPermission(item.resource, item.action || 'read');
  return result.hasPermission;
}

/**
 * Check if a parent menu should be shown (if at least one child is allowed)
 */
function shouldShowParentMenu(
  item: MenuItem,
  hasPermission: (resource: string, action?: string) => { hasPermission: boolean },
  isVendor: boolean,
  isOwner: boolean
): boolean {
  // If no children, check the item itself
  if (!item.children || item.children.length === 0) {
    return shouldShowMenuItem(item, hasPermission, isVendor, isOwner);
  }

  // Check if at least one child is allowed
  return item.children.some(child => 
    shouldShowMenuItem(child, hasPermission, isVendor, isOwner)
  );
}

/**
 * Permission-Aware Sidebar Component
 */
const PermissionSidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { 
    hasPermission, 
    isVendor, 
    isLoading: permissionsLoading, 
    isEmployee,
    isOwner 
  } = usePermissions();
  const { logout } = useAuth();
  const { activeProfile } = useProfile();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

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

  // Define all menu items with their permissions
  const allMenuItems: MenuItem[] = useMemo(() => [
    {
      icon: FiHome,
      label: 'Dashboard',
      path: '/employee/dashboard',
      alwaysShow: true,
    },
    {
      icon: FiUserPlus,
      label: 'Leads',
      path: '/employee/leads',
      resource: CRM_RESOURCES.LEADS,
      action: 'read',
    },
    {
      icon: FiFileText,
      label: 'Deals',
      path: '/employee/deals',
      resource: CRM_RESOURCES.DEALS,
      action: 'read',
    },
    {
      icon: FiUsers,
      label: 'Contacts',
      path: '/employee/contacts',
      resource: CRM_RESOURCES.CONTACTS,
      action: 'read',
    },
    {
      icon: FiBriefcase,
      label: 'Companies',
      path: '/employee/companies',
      resource: CRM_RESOURCES.COMPANIES,
      action: 'read',
    },
    {
      icon: FiActivity,
      label: 'Activities',
      path: '/employee/activities',
      resource: CRM_RESOURCES.ACTIVITIES,
      action: 'read',
    },
    {
      icon: FiCheckSquare,
      label: 'Tasks',
      path: '/employee/tasks',
      resource: CRM_RESOURCES.TASKS,
      action: 'read',
    },
    {
      icon: FiFileText,
      label: 'Notes',
      path: '/employee/notes',
      resource: CRM_RESOURCES.NOTES,
      action: 'read',
    },
    {
      icon: FiGrid,
      label: 'Pipelines',
      path: '/employee/pipelines',
      resource: CRM_RESOURCES.PIPELINES,
      action: 'read',
      children: [
        {
          icon: FiGrid,
          label: 'All Pipelines',
          path: '/employee/pipelines',
          resource: CRM_RESOURCES.PIPELINES,
          action: 'read',
        },
        {
          icon: FiTrendingUp,
          label: 'Stages',
          path: '/employee/pipelines/stages',
          resource: CRM_RESOURCES.STAGES,
          action: 'read',
        },
      ],
    },
    {
      icon: FiSettings,
      label: 'Settings',
      path: '/employee/settings',
      alwaysShow: true,
    },
  ], []);

  // Filter menu items based on permissions
  const visibleMenuItems = useMemo(() => {
    if (permissionsLoading && isEmployee) {
      return []; // Don't show anything while loading
    }

    return allMenuItems
      .map(item => {
        // Check if parent should be shown
        if (!shouldShowParentMenu(item, hasPermission, isVendor, isOwner)) {
          return null;
        }

        // If item has children, filter them
        if (item.children && item.children.length > 0) {
          const visibleChildren = item.children.filter(child =>
            shouldShowMenuItem(child, hasPermission, isVendor, isOwner)
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
  }, [allMenuItems, hasPermission, isVendor, isOwner, permissionsLoading, isEmployee]);

  // Render a single menu item
  const renderMenuItem = useCallback((item: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus.has(item.path);
    const hasChildren = item.children && item.children.length > 0;

    // If item has children, render as expandable
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
              <Box as={isExpanded ? FiChevronDown : FiChevronRight} fontSize="sm" />
            </Flex>
          </Box>
          {isExpanded && (
            <VStack align="stretch" pl={8} gap={1} mt={1}>
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </VStack>
          )}
        </Box>
      );
    }

    // Regular menu item (no children)
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
            bg={isActive ? 'purple.50' : 'transparent'}
            color={isActive ? 'purple.600' : 'gray.700'}
            fontWeight={isActive ? 'semibold' : 'medium'}
            _hover={{
              bg: isActive ? 'purple.50' : 'gray.50',
              color: isActive ? 'purple.600' : 'gray.900',
            }}
            cursor="pointer"
            transition="all 0.2s"
            pl={level > 0 ? 8 : 4}
          >
            <Box as={item.icon} fontSize="lg" />
            <Text flex={1}>{item.label}</Text>
          </Flex>
        )}
      </NavLink>
    );
  }, [expandedMenus, toggleMenu, onClose]);

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
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  LeadGrid
                </Heading>
                <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                  CRM Platform
                </Text>
              </Box>
            </Flex>

            {/* Current Profile */}
            {activeProfile && (
              <Box
                p={3}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                    Active Profile
                  </Text>
                  <Badge 
                    colorPalette={
                      activeProfile.profile_type === 'vendor' ? 'purple' :
                      activeProfile.profile_type === 'employee' ? 'blue' : 'green'
                    } 
                    size="sm"
                  >
                    {activeProfile.profile_type_display}
                  </Badge>
                </HStack>
              </Box>
            )}
          </Box>

          {/* Navigation Menu */}
          <VStack align="stretch" flex={1} p={4} gap={1} overflowY="auto">
            {permissionsLoading && isEmployee ? (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">Loading permissions...</Text>
              </Box>
            ) : visibleMenuItems.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No menu items available based on your permissions.
                </Text>
              </Box>
            ) : (
              visibleMenuItems.map(item => renderMenuItem(item))
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
    </>
  );
};

export default memo(PermissionSidebar);


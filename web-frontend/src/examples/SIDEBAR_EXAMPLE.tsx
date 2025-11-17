/**
 * Sidebar RBAC Example
 * 
 * This file demonstrates how the permission-aware sidebar works
 * and how to use hasPermission() helper in your components.
 */

import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Button,
  Badge,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiSettings, 
  FiUserPlus,
  FiActivity,
  FiCheckSquare,
  FiFile,
  FiBuilding,
  FiLayers,
  FiTrendingUp,
} from 'react-icons/fi';
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';
import { useState, useMemo, useCallback } from 'react';

/**
 * Example: Simple Permission-Aware Menu
 * Shows how to build a menu that filters items based on permissions
 */
export const SimplePermissionMenu = () => {
  const { hasPermission, isLoading } = usePermissions();

  // Define menu items
  const menuItems = [
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
      icon: FiBuilding,
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
      icon: FiFile,
      label: 'Notes',
      path: '/employee/notes',
      resource: CRM_RESOURCES.NOTES,
      action: 'read',
    },
    {
      icon: FiSettings,
      label: 'Settings',
      path: '/employee/settings',
      alwaysShow: true,
    },
  ];

  // Filter menu items based on permissions
  const visibleItems = useMemo(() => {
    if (isLoading) {
      return [];
    }

    return menuItems.filter(item => {
      // Always show items marked as alwaysShow
      if (item.alwaysShow) {
        return true;
      }

      // Check permission
      if (item.resource) {
        const result = hasPermission(item.resource, item.action || 'read');
        return result.hasPermission;
      }

      return true;
    });
  }, [menuItems, hasPermission, isLoading]);

  return (
    <VStack align="stretch" gap={1}>
      {visibleItems.map((item) => (
        <NavLink key={item.path} to={item.path}>
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
              }}
            >
              <Box as={item.icon} fontSize="lg" />
              <Text flex={1}>{item.label}</Text>
            </Flex>
          )}
        </NavLink>
      ))}
    </VStack>
  );
};

/**
 * Example: Nested Menu with Permission Checks
 * Shows how to implement nested menus where parent shows if child is allowed
 */
export const NestedPermissionMenu = () => {
  const { hasPermission, isLoading } = usePermissions();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

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

  // Menu items with nested structure
  const menuItems = [
    {
      icon: FiHome,
      label: 'Dashboard',
      path: '/employee/dashboard',
      alwaysShow: true,
    },
    {
      icon: FiLayers,
      label: 'Pipelines',
      path: '/employee/pipelines',
      resource: CRM_RESOURCES.PIPELINES,
      action: 'read',
      children: [
        {
          icon: FiLayers,
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
  ];

  // Filter menu items - parent shows if at least one child is allowed
  const visibleItems = useMemo(() => {
    if (isLoading) {
      return [];
    }

    return menuItems
      .map(item => {
        // If no children, check the item itself
        if (!item.children || item.children.length === 0) {
          if (item.alwaysShow) return item;
          if (item.resource) {
            const result = hasPermission(item.resource, item.action || 'read');
            return result.hasPermission ? item : null;
          }
          return item;
        }

        // For items with children, filter children first
        const visibleChildren = item.children.filter(child => {
          if (child.resource) {
            const result = hasPermission(child.resource, child.action || 'read');
            return result.hasPermission;
          }
          return true;
        });

        // Only show parent if at least one child is visible
        if (visibleChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: visibleChildren,
        };
      })
      .filter((item): item is typeof menuItems[0] => item !== null);
  }, [menuItems, hasPermission, isLoading]);

  return (
    <VStack align="stretch" gap={1}>
      {visibleItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.has(item.path);

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
                _hover={{ bg: 'gray.50' }}
                onClick={() => toggleMenu(item.path)}
                textAlign="left"
              >
                <Flex align="center" gap={3}>
                  <Box as={item.icon} fontSize="lg" />
                  <Text flex={1}>{item.label}</Text>
                  <Box as={isExpanded ? FiChevronDown : FiChevronRight} fontSize="sm" />
                </Flex>
              </Box>
              {isExpanded && item.children && (
                <VStack align="stretch" pl={8} gap={1} mt={1}>
                  {item.children.map((child) => (
                    <NavLink key={child.path} to={child.path}>
                      {({ isActive }) => (
                        <Flex
                          align="center"
                          gap={3}
                          px={4}
                          py={3}
                          borderRadius="lg"
                          bg={isActive ? 'purple.50' : 'transparent'}
                          color={isActive ? 'purple.600' : 'gray.700'}
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

        return (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <Flex
                align="center"
                gap={3}
                px={4}
                py={3}
                borderRadius="lg"
                bg={isActive ? 'purple.50' : 'transparent'}
                color={isActive ? 'purple.600' : 'gray.700'}
              >
                <Box as={item.icon} fontSize="lg" />
                <Text flex={1}>{item.label}</Text>
              </Flex>
            )}
          </NavLink>
        );
      })}
    </VStack>
  );
};

/**
 * Example: Using hasPermission() in Component Actions
 */
export const PermissionAwareActions = () => {
  const { hasPermission } = usePermissions();

  const canCreateLead = hasPermission(CRM_RESOURCES.LEADS, 'create');
  const canUpdateLead = hasPermission(CRM_RESOURCES.LEADS, 'update');
  const canDeleteLead = hasPermission(CRM_RESOURCES.LEADS, 'delete');

  return (
    <HStack gap={2}>
      {canCreateLead.hasPermission && (
        <Button colorPalette="green" size="sm">
          Create Lead
        </Button>
      )}
      {canUpdateLead.hasPermission && (
        <Button colorPalette="blue" size="sm">
          Edit
        </Button>
      )}
      {canDeleteLead.hasPermission && (
        <Button colorPalette="red" size="sm">
          Delete
        </Button>
      )}
    </HStack>
  );
};

/**
 * Example: Permission Status Badge
 */
export const PermissionStatus = () => {
  const { hasPermission, permissions, isLoading } = usePermissions();

  if (isLoading) {
    return <Badge>Loading...</Badge>;
  }

  const leadPermissions = {
    read: hasPermission(CRM_RESOURCES.LEADS, 'read').hasPermission,
    create: hasPermission(CRM_RESOURCES.LEADS, 'create').hasPermission,
    update: hasPermission(CRM_RESOURCES.LEADS, 'update').hasPermission,
    delete: hasPermission(CRM_RESOURCES.LEADS, 'delete').hasPermission,
  };

  return (
    <VStack align="start" gap={2}>
      <Text fontWeight="bold">Lead Permissions:</Text>
      <HStack gap={2}>
        {leadPermissions.read && <Badge colorPalette="green">Read</Badge>}
        {leadPermissions.create && <Badge colorPalette="blue">Create</Badge>}
        {leadPermissions.update && <Badge colorPalette="orange">Update</Badge>}
        {leadPermissions.delete && <Badge colorPalette="red">Delete</Badge>}
      </HStack>
      <Text fontSize="sm" color="gray.600">
        Total permissions: {permissions.length}
      </Text>
    </VStack>
  );
};


/**
 * Permissions Tab - Shows all available permissions grouped by resource
 */
import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Accordion,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { StandardCard, Card } from '@/components/common';
import { toaster } from '../ui/toaster';
import { roleService, permissionService, type Permission } from '@/services';

interface GroupedPermissions {
  [resource: string]: Permission[];
}

// Helper function to get display name for resources
const getResourceDisplayName = (resource: string): string => {
  const displayNames: Record<string, string> = {
    'order': 'Sales/Order',
    'customer': 'Customers',
    'activity': 'Activities',
    'issue': 'Issues',
  };
  return displayNames[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
};

export const PermissionsTab = () => {
  const [permissions, setPermissions] = useState<GroupedPermissions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const data = await permissionService.getPermissionsByResource();
      
      // Filter to show only allowed permissions
      const filteredData: GroupedPermissions = {};
      
      // Allowed resources: customer, order (or deal), activity, issue
      // Also include plural forms for matching
      const allowedResources = ['customer', 'customers', 'order', 'orders', 'deal', 'deals', 'activity', 'activities', 'issue', 'issues'];
      
      // Filter to keep only standardized CRUD actions (read, create, update, delete)
      const standardActions = ['read', 'create', 'update', 'delete'];
      
      Object.entries(data).forEach(([resource, perms]) => {
        // Normalize resource name to lowercase for comparison
        const resourceLower = resource.toLowerCase().trim();
        
        // Convert plural to singular for matching (but keep original for display if needed)
        let singularResource = resourceLower;
        if (resourceLower.endsWith('ies')) {
          singularResource = resourceLower.slice(0, -3) + 'y'; // activities -> activity
        } else if (resourceLower.endsWith('es') && resourceLower !== 'issues' && resourceLower !== 'activities') {
          singularResource = resourceLower.slice(0, -2); // customers -> customer
        } else if (resourceLower.endsWith('s') && resourceLower !== 'analytics' && resourceLower !== 'settings' && resourceLower !== 'access') {
          singularResource = resourceLower.slice(0, -1); // orders -> order, deals -> deal
        }
        
        // Check if this resource is allowed (check both original and singular form)
        const isAllowed = allowedResources.includes(resourceLower) || allowedResources.includes(singularResource);
        
        if (!isAllowed) {
          return; // Skip this resource
        }
        
        // Filter to keep only standardized CRUD actions
        const standardPerms = perms.filter(p => {
          const actionLower = (p.action || '').toLowerCase().trim();
          return standardActions.includes(actionLower);
        });
        
        // Use normalized singular resource as key
        if (standardPerms.length > 0) {
          // Normalize 'deal' to 'order' for Sales/Order
          const normalizedResource = singularResource === 'deal' ? 'order' : singularResource;
          
          // If we already have this resource, merge and deduplicate by action
          if (filteredData[normalizedResource]) {
            const existingActions = new Set(filteredData[normalizedResource].map(p => p.action.toLowerCase()));
            standardPerms.forEach(p => {
              const actionLower = (p.action || '').toLowerCase();
              if (!existingActions.has(actionLower)) {
                filteredData[normalizedResource].push(p);
              }
            });
          } else {
            filteredData[normalizedResource] = standardPerms;
          }
        }
      });
      
      // Log filtered results for debugging
      console.log('Filtered permissions:', filteredData);
      console.log('Allowed resources:', Object.keys(filteredData));
      
      setPermissions(filteredData);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toaster.create({
        title: 'Error Loading Permissions',
        description: error.message || 'Failed to load permissions',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPermissions = Object.values(permissions).flat().length;
  const resources = Object.keys(permissions).length;

  if (isLoading) {
    return (
      <VStack gap={5} py={12}>
        <Spinner size="xl" color="purple.500" />
        <Text color="gray.600">Loading permissions...</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={5} align="stretch">
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Total Permissions
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.900">
              {totalPermissions}
            </Text>
          </VStack>
        </StandardCard>

        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Resources
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.600">
              {resources}
            </Text>
          </VStack>
        </StandardCard>
      </SimpleGrid>

      {/* Info Card */}
      <Card p={4} bg="blue.50" borderLeftWidth="4px" borderLeftColor="blue.500">
        <HStack gap={3}>
          <FiLock color="#3B82F6" size={20} />
          <VStack align="start" gap={0}>
            <Text fontSize="sm" fontWeight="semibold" color="blue.900">
              About Permissions
            </Text>
            <Text fontSize="sm" color="blue.700">
              Permissions are grouped by resource. Assign permissions to roles in the Roles tab.
            </Text>
          </VStack>
        </HStack>
      </Card>

      {/* Permissions by Resource */}
      {Object.keys(permissions).length === 0 ? (
        <Card p={8}>
          <VStack gap={3}>
            <FiLock size={48} color="#CBD5E0" />
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              No permissions found
            </Text>
            <Text color="gray.600" textAlign="center">
              Permissions will be automatically created for your organization
            </Text>
          </VStack>
        </Card>
      ) : (
        <Accordion.Root variant="enclosed" multiple defaultValue={[Object.keys(permissions)[0]]}>
          {Object.entries(permissions).map(([resource, perms]) => (
            <Accordion.Item key={resource} value={resource}>
              <Accordion.ItemTrigger>
                <HStack justify="space-between" flex={1}>
                  <HStack gap={3}>
                    <Box p={2} bg="purple.50" borderRadius="md">
                      <FiLock color="#805AD5" size={18} />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontWeight="semibold" fontSize="md">
                        {getResourceDisplayName(resource)}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {perms.length} permission{perms.length !== 1 ? 's' : ''}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorPalette="purple" size="sm">
                    {perms.length}
                  </Badge>
                </HStack>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3} p={4}>
                  {perms.map((permission) => (
                    <Card key={permission.id} p={4} bg="gray.50">
                      <HStack gap={3}>
                        <FiCheckCircle color="#10B981" size={16} />
                        <VStack align="start" gap={0} flex={1}>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.900" textTransform="capitalize">
                            {permission.action}
                          </Text>
                          {permission.description && (
                            <Text fontSize="xs" color="gray.600" noOfLines={2}>
                              {permission.description}
                            </Text>
                          )}
                          {permission.is_system_permission && (
                            <Badge colorPalette="blue" size="xs" mt={1}>
                              System
                            </Badge>
                          )}
                        </VStack>
                      </HStack>
                    </Card>
                  ))}
                </SimpleGrid>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </VStack>
  );
};


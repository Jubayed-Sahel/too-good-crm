/**
 * Manage Permissions Dialog - Assign/remove permissions for a role
 */
import { useState, useEffect } from 'react';
import {
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Spinner,
  Accordion,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toaster } from '@/components/ui/toaster';
import { FiCheckCircle, FiLock } from 'react-icons/fi';
import { roleService, permissionService, type Role, type Permission } from '@/services';

interface ManagePermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess?: () => void;
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

export const ManagePermissionsDialog = ({ 
  isOpen, 
  onClose, 
  role,
  onSuccess 
}: ManagePermissionsDialogProps) => {
  const [allPermissions, setAllPermissions] = useState<GroupedPermissions>({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      fetchData();
    }
  }, [isOpen, role]);

  const fetchData = async () => {
    if (!role) return;

    setIsLoading(true);
    try {
      const [groupedPerms, rolePerms] = await Promise.all([
        permissionService.getPermissionsByResource(),
        roleService.getRolePermissions(role.id),
      ]);
      
      setAllPermissions(groupedPerms);
      setSelectedPermissionIds(rolePerms.map(p => p.id));
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

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleResource = (permissions: Permission[]) => {
    const permissionIds = permissions.map(p => p.id);
    const allSelected = permissionIds.every(id => selectedPermissionIds.includes(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedPermissionIds(prev => prev.filter(id => !permissionIds.includes(id)));
    } else {
      // Select all
      setSelectedPermissionIds(prev => {
        const newIds = permissionIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const handleSave = async () => {
    if (!role) return;

    setIsSaving(true);
    try {
      await roleService.updateRolePermissions(role.id, selectedPermissionIds);

      toaster.create({
        title: 'Permissions Updated',
        description: `Permissions for ${role.name} have been updated successfully.`,
        type: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toaster.create({
        title: 'Failed to Update Permissions',
        description: error.message || 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!role) return null;

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(e) => !e.open && onClose()}
      size="xl"
    >
      <DialogContent maxH="80vh" overflowY="auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {role.name}</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <VStack gap={4} py={8}>
              <Spinner size="lg" color="purple.500" />
              <Text color="gray.600">Loading permissions...</Text>
            </VStack>
          ) : (
            <VStack gap={4} align="stretch">
              {/* Info Box */}
              <Box
                p={3}
                bg="purple.50"
                borderRadius="lg"
                borderLeftWidth="4px"
                borderLeftColor="purple.500"
              >
                <HStack gap={2}>
                  <FiLock color="#805AD5" size={18} />
                  <Text fontSize="sm" color="purple.900">
                    Select permissions to assign to this role. Users with this role will have access to these actions.
                  </Text>
                </HStack>
              </Box>

              {/* Selected Count */}
              <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Selected Permissions
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="purple.600">
                  {selectedPermissionIds.length} / {Object.values(allPermissions).flat().length}
                </Text>
              </HStack>

              {/* Permissions by Resource */}
              {Object.keys(allPermissions).length === 0 ? (
                <Box p={8} textAlign="center">
                  <FiLock size={48} color="#CBD5E0" style={{ margin: '0 auto 8px' }} />
                  <Text color="gray.500">
                    No permissions available
                  </Text>
                </Box>
              ) : (
                <Accordion.Root variant="enclosed" multiple defaultValue={[Object.keys(allPermissions)[0]]}>
                  {Object.entries(allPermissions).map(([resource, permissions]) => {
                    const permissionIds = permissions.map(p => p.id);
                    const selectedCount = permissionIds.filter(id => selectedPermissionIds.includes(id)).length;
                    const allSelected = selectedCount === permissions.length;
                    const someSelected = selectedCount > 0 && selectedCount < permissions.length;

                    return (
                      <Accordion.Item key={resource} value={resource}>
                        <Accordion.ItemTrigger>
                          <HStack justify="space-between" flex={1}>
                            <HStack gap={3}>
                              <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onCheckedChange={() => handleToggleResource(permissions)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Box p={2} bg="purple.50" borderRadius="md">
                                <FiLock color="#805AD5" size={16} />
                              </Box>
                              <VStack align="start" gap={0}>
                                <Text fontWeight="semibold" fontSize="md" textTransform="capitalize">
                                  {resource}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {selectedCount} of {permissions.length} selected
                                </Text>
                              </VStack>
                            </HStack>
                          </HStack>
                        </Accordion.ItemTrigger>
                        <Accordion.ItemContent>
                          <VStack align="stretch" gap={2} p={4}>
                            {permissions.map((permission) => (
                              <HStack
                                key={permission.id}
                                p={3}
                                bg={selectedPermissionIds.includes(permission.id) ? 'purple.50' : 'gray.50'}
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor={selectedPermissionIds.includes(permission.id) ? 'purple.200' : 'gray.200'}
                                cursor="pointer"
                                _hover={{ bg: selectedPermissionIds.includes(permission.id) ? 'purple.100' : 'gray.100' }}
                                onClick={() => handleTogglePermission(permission.id)}
                              >
                                <Checkbox
                                  checked={selectedPermissionIds.includes(permission.id)}
                                  onCheckedChange={() => handleTogglePermission(permission.id)}
                                />
                                <VStack align="start" gap={0} flex={1}>
                                  <Text fontSize="sm" fontWeight="medium" color="gray.900" textTransform="capitalize">
                                    {permission.action}
                                  </Text>
                                  {permission.description && (
                                    <Text fontSize="xs" color="gray.600">
                                      {permission.description}
                                    </Text>
                                  )}
                                </VStack>
                                {selectedPermissionIds.includes(permission.id) && (
                                  <FiCheckCircle color="#10B981" size={16} />
                                )}
                              </HStack>
                            ))}
                          </VStack>
                        </Accordion.ItemContent>
                      </Accordion.Item>
                    );
                  })}
                </Accordion.Root>
              )}
            </VStack>
          )}
        </DialogBody>

        <DialogFooter>
          <HStack gap={2}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleSave}
              loading={isSaving}
              disabled={isLoading}
            >
              Save Permissions
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};


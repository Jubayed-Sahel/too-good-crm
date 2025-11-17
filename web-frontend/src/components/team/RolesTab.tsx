/**
 * Roles Tab - Manages roles and their permissions
 */
import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  SimpleGrid,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiShield, FiSearch, FiUsers } from 'react-icons/fi';
import { StandardButton, StandardCard, Card, ConfirmDialog } from '@/components/common';
import { toaster } from '../ui/toaster';
import { roleService, type Role } from '@/services';
import { CreateRoleDialog } from './CreateRoleDialog';
import { ViewRoleDetailsDialog } from './ViewRoleDetailsDialog';
import { ManagePermissionsDialog } from './ManagePermissionsDialog';

export const RolesTab = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await roleService.getRoles({ is_active: true });
      setRoles(data);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toaster.create({
        title: 'Error Loading Roles',
        description: error.message || 'Failed to load roles',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await roleService.deleteRole(roleToDelete.id);
      toaster.create({
        title: 'Role Deleted',
        description: `${roleToDelete.name} has been deleted successfully.`,
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error: any) {
      toaster.create({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete role',
        type: 'error',
      });
    }
  };

  const handleEnsureAllRolesHavePermissions = async () => {
    try {
      setIsLoading(true);
      const result = await roleService.ensureAllRolesHavePermissions();
      
      toaster.create({
        title: 'Permissions Assigned',
        description: `Assigned permissions to ${result.roles_updated} role(s). ${result.total_permissions_assigned} permissions were assigned.`,
        type: 'success',
        duration: 5000,
      });
      
      fetchRoles();
    } catch (error: any) {
      console.error('Error ensuring role permissions:', error);
      toaster.create({
        title: 'Failed to Assign Permissions',
        description: error.message || 'An error occurred while assigning permissions',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoles = roles.filter((role) =>
    !searchQuery ||
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: roles.length,
    systemRoles: roles.filter(r => r.is_system_role).length,
    customRoles: roles.filter(r => !r.is_system_role).length,
  };

  if (isLoading) {
    return (
      <VStack gap={5} py={12}>
        <Spinner size="xl" color="purple.500" />
        <Text color="gray.600">Loading roles...</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={5} align="stretch">
      {/* Action Buttons */}
      <HStack justify="space-between">
        <Box position="relative" flex="1" maxW="400px">
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
            color="gray.400"
          >
            <FiSearch size={20} />
          </Box>
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            pl="40px"
            h="40px"
            borderRadius="lg"
          />
        </Box>
        <HStack gap={2}>
          {roles.some(role => (role.permission_count || 0) === 0) && (
            <StandardButton
              variant="outline"
              colorPalette="orange"
              onClick={handleEnsureAllRolesHavePermissions}
              disabled={isLoading}
            >
              Assign Permissions to All Roles
            </StandardButton>
          )}
          <StandardButton
            variant="primary"
            leftIcon={<FiPlus />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Role
          </StandardButton>
        </HStack>
      </HStack>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Total Roles
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.900">
              {stats.total}
            </Text>
          </VStack>
        </StandardCard>

        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              System Roles
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="blue.600">
              {stats.systemRoles}
            </Text>
          </VStack>
        </StandardCard>

        <StandardCard>
          <VStack align="start" gap={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              Custom Roles
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.600">
              {stats.customRoles}
            </Text>
          </VStack>
        </StandardCard>
      </SimpleGrid>

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <Card p={8}>
          <VStack gap={3}>
            <FiShield size={48} color="#CBD5E0" />
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              {searchQuery ? 'No roles found' : 'No roles created yet'}
            </Text>
            <Text color="gray.600" textAlign="center">
              {searchQuery ? 'Try adjusting your search' : 'Create your first role to get started'}
            </Text>
            {!searchQuery && (
              <StandardButton
                variant="primary"
                leftIcon={<FiPlus />}
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
              >
                Create Role
              </StandardButton>
            )}
          </VStack>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {filteredRoles.map((role) => (
            <Card key={role.id} p={5} position="relative">
              <VStack align="stretch" gap={3}>
                {/* Header */}
                <HStack justify="space-between" align="start">
                  <HStack gap={2}>
                    <Box p={2} bg="purple.50" borderRadius="md">
                      <FiShield size={20} color="#805AD5" />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontWeight="bold" fontSize="md" color="gray.900">
                        {role.name}
                      </Text>
                      {role.is_system_role && (
                        <Badge colorPalette="blue" size="xs">
                          System Role
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                  
                  <HStack gap={1}>
                    <IconButton
                      aria-label="View details"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewRole(role)}
                    >
                      <FiEye />
                    </IconButton>
                    <IconButton
                      aria-label="Manage permissions"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleManagePermissions(role)}
                    >
                      <FiEdit />
                    </IconButton>
                    {!role.is_system_role && (
                      <IconButton
                        aria-label="Delete role"
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    )}
                  </HStack>
                </HStack>

                {/* Description */}
                {role.description && (
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {role.description}
                  </Text>
                )}

                {/* Footer */}
                <HStack justify="space-between" pt={2} borderTopWidth="1px" borderTopColor="gray.200">
                  <HStack gap={1}>
                    <FiUsers size={14} color="#718096" />
                    <Text fontSize="xs" color="gray.600">
                      {role.user_count || 0} {role.user_count === 1 ? 'member' : 'members'}
                    </Text>
                    {role.permission_count !== undefined && (
                      <>
                        <Text fontSize="xs" color="gray.400">•</Text>
                        <Text fontSize="xs" color={role.permission_count === 0 ? 'orange.600' : 'gray.600'}>
                          {role.permission_count || 0} {role.permission_count === 1 ? 'permission' : 'permissions'}
                        </Text>
                      </>
                    )}
                  </HStack>
                  <StandardButton
                    variant="outline"
                    size="xs"
                    onClick={() => handleManagePermissions(role)}
                    colorPalette={role.permission_count === 0 ? 'orange' : 'purple'}
                  >
                    {role.permission_count === 0 ? 'Assign Permissions' : 'Manage Permissions'}
                  </StandardButton>
                </HStack>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Dialogs */}
      <CreateRoleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchRoles();
        }}
      />

      <ViewRoleDetailsDialog
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />

      <ManagePermissionsDialog
        isOpen={isPermissionsDialogOpen}
        onClose={() => {
          setIsPermissionsDialogOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onSuccess={() => {
          toaster.create({
            title: 'Permissions Updated',
            description: 'Role permissions have been updated successfully.',
            type: 'success',
          });
          fetchRoles();
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Role"
        message={
          roleToDelete
            ? `Are you sure you want to delete "${roleToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this role?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        colorScheme="red"
      />
    </VStack>
  );
};


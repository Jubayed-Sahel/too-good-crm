/**
 * Roles & Permissions Settings
 * Manage organizational roles and their permissions
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiShield } from 'react-icons/fi';
import { Card } from '../common';
import { Checkbox } from '../ui/checkbox';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Toaster, toaster } from '@/components/ui/toaster';
import { roleService, type Role, type Permission } from '@/services';

const RolesSettings = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissionCounts, setRolePermissionCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response: any = await roleService.getRoles();
      console.log('Raw roles response:', response);
      
      // Handle paginated response or direct array
      const fetchedRoles: Role[] = Array.isArray(response) ? response : (response.results || response.data || []);
      console.log('Parsed roles:', fetchedRoles);
      
      setRoles(fetchedRoles);
      
      // Fetch permission counts for each role
      const counts: Record<number, number> = {};
      await Promise.all(
        fetchedRoles.map(async (role: Role) => {
          try {
            const rolePerms = await roleService.getRolePermissions(role.id);
            counts[role.id] = rolePerms.length;
          } catch (error) {
            counts[role.id] = 0;
          }
        })
      );
      setRolePermissionCounts(counts);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load roles',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response: any = await roleService.getPermissions();
      console.log('Raw permissions response:', response);
      
      // Handle paginated response or direct array
      const fetchedPermissions: Permission[] = Array.isArray(response) ? response : (response.results || response.data || []);
      console.log('Parsed permissions:', fetchedPermissions);
      
      setPermissions(fetchedPermissions);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load permissions',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleOpenDialog = async (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
      });
      // Fetch permissions for this role
      try {
        const rolePermissions = await roleService.getRolePermissions(role.id);
        setSelectedPermissions(rolePermissions.map(p => p.id));
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        setSelectedPermissions([]);
      }
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      setSelectedPermissions([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setSelectedPermissions([]);
  };

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Role name is required',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      let roleId: number;
      
      if (editingRole) {
        // Update existing role
        await roleService.updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
        });
        roleId = editingRole.id;
        toaster.create({
          title: 'Role Updated',
          description: `"${formData.name}" has been updated successfully`,
          type: 'success',
          duration: 3000,
        });
      } else {
        // Create new role
        const newRole = await roleService.createRole({
          name: formData.name,
          description: formData.description,
        });
        roleId = newRole.id;
        toaster.create({
          title: 'Role Created',
          description: `"${formData.name}" has been created successfully`,
          type: 'success',
          duration: 3000,
        });
      }
      
      // Update permissions for the role
      if (selectedPermissions.length > 0) {
        await roleService.updateRolePermissions(roleId, selectedPermissions);
      }
      
      handleCloseDialog();
      fetchRoles();
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to save role',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.is_system_role) {
      toaster.create({
        title: 'Cannot Delete',
        description: 'System roles cannot be deleted',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${role.name}"?`)) {
      return;
    }

    try {
      await roleService.deleteRole(role.id);
      toaster.create({
        title: 'Role Deleted',
        description: `"${role.name}" has been deleted`,
        type: 'success',
        duration: 3000,
      });
      fetchRoles();
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to delete role',
        type: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Toaster />
      <VStack gap={5} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Roles & Permissions
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Manage organizational roles and access control
            </Text>
          </Box>
          <Button
            colorPalette="purple"
            onClick={() => handleOpenDialog()}
          >
            <FiPlus />
            Create Role
          </Button>
        </HStack>

        {/* Roles List */}
        {isLoading ? (
          <Card p={8}>
            <Text textAlign="center" color="gray.500">Loading roles...</Text>
          </Card>
        ) : roles.length === 0 ? (
          <Card p={8}>
            <VStack gap={3}>
              <Box as={FiShield} fontSize="3xl" color="gray.400" />
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                No Roles Yet
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Create your first role to start managing team permissions
              </Text>
              <Button
                colorPalette="purple"
                size="sm"
                onClick={() => handleOpenDialog()}
                mt={2}
              >
                <FiPlus />
                Create Role
              </Button>
            </VStack>
          </Card>
        ) : (
          <VStack gap={3} align="stretch">
            {roles.map((role) => (
              <Card key={role.id} p={4}>
                <HStack justify="space-between">
                  <HStack gap={3} flex={1}>
                    <Box
                      p={2}
                      bg="purple.50"
                      borderRadius="md"
                      color="purple.600"
                    >
                      <FiShield size={20} />
                    </Box>
                    <Box flex={1}>
                      <HStack gap={2} mb={1}>
                        <Text fontWeight="semibold" fontSize="md" color="gray.800">
                          {role.name}
                        </Text>
                        {role.is_system_role && (
                          <Badge colorPalette="blue" variant="subtle" fontSize="xs">
                            System Role
                          </Badge>
                        )}
                        {!role.is_active && (
                          <Badge colorPalette="gray" variant="subtle" fontSize="xs">
                            Inactive
                          </Badge>
                        )}
                        <Badge colorPalette="purple" variant="outline" fontSize="xs">
                          {rolePermissionCounts[role.id] || 0} {rolePermissionCounts[role.id] === 1 ? 'Permission' : 'Permissions'}
                        </Badge>
                      </HStack>
                      {role.description && (
                        <Text fontSize="sm" color="gray.600">
                          {role.description}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Created {new Date(role.created_at).toLocaleDateString()}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack gap={1}>
                    <IconButton
                      aria-label="Edit role"
                      size="sm"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => handleOpenDialog(role)}
                      disabled={role.is_system_role}
                    >
                      <FiEdit size={16} />
                    </IconButton>
                    <IconButton
                      aria-label="Delete role"
                      size="sm"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => handleDelete(role)}
                      disabled={role.is_system_role}
                    >
                      <FiTrash2 size={16} />
                    </IconButton>
                  </HStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}

        {/* Info Box */}
        <Card p={4} bg="blue.50" borderColor="blue.200">
          <HStack gap={2}>
            <Box as={FiShield} color="blue.600" />
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="blue.800">
                About Roles
              </Text>
              <Text fontSize="xs" color="blue.700" mt={1}>
                Roles define access levels and permissions for team members. 
                Assign roles to employees to control what they can see and do in the system.
              </Text>
            </Box>
          </HStack>
        </Card>
      </VStack>

      {/* Create/Edit Role Dialog */}
      <DialogRoot 
        open={isDialogOpen} 
        onOpenChange={(e) => !e.open && handleCloseDialog()}
        size="lg"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody>
            <VStack gap={4} align="stretch">
              <Field label="Role Name" required>
                <Input
                  placeholder="e.g., Sales Manager, Support Agent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>

              <Field label="Description">
                <Textarea
                  placeholder="Describe what this role can do..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </Field>

              {/* Permissions Section */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Permissions
                </Text>
                <Box
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={4}
                  maxH="300px"
                  overflowY="auto"
                >
                  {permissions.length === 0 ? (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                      No permissions available
                    </Text>
                  ) : (
                    <VStack gap={3} align="stretch">
                      {/* Group permissions by resource */}
                      {Object.entries(
                        permissions.reduce((acc, permission) => {
                          if (!acc[permission.resource]) {
                            acc[permission.resource] = [];
                          }
                          acc[permission.resource].push(permission);
                          return acc;
                        }, {} as Record<string, Permission[]>)
                      ).map(([resource, perms]) => (
                        <Box key={resource}>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.700"
                            mb={2}
                            textTransform="capitalize"
                          >
                            {resource}
                          </Text>
                          <VStack gap={2} align="stretch" pl={2}>
                            {perms.map((permission) => (
                              <Checkbox
                                key={permission.id}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={(e) => 
                                  handlePermissionToggle(permission.id, e.checked as boolean)
                                }
                              >
                                <HStack gap={2}>
                                  <Text fontSize="sm" textTransform="capitalize">
                                    {permission.action}
                                  </Text>
                                  {permission.description && (
                                    <Text fontSize="xs" color="gray.500">
                                      - {permission.description}
                                    </Text>
                                  )}
                                </HStack>
                              </Checkbox>
                            ))}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
                <Text fontSize="xs" color="gray.600" mt={2}>
                  Select the permissions this role should have
                </Text>
              </Box>

              <Box
                p={3}
                bg="purple.50"
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor="purple.400"
              >
                <Text fontSize="xs" color="purple.800">
                  💡 <strong>Tip:</strong> After creating a role, you can assign it to team members 
                  from the Team page by clicking the "Role" button next to each employee.
                </Text>
              </Box>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <HStack gap={2}>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                colorPalette="purple"
                onClick={handleSubmit}
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default RolesSettings;

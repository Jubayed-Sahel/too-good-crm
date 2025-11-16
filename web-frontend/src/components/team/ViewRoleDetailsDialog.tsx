/**
 * View Role Details Dialog - Shows role information, permissions, and assigned users
 */
import { useState, useEffect } from 'react';
import {
  Button,
  VStack,
  HStack,
  Text,
  Badge,
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
import { FiCheckCircle, FiUser } from 'react-icons/fi';
import { roleService, type Role, type Permission } from '@/services';

interface ViewRoleDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

interface RoleUser {
  id: number;
  email: string;
  full_name: string;
  source: 'user_role' | 'employee_role';
}

export const ViewRoleDetailsDialog = ({ 
  isOpen, 
  onClose, 
  role 
}: ViewRoleDetailsDialogProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<RoleUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      fetchRoleDetails();
    }
  }, [isOpen, role]);

  const fetchRoleDetails = async () => {
    if (!role) return;

    setIsLoading(true);
    try {
      const [perms, usersData] = await Promise.all([
        roleService.getRolePermissions(role.id),
        roleService.getRoleUsers(role.id),
      ]);
      
      setPermissions(perms);
      setUsers(usersData.users || []);
    } catch (error: any) {
      console.error('Error fetching role details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) return null;

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(e) => !e.open && onClose()}
      size="lg"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <VStack gap={4} py={8}>
              <Spinner size="lg" color="purple.500" />
              <Text color="gray.600">Loading role details...</Text>
            </VStack>
          ) : (
            <VStack gap={5} align="stretch">
              {/* Role Info */}
              <Box
                p={4}
                bg="purple.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="purple.200"
              >
                <VStack align="start" gap={2}>
                  <HStack gap={2}>
                    <Text fontWeight="bold" fontSize="lg" color="purple.900">
                      {role.name}
                    </Text>
                    {role.is_system_role && (
                      <Badge colorPalette="blue" size="sm">
                        System Role
                      </Badge>
                    )}
                  </HStack>
                  {role.description && (
                    <Text fontSize="sm" color="purple.700">
                      {role.description}
                    </Text>
                  )}
                  <HStack gap={4}>
                    <HStack gap={1}>
                      <FiCheckCircle size={14} color="#10B981" />
                      <Text fontSize="xs" color="gray.600">
                        {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                    <HStack gap={1}>
                      <FiUser size={14} color="#805AD5" />
                      <Text fontSize="xs" color="gray.600">
                        {users.length} user{users.length !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Permissions and Users Accordion */}
              <Accordion.Root variant="enclosed" multiple defaultValue={['permissions']}>
                {/* Permissions */}
                <Accordion.Item value="permissions">
                  <Accordion.ItemTrigger>
                    <HStack justify="space-between" flex={1}>
                      <Text fontWeight="semibold">Permissions</Text>
                      <Badge colorPalette="purple" size="sm">
                        {permissions.length}
                      </Badge>
                    </HStack>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    {permissions.length === 0 ? (
                      <Box p={4} textAlign="center">
                        <Text color="gray.500" fontSize="sm">
                          No permissions assigned to this role
                        </Text>
                      </Box>
                    ) : (
                      <VStack align="stretch" gap={2} p={4}>
                        {permissions.map((permission) => (
                          <HStack
                            key={permission.id}
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                            justify="space-between"
                          >
                            <HStack gap={2}>
                              <FiCheckCircle size={14} color="#10B981" />
                              <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                {permission.resource} - {permission.action}
                              </Text>
                            </HStack>
                            {permission.is_system_permission && (
                              <Badge colorPalette="blue" size="xs">
                                System
                              </Badge>
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Accordion.ItemContent>
                </Accordion.Item>

                {/* Users */}
                <Accordion.Item value="users">
                  <Accordion.ItemTrigger>
                    <HStack justify="space-between" flex={1}>
                      <Text fontWeight="semibold">Assigned Users</Text>
                      <Badge colorPalette="purple" size="sm">
                        {users.length}
                      </Badge>
                    </HStack>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    {users.length === 0 ? (
                      <Box p={4} textAlign="center">
                        <Text color="gray.500" fontSize="sm">
                          No users assigned to this role
                        </Text>
                      </Box>
                    ) : (
                      <VStack align="stretch" gap={2} p={4}>
                        {users.map((user) => (
                          <HStack
                            key={`${user.source}-${user.id}`}
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                            justify="space-between"
                          >
                            <HStack gap={2}>
                              <FiUser size={14} color="#805AD5" />
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                  {user.full_name}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {user.email}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge colorPalette="gray" size="xs">
                              {user.source === 'employee_role' ? 'Employee' : 'Additional'}
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Accordion.ItemContent>
                </Accordion.Item>
              </Accordion.Root>
            </VStack>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};


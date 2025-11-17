/**
 * Manage Employee Role Dialog
 * Modal for assigning/changing employee roles
 */
import { useState, useEffect } from 'react';
import {
  Button,
  VStack,
  Text,
  Box,
  HStack,
  Badge,
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
import { Field } from '@/components/ui/field';
import CustomSelect from '@/components/ui/CustomSelect';
import { Toaster, toaster } from '@/components/ui/toaster';
import { roleService, employeeService, type Employee, type Role } from '@/services';
import { useProfile } from '@/contexts/ProfileContext';

interface ManageRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess?: () => void;
}

export const ManageRoleDialog = ({ 
  isOpen, 
  onClose, 
  employee,
  onSuccess 
}: ManageRoleDialogProps) => {
  const { activeOrganizationId } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Fetch roles and initialize selectedRoleId when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      // Initialize selectedRoleId with employee's current role when dialog opens
      if (employee?.role) {
        setSelectedRoleId(employee.role.toString());
      } else {
        setSelectedRoleId('');
      }
    } else {
      // Reset when dialog closes
      setSelectedRoleId('');
    }
    // Only depend on isOpen - initialize once when dialog opens
    // Don't depend on employee to avoid resetting user's selection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchRoles = async () => {
    setIsFetchingRoles(true);
    try {
      const organizationId = activeOrganizationId;
      
      // Fetch all active roles for the organization
      // Don't filter by is_active here - let backend handle it
      // This ensures we get all roles that the user can assign
      const filters: any = {};
      if (organizationId) {
        filters.organization = organizationId;
      }
      // Only filter by is_active if we want to exclude inactive roles
      // For role assignment, we typically want all active roles
      filters.is_active = true;
      
      console.log('🔍 Fetching roles with filters:', filters);
      const fetchedRoles = await roleService.getRoles(filters);
      console.log('✅ Fetched roles:', fetchedRoles);
      console.log('📊 Total roles fetched:', fetchedRoles?.length || 0);
      
      setRoles(fetchedRoles || []);
    } catch (error: any) {
      console.error('❌ Error fetching roles:', error);
      toaster.create({
        title: 'Error Loading Roles',
        description: error.message || 'Failed to load roles. Please try again.',
        type: 'error',
        duration: 3000,
      });
      setRoles([]); // Set empty array on error
    } finally {
      setIsFetchingRoles(false);
    }
  };

  const handleClose = () => {
    setSelectedRoleId('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!employee || !selectedRoleId) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please select a role',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const roleId = parseInt(selectedRoleId);
      console.log('🔄 Updating employee role:', {
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        roleId: roleId,
        roleName: roles.find(r => r.id === roleId)?.name,
        organizationId: activeOrganizationId
      });
      
      const updateData = {
        role: roleId,
      };
      
      console.log('📤 Sending update request:', updateData);
      
      const updatedEmployee = await employeeService.updateEmployee(employee.id, updateData);
      
      console.log('✅ Employee updated:', updatedEmployee);
      console.log('✅ Updated role:', updatedEmployee.role, updatedEmployee.role_name);

      toaster.create({
        title: 'Role Updated',
        description: `Role has been updated for ${employee.first_name} ${employee.last_name}`,
        type: 'success',
        duration: 3000,
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('❌ Error updating role:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to update employee role';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.role) {
          errorMessage = Array.isArray(errorData.role) ? errorData.role[0] : errorData.role;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toaster.create({
        title: 'Update Failed',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = roles.map(role => ({
    value: role.id.toString(),
    label: role.name,
  }));
  
  console.log('Current roles state:', roles);
  console.log('Generated roleOptions:', roleOptions);
  console.log('Selected role ID:', selectedRoleId);

  if (!employee) return null;

  return (
    <>
      <Toaster />
      <DialogRoot 
        open={isOpen} 
        onOpenChange={(e) => !e.open && handleClose()}
        size="md"
        closeOnInteractOutside={false}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Employee Role</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody>
            <VStack gap={4} align="stretch">
              {/* Employee Info */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <VStack align="start" gap={2}>
                  <Text fontWeight="bold" fontSize="md">
                    {employee.first_name} {employee.last_name}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.600">
                      {employee.job_title || 'No Job Title'}
                    </Text>
                    {employee.department && (
                      <>
                        <Text color="gray.400">•</Text>
                        <Text fontSize="sm" color="gray.600">
                          {employee.department}
                        </Text>
                      </>
                    )}
                  </HStack>
                  {employee.role_name && (
                    <HStack>
                      <Text fontSize="xs" color="gray.500">Current Role:</Text>
                      <Badge colorPalette="purple" variant="subtle" fontSize="xs">
                        {employee.role_name}
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* Role Selection */}
              <Field label="Select Role" required>
                <Box>
                  {roleOptions.length > 0 && (
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {roleOptions.length} role(s) available
                    </Text>
                  )}
                  <CustomSelect
                    value={selectedRoleId}
                    onChange={(val) => {
                      console.log('[ManageRoleDialog] Role selected:', val);
                      console.log('[ManageRoleDialog] Current selectedRoleId:', selectedRoleId);
                      console.log('[ManageRoleDialog] Setting selectedRoleId to:', val);
                      setSelectedRoleId(val);
                      console.log('[ManageRoleDialog] selectedRoleId after setState (will update on next render):', val);
                    }}
                    options={roleOptions}
                    placeholder={isFetchingRoles ? "Loading roles..." : "Select a role"}
                    accentColor="purple"
                  />
                </Box>
              </Field>

              {isFetchingRoles && (
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor="blue.400"
                >
                  <Text fontSize="sm" color="blue.800">
                    Loading available roles...
                  </Text>
                </Box>
              )}

              {!isFetchingRoles && roles.length === 0 && (
                <Box
                  p={3}
                  bg="orange.50"
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor="orange.400"
                >
                  <Text fontSize="sm" color="orange.800">
                    No roles available. Please create roles in Settings first.
                  </Text>
                </Box>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter>
            <HStack gap={2}>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorPalette="purple"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!selectedRoleId || roles.length === 0}
              >
                Update Role
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

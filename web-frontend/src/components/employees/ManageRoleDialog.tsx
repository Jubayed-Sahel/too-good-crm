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
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Fetch roles when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (employee?.role) {
        setSelectedRoleId(employee.role.toString());
      } else {
        setSelectedRoleId('');
      }
    }
  }, [isOpen, employee]);

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await roleService.getRoles({ is_active: true });
      setRoles(fetchedRoles);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load roles',
        type: 'error',
        duration: 3000,
      });
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
      await employeeService.updateEmployee(employee.id, {
        role: parseInt(selectedRoleId),
      });

      toaster.create({
        title: 'Role Updated',
        description: `Role has been updated for ${employee.first_name} ${employee.last_name}`,
        type: 'success',
        duration: 3000,
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toaster.create({
        title: 'Update Failed',
        description: error.message || 'Failed to update employee role',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = roles.map(role => ({
    value: role.id.toString(),
    label: role.name,
  }));

  if (!employee) return null;

  return (
    <>
      <Toaster />
      <DialogRoot 
        open={isOpen} 
        onOpenChange={(e) => !e.open && handleClose()}
        size="md"
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
                <CustomSelect
                  value={selectedRoleId}
                  onChange={setSelectedRoleId}
                  options={roleOptions}
                  placeholder="Select a role"
                  accentColor="purple"
                />
              </Field>

              {roles.length === 0 && (
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

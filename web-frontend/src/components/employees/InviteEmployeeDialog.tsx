/**
 * Invite Employee Dialog
 * Modal for inviting new employees to the organization
 */
import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  VStack,
  Text,
  Box,
  Code,
  HStack,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogActionTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Toaster, toaster } from '@/components/ui/toaster';
import { employeeService, type InviteEmployeeRequest } from '@/services';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface InviteEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteEmployeeDialog = ({ isOpen, onClose, onSuccess }: InviteEmployeeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<InviteEmployeeRequest>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    job_title: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        department: '',
        job_title: '',
      });
      setErrors({});
      setTempPassword(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleCopyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toaster.create({
        title: 'Password Copied',
        description: 'Temporary password copied to clipboard',
        type: 'success',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await employeeService.inviteEmployee(formData);
      
      // Show temporary password (only for new users)
      if (response.temporary_password) {
        setTempPassword(response.temporary_password);
      }

      toaster.create({
        title: 'Employee Invited',
        description: response.message || `${formData.first_name} ${formData.last_name} has been invited successfully`,
        type: 'success',
        duration: 3000,
      });

      onSuccess?.();
    } catch (error: any) {
      toaster.create({
        title: 'Invitation Failed',
        description: error.message || 'Failed to invite employee',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <DialogRoot 
        open={isOpen} 
        onOpenChange={(e) => !e.open && handleClose()}
        size="lg"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Employee</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody>
            {!tempPassword ? (
              <VStack gap={4} align="stretch">
                <Field
                  label="Email"
                  required
                  invalid={!!errors.email}
                  errorText={errors.email}
                >
                  <Input
                    type="email"
                    placeholder="employee@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </Field>

                <HStack gap={3}>
                  <Field
                    label="First Name"
                    required
                    invalid={!!errors.first_name}
                    errorText={errors.first_name}
                    flex={1}
                  >
                    <Input
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                    />
                  </Field>

                  <Field
                    label="Last Name"
                    required
                    invalid={!!errors.last_name}
                    errorText={errors.last_name}
                    flex={1}
                  >
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                  </Field>
                </HStack>

                <Field label="Phone">
                  <Input
                    type="tel"
                    placeholder="+1-555-0123"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Field>

                <HStack gap={3}>
                  <Field label="Department" flex={1}>
                    <Input
                      type="text"
                      placeholder="Sales"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Job Title" flex={1}>
                    <Input
                      type="text"
                      placeholder="Sales Representative"
                      value={formData.job_title}
                      onChange={(e) =>
                        setFormData({ ...formData, job_title: e.target.value })
                      }
                    />
                  </Field>
                </HStack>
              </VStack>
            ) : (
              <VStack gap={4} align="stretch">
                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="green.200"
                >
                  <Text fontWeight="semibold" color="green.800" mb={2}>
                    ✓ Employee Invited Successfully!
                  </Text>
                  <Text fontSize="sm" color="green.700">
                    {formData.first_name} {formData.last_name} has been added to your organization.
                  </Text>
                </Box>

                {tempPassword ? (
                  <>
                    <Box
                      p={4}
                      bg="purple.50"
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="purple.200"
                    >
                      <Text fontWeight="semibold" color="purple.800" mb={2}>
                        Temporary Password
                      </Text>
                      <Text fontSize="sm" color="purple.700" mb={3}>
                        Share this password with the employee securely. They should change it after first login.
                      </Text>
                      
                      <HStack gap={2}>
                        <Code
                          flex={1}
                          p={3}
                          fontSize="md"
                          fontWeight="bold"
                          bg="white"
                          borderWidth="1px"
                          borderColor="purple.300"
                        >
                          {tempPassword}
                        </Code>
                        <Button
                          size="md"
                          colorPalette={copied ? 'green' : 'purple'}
                          onClick={handleCopyPassword}
                          minW="100px"
                        >
                          {copied ? (
                            <>
                              <FiCheck /> Copied
                            </>
                          ) : (
                            <>
                              <FiCopy /> Copy
                            </>
                          )}
                        </Button>
                      </HStack>
                    </Box>

                    <Box
                      p={3}
                      bg="orange.50"
                      borderRadius="md"
                      borderLeftWidth="4px"
                      borderLeftColor="orange.400"
                    >
                      <Text fontSize="sm" color="orange.800">
                        <strong>Important:</strong> This password will not be shown again. Make sure to copy and share it with the employee.
                      </Text>
                    </Box>
                  </>
                ) : (
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="blue.200"
                  >
                    <Text fontWeight="semibold" color="blue.800" mb={2}>
                      Existing User Added
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      This user already had an account. They can log in with their existing credentials and will now see your organization in their account.
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </DialogBody>

          <DialogFooter>
            {!tempPassword ? (
              <>
                <DialogActionTrigger asChild>
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                </DialogActionTrigger>
                <Button
                  colorPalette="purple"
                  onClick={handleSubmit}
                  loading={isLoading}
                  loadingText="Inviting..."
                >
                  Send Invitation
                </Button>
              </>
            ) : (
              <Button colorPalette="purple" onClick={handleClose} w="full">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

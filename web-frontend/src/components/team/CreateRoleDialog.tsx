/**
 * Create Role Dialog
 */
import { useState } from 'react';
import {
  Button,
  VStack,
  Input,
  Textarea,
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
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { roleService } from '@/services';

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateRoleDialog = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateRoleDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Role name is required',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      await roleService.createRole({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      toaster.create({
        title: 'Role Created',
        description: `${name} has been created successfully`,
        type: 'success',
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error creating role:', error);
      toaster.create({
        title: 'Failed to Create Role',
        description: error.message || 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(e) => !e.open && handleClose()}
      size="md"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            <Field label="Role Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name (e.g., Sales Manager, Support Agent)"
              />
            </Field>

            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role and its responsibilities..."
                rows={3}
              />
            </Field>
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
              disabled={!name.trim()}
            >
              Create Role
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};


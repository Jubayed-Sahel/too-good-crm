/**
 * Reusable Confirmation Dialog Component
 * Used for confirming destructive actions like delete operations
 */
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from '../ui/dialog';
import { Button, Text } from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  colorScheme?: 'red' | 'orange' | 'purple' | 'blue' | 'green';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  colorScheme = 'red',
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(e) => !e.open && onClose()}
      size="md"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle display="flex" alignItems="center" gap={2}>
            <FiAlertTriangle size={20} color={colorScheme === 'red' ? '#E53E3E' : '#805AD5'} />
            {title}
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <Text color="gray.600">
            {message}
          </Text>
        </DialogBody>

        <DialogFooter gap={3}>
          <DialogActionTrigger asChild>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          </DialogActionTrigger>
          <Button
            colorPalette={colorScheme}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default ConfirmDialog;

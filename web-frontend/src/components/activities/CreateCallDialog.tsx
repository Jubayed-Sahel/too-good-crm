import { useState } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react';
import { Field } from '../ui/field';
import { FiPhone } from 'react-icons/fi';
import { CustomerAutocomplete } from '../common';

interface CreateCallDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CallData) => void;
}

export interface CallData {
  customer?: number;
  customerName: string;
  phoneNumber: string;
  title: string;
  notes?: string;
}

export const CreateCallDialog = ({
  open,
  onClose,
  onSubmit,
}: CreateCallDialogProps) => {
  const [formData, setFormData] = useState<CallData>({
    customerName: '',
    phoneNumber: '',
    title: '',
    notes: '',
  });

  const handleSubmit = () => {
    if (!formData.customerName || !formData.phoneNumber || !formData.title) {
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      title: '',
      notes: '',
    });
    onClose();
  };

  const handleCustomerSelect = (customerId: number, customerName: string) => {
    setFormData({
      ...formData,
      customer: customerId,
      customerName,
    });
  };

  const isValid =
    formData.customerName.trim() !== '' &&
    formData.phoneNumber.trim() !== '' &&
    formData.title.trim() !== '';

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && handleClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <HStack gap={2}>
            <FiPhone size={24} color="#667eea" />
            <DialogTitle>Make a Call</DialogTitle>
          </HStack>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap={4} align="stretch">
            <Field label="Customer" required>
              <CustomerAutocomplete
                value={formData.customer}
                onChange={handleCustomerSelect}
                placeholder="Search and select customer..."
                required
              />
            </Field>

            <Field label="Phone Number" required>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </Field>

            <Field label="Call Title" required>
              <Input
                placeholder="e.g., Follow-up call, Product demo"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Field>

            <Field label="Notes" helperText="Optional notes about the call">
              <Textarea
                placeholder="Add any notes or talking points..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack gap={3}>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              colorPalette="purple"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              <HStack gap={2}>
                <FiPhone size={16} />
                <Text>Start Call</Text>
              </HStack>
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateCallDialog;

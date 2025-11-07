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
import { FiMessageSquare } from 'react-icons/fi';
import { CustomerAutocomplete } from '../common';

interface SendTelegramDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TelegramData) => void;
}

export interface TelegramData {
  customer?: number;
  customerName: string;
  telegramUsername: string;
  message: string;
}

export const SendTelegramDialog = ({
  open,
  onClose,
  onSubmit,
}: SendTelegramDialogProps) => {
  const [formData, setFormData] = useState<TelegramData>({
    customerName: '',
    telegramUsername: '',
    message: '',
  });

  const handleSubmit = () => {
    if (
      !formData.customerName ||
      !formData.telegramUsername ||
      !formData.message
    ) {
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      telegramUsername: '',
      message: '',
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
    formData.telegramUsername.trim() !== '' &&
    formData.message.trim() !== '';

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && handleClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <HStack gap={2}>
            <FiMessageSquare size={24} color="#667eea" />
            <DialogTitle>Send Telegram Message</DialogTitle>
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

            <Field label="Telegram Username" required helperText="Enter username without @ symbol">
              <Input
                placeholder="username"
                value={formData.telegramUsername}
                onChange={(e) =>
                  setFormData({ ...formData, telegramUsername: e.target.value.replace('@', '') })
                }
              />
            </Field>

            <Field label="Message" required>
              <Textarea
                placeholder="Type your message..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
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
                <FiMessageSquare size={16} />
                <Text>Send Message</Text>
              </HStack>
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default SendTelegramDialog;

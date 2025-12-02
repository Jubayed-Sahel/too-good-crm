import { useState, useEffect } from 'react';
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
import { Field } from '@/components/ui/field';
import { FiMail } from 'react-icons/fi';
import { CustomerAutocomplete } from '@/components/common';

interface SendEmailDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmailData) => void;
  initialCustomer?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface EmailData {
  customer?: number;
  customerName: string;
  emailAddress: string;
  subject: string;
  body: string;
}

export const SendEmailDialog = ({
  open,
  onClose,
  onSubmit,
  initialCustomer,
}: SendEmailDialogProps) => {
  const [formData, setFormData] = useState<EmailData>({
    customerName: '',
    emailAddress: '',
    subject: '',
    body: '',
  });

  // Pre-fill customer data when dialog opens with initial customer
  useEffect(() => {
    if (open && initialCustomer) {
      setFormData({
        customer: initialCustomer.id,
        customerName: initialCustomer.name,
        emailAddress: initialCustomer.email || '',
        subject: '',
        body: '',
      });
    } else if (open && !initialCustomer) {
      // Reset form when opening without initial customer
      setFormData({
        customerName: '',
        emailAddress: '',
        subject: '',
        body: '',
      });
    }
  }, [open, initialCustomer]);

  const handleSubmit = () => {
    if (
      !formData.customerName ||
      !formData.emailAddress ||
      !formData.subject ||
      !formData.body
    ) {
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      emailAddress: '',
      subject: '',
      body: '',
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
    formData.emailAddress.trim() !== '' &&
    formData.subject.trim() !== '' &&
    formData.body.trim() !== '';

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && handleClose()} size="xl">
      <DialogContent>
        <DialogHeader>
          <HStack gap={2}>
            <FiMail size={24} color="#667eea" />
            <DialogTitle>Send Email</DialogTitle>
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

            <Field label="Email Address" required>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData({ ...formData, emailAddress: e.target.value })
                }
              />
            </Field>

            <Field label="Subject" required>
              <Input
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </Field>

            <Field label="Message" required>
              <Textarea
                placeholder="Compose your email message..."
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                rows={8}
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
                <FiMail size={16} />
                <Text>Send Email</Text>
              </HStack>
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default SendEmailDialog;

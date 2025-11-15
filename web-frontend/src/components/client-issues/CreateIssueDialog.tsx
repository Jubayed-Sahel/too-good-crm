import { useState } from 'react';
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
import {
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Text,
  Box,
} from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';

export interface CreateIssueData {
  title: string;
  description: string;
  vendor: string;
  orderNumber: string;
  priority: string;
  category: string;
}

interface CreateIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIssueData) => void;
  isLoading?: boolean;
}

const vendors = [
  'Tech Solutions Inc.',
  'Global Suppliers Co.',
  'Quality Products Ltd.',
  'Premium Services Corp.',
  'Reliable Vendors LLC'
];

const categories = [
  { value: 'delivery', label: 'Delivery Issue' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'billing', label: 'Billing Issue' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'general', label: 'General Inquiry' },
];

export const CreateIssueDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false,
}: CreateIssueDialogProps) => {
  const [formData, setFormData] = useState<CreateIssueData>({
    title: '',
    description: '',
    vendor: '',
    orderNumber: '',
    priority: 'medium',
    category: 'general',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      vendor: '',
      orderNumber: '',
      priority: 'medium',
      category: 'general',
    });
    onClose();
  };

  const isFormValid = formData.title && formData.description && formData.vendor;

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(details: any) => !details.open && handleClose()} 
      size={{ base: 'full', md: 'lg' }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <HStack gap={2}>
              <FiAlertCircle size={20} />
              <Text>Lodge New Issue</Text>
            </HStack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Title and Vendor */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Issue Title *
                </Text>
                <Input
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Vendor *
                </Text>
                <select
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </VStack>
            </SimpleGrid>

            {/* Category and Priority */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Category *
                </Text>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Priority *
                </Text>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </VStack>
            </SimpleGrid>

            {/* Order Number */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Related Order Number (Optional)
              </Text>
              <Input
                placeholder="e.g., ORD-2024-001"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                size="sm"
              />
            </VStack>

            {/* Description */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Description *
              </Text>
              <Textarea
                placeholder="Provide detailed information about the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                size="sm"
              />
            </VStack>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            colorPalette="purple"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            loading={isLoading}
          >
            Submit Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateIssueDialog;

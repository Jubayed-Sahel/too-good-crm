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
} from '@chakra-ui/react';
import CustomSelect from '../ui/CustomSelect';
import type { CreateLeadData, LeadSource, LeadPriority } from '../../types';
import { FiPlus } from 'react-icons/fi';

interface CreateLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadData) => void;
  isLoading?: boolean;
}

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email', label: 'Email' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const CreateLeadDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false,
}: CreateLeadDialogProps) => {
  const [formData, setFormData] = useState<CreateLeadData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    jobTitle: '',
    source: 'website',
    priority: 'medium',
    estimatedValue: undefined,
    notes: '',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      jobTitle: '',
      source: 'website',
      priority: 'medium',
      estimatedValue: undefined,
      notes: '',
    });
    onClose();
  };

  const isFormValid = formData.firstName && formData.lastName && formData.company;

  return (
    <DialogRoot open={isOpen} onOpenChange={(details: any) => !details.open && handleClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <HStack gap={2}>
              <FiPlus size={20} />
              <Text>Create New Lead</Text>
            </HStack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Name Fields */}
            <SimpleGrid columns={2} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  First Name *
                </Text>
                <Input
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Last Name *
                </Text>
                <Input
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Contact Fields */}
            <SimpleGrid columns={2} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Email
                </Text>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Phone
                </Text>
                <Input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Company Fields */}
            <SimpleGrid columns={2} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Company *
                </Text>
                <Input
                  placeholder="Acme Corporation"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Job Title
                </Text>
                <Input
                  placeholder="Marketing Director"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Source and Priority */}
            <SimpleGrid columns={2} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Source
                </Text>
                <CustomSelect
                  options={sourceOptions}
                  value={formData.source}
                  onChange={(value: string) => setFormData({ ...formData, source: value as LeadSource })}
                  placeholder="Select source"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Priority
                </Text>
                <CustomSelect
                  options={priorityOptions}
                  value={formData.priority || ''}
                  onChange={(value: string) => setFormData({ ...formData, priority: value as LeadPriority })}
                  placeholder="Select priority"
                />
              </VStack>
            </SimpleGrid>

            {/* Estimated Value */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Estimated Value ($)
              </Text>
              <Input
                type="number"
                placeholder="50000"
                value={formData.estimatedValue || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  estimatedValue: e.target.value ? Number(e.target.value) : undefined 
                })}
                size="sm"
              />
            </VStack>

            {/* Notes */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Notes
              </Text>
              <Textarea
                placeholder="Additional information about the lead..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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
            Create Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

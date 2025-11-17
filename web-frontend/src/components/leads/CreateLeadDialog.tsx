import { useState, useEffect } from 'react';
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
import type { CreateLeadData, LeadSource } from '../../types';
import { FiPlus } from 'react-icons/fi';
import { useProfile } from '@/contexts/ProfileContext';

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
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

export const CreateLeadDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false,
}: CreateLeadDialogProps) => {
  const { activeOrganizationId } = useProfile();
  const [formData, setFormData] = useState<CreateLeadData>({
    organization: activeOrganizationId || 1,
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    source: 'website',
    estimated_value: undefined,
    notes: '',
  });

  // Update organization when active profile changes
  useEffect(() => {
    if (activeOrganizationId) {
      setFormData(prev => ({ ...prev, organization: activeOrganizationId }));
    }
  }, [activeOrganizationId]);

  const handleSubmit = () => {
    console.log('📝 Submitting lead form:', formData);
    onSubmit(formData);
    // Don't close immediately - let parent handle closing on success
  };

  const handleClose = () => {
    setFormData({
      organization: activeOrganizationId || 1,
      name: '',
      email: '',
      phone: '',
      company: '',
      job_title: '',
      source: 'website',
      estimated_value: undefined,
      notes: '',
    });
    onClose();
  };

  const isFormValid = formData.name && formData.company && formData.email;

  return (
    <DialogRoot open={isOpen} onOpenChange={(details: any) => !details.open && handleClose()} size={{ base: 'full', md: 'lg' }}>
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
            {/* Name Field */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Full Name *
              </Text>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="sm"
              />
            </VStack>

            {/* Contact Fields */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Email *
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
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
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
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Source */}
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

            {/* Estimated Value */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Estimated Value ($)
              </Text>
              <Input
                type="number"
                placeholder="50000"
                value={formData.estimated_value || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  estimated_value: e.target.value ? Number(e.target.value) : undefined 
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

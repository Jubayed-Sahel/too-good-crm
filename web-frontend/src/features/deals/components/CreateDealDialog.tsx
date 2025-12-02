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
} from '@/components/ui/dialog';
import {
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import CustomSelect from '@/components/ui/CustomSelect';
import { CustomerAutocomplete } from '@/components/common';
import { FiPlus } from 'react-icons/fi';

interface CreateDealData {
  title: string;
  customer?: number;
  customerName: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  description?: string;
}

interface CreateDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDealData) => void;
  isLoading?: boolean;
}

const stageOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
];

const probabilityOptions = [
  { value: '10', label: '10%' },
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
];

export const CreateDealDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false,
}: CreateDealDialogProps) => {
  const [formData, setFormData] = useState<CreateDealData>({
    title: '',
    customerName: '',
    value: 0,
    stage: 'lead',
    probability: 50,
    expectedCloseDate: '',
    owner: '',
    description: '',
  });

  const handleSubmit = () => {
    // Basic validation before submitting
    if (!formData.title || formData.title.trim().length < 3) {
      alert('Deal title must be at least 3 characters long');
      return;
    }
    
    if (!formData.customer && !formData.customerName) {
      alert('Please select a customer');
      return;
    }
    
    if (!formData.value || formData.value <= 0) {
      alert('Deal value must be greater than 0');
      return;
    }
    
    // Validate expected close date is not in the past
    if (formData.expectedCloseDate) {
      const selectedDate = new Date(formData.expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        alert('Expected close date cannot be in the past');
        return;
      }
    }
    
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      customerName: '',
      value: 0,
      stage: 'lead',
      probability: 50,
      expectedCloseDate: '',
      owner: '',
      description: '',
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

  const isFormValid = 
    formData.title && 
    formData.title.trim().length >= 3 &&
    (formData.customer || formData.customerName) && 
    formData.value > 0;

  return (
    <DialogRoot open={isOpen} onOpenChange={(details: any) => !details.open && handleClose()} size={{ base: 'full', md: 'lg' }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <HStack gap={2}>
              <FiPlus size={20} />
              <Text>Create New Deal</Text>
            </HStack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Deal Title */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Deal Title *
              </Text>
              <Input
                placeholder="Enterprise Software License"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="sm"
              />
            </VStack>

            {/* Customer and Value */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Customer *
                </Text>
                <CustomerAutocomplete
                  value={formData.customer}
                  onChange={handleCustomerSelect}
                  placeholder="Search and select customer..."
                  required
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Deal Value ($) *
                </Text>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    value: e.target.value ? Number(e.target.value) : 0 
                  })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Stage and Probability */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Stage
                </Text>
                <CustomSelect
                  options={stageOptions}
                  value={formData.stage}
                  onChange={(value: string) => setFormData({ 
                    ...formData, 
                    stage: value as 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
                  })}
                  placeholder="Select stage"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Probability
                </Text>
                <CustomSelect
                  options={probabilityOptions}
                  value={formData.probability.toString()}
                  onChange={(value: string) => setFormData({ 
                    ...formData, 
                    probability: Number(value)
                  })}
                  placeholder="Select probability"
                />
              </VStack>
            </SimpleGrid>

            {/* Expected Close Date and Owner */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Expected Close Date
                </Text>
                <Input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Deal Owner
                </Text>
                <Input
                  placeholder="John Doe"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Description */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Description
              </Text>
              <Textarea
                placeholder="Additional information about the deal..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            Create Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateDealDialog;

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
import { FiEdit } from 'react-icons/fi';

export interface EditDealData {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  description?: string;
}

interface EditDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditDealData) => void;
  deal: EditDealData | null;
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

export const EditDealDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  deal,
  isLoading = false,
}: EditDealDialogProps) => {
  const [formData, setFormData] = useState<EditDealData>({
    id: '',
    title: '',
    customer: '',
    value: 0,
    stage: 'lead',
    probability: 50,
    expectedCloseDate: '',
    owner: '',
    description: '',
  });

  // Update form when deal prop changes
  useEffect(() => {
    if (deal) {
      setFormData({
        id: deal.id,
        title: deal.title,
        customer: deal.customer,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate,
        owner: deal.owner,
        description: deal.description || '',
      });
    }
  }, [deal]);

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = formData.title && formData.customer && formData.value > 0;

  return (
    <DialogRoot open={isOpen} onOpenChange={(details: any) => !details.open && handleClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <HStack gap={2}>
              <FiEdit size={20} />
              <Text>Edit Deal</Text>
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
            <SimpleGrid columns={2} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Customer Name *
                </Text>
                <Input
                  placeholder="Acme Corporation"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  size="sm"
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
            <SimpleGrid columns={2} gap={4}>
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
            <SimpleGrid columns={2} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Expected Close Date
                </Text>
                <Input
                  type="date"
                  value={formData.expectedCloseDate ? formData.expectedCloseDate.split('T')[0] : ''}
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default EditDealDialog;

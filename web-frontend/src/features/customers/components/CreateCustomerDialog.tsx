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
import { FiPlus } from 'react-icons/fi';

interface CreateCustomerData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

export const CreateCustomerDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false,
}: CreateCustomerDialogProps) => {
  const [formData, setFormData] = useState<CreateCustomerData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      status: 'active',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: '',
    });
    onClose();
  };

  const isFormValid = formData.fullName && formData.email && formData.company;

  return (
    <DialogRoot open={isOpen} onOpenChange={(details: any) => !details.open && handleClose()} size={{ base: 'full', md: 'lg' }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <HStack gap={2}>
              <FiPlus size={20} />
              <Text>Create New Customer</Text>
            </HStack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Name and Email */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Full Name *
                </Text>
                <Input
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  size="sm"
                />
              </VStack>
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
            </SimpleGrid>

            {/* Phone and Company */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
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
            </SimpleGrid>

            {/* Status */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Status
              </Text>
              <CustomSelect
                options={statusOptions}
                value={formData.status}
                onChange={(value: string) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'pending' })}
                placeholder="Select status"
              />
            </VStack>

            {/* Address */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Address
              </Text>
              <Input
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                size="sm"
              />
            </VStack>

            {/* City and State */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  City
                </Text>
                <Input
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  State/Province
                </Text>
                <Input
                  placeholder="NY"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* ZIP and Country */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  ZIP/Postal Code
                </Text>
                <Input
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  size="sm"
                />
              </VStack>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Country
                </Text>
                <Input
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  size="sm"
                />
              </VStack>
            </SimpleGrid>

            {/* Notes */}
            <VStack gap={1} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Notes
              </Text>
              <Textarea
                placeholder="Additional information about the customer..."
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
            Create Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateCustomerDialog;

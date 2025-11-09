import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CustomSelect from '../components/ui/CustomSelect';
import { Card, StandardButton } from '../components/common';
import { toaster } from '../components/ui/toaster';
import { useCustomers } from '@/hooks';
import type { CustomerStatus } from '@/types';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

export const EditCustomerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { customers, isLoading: loadingCustomer, error, updateCustomer } = useCustomers();
  const [isSaving, setIsSaving] = useState(false);

  // Find customer from list
  const customer = customers?.find((c) => c.id.toString() === id);

  const [formData, setFormData] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    website: '',
    status: 'active' as CustomerStatus,
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    notes: '',
  });

  // Populate form when customer data loads
  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        job_title: customer.job_title || '',
        website: customer.website || '',
        status: customer.status || 'active',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || '',
        postal_code: customer.postal_code || '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  // Update full_name when first_name or last_name changes
  useEffect(() => {
    if (formData.first_name || formData.last_name) {
      setFormData(prev => ({
        ...prev,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      }));
    }
  }, [formData.first_name, formData.last_name]);

  const handleSubmit = async () => {
    if (!id || !customer) return;

    try {
      setIsSaving(true);
      await updateCustomer(customer.id, formData);
      
      toaster.create({
        title: 'Customer updated successfully',
        type: 'success',
      });
      navigate('/customers');
    } catch (err) {
      toaster.create({
        title: 'Failed to update customer',
        description: 'Please try again',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  const isFormValid = formData.first_name && formData.last_name && formData.email;

  if (loadingCustomer) {
    return (
      <DashboardLayout title="Edit Customer">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text color="gray.600">Loading customer...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout title="Edit Customer">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Customer not found
          </Heading>
          <Text color="gray.500" mb={4}>
            The customer you're looking for doesn't exist or has been deleted.
          </Text>
          <StandardButton variant="primary" onClick={() => navigate('/customers')} leftIcon={<FiArrowLeft />}>
            Back to Customers
          </StandardButton>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Customer">
      <VStack gap={5} align="stretch" maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box>
          <StandardButton
            size="sm"
            variant="ghost"
            onClick={() => navigate('/customers')}
            mb={3}
            ml={-2}
            leftIcon={<FiArrowLeft />}
          >
            Back
          </StandardButton>
          <Heading size="xl" mb={2}>
            Edit Customer
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Update customer information and track their status
          </Text>
        </Box>

        {/* Form Content */}
        <Card>
          <VStack gap={6} align="stretch">
            {/* Personal Information */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Personal Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    First Name *
                  </Text>
                  <Input
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Last Name *
                  </Text>
                  <Input
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Email *
                  </Text>
                  <Input
                    type="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Phone
                  </Text>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    size="md"
                  />
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Company Information */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Company Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Company
                  </Text>
                  <Input
                    placeholder="Acme Corporation"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Job Title
                  </Text>
                  <Input
                    placeholder="Sales Manager"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch" gridColumn={{ base: '1', md: 'span 2' }}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Website
                  </Text>
                  <Input
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    size="md"
                  />
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Customer Status */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Customer Status
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Status
                  </Text>
                  <CustomSelect
                    options={statusOptions}
                    value={formData.status as string}
                    onChange={(value: string) => setFormData({ 
                      ...formData, 
                      status: value as CustomerStatus 
                    })}
                    placeholder="Select status"
                  />
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Address Information */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Address Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch" gridColumn={{ base: '1', md: 'span 2' }}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Street Address
                  </Text>
                  <Input
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    City
                  </Text>
                  <Input
                    placeholder="San Francisco"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    State/Province
                  </Text>
                  <Input
                    placeholder="CA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Postal Code
                  </Text>
                  <Input
                    placeholder="94105"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Country
                  </Text>
                  <Input
                    placeholder="USA"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    size="md"
                  />
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Additional Information */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Additional Information
              </Heading>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Notes
                </Text>
                <Textarea
                  placeholder="Add notes about this customer..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  size="md"
                />
              </VStack>
            </Box>
          </VStack>
        </Card>

        {/* Bottom Action Buttons */}
        <HStack justify="flex-end" gap={2} pb={8}>
          <StandardButton
            variant="outline"
            onClick={handleCancel}
            size="lg"
            leftIcon={<FiX />}
          >
            Cancel
          </StandardButton>
          <StandardButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || isSaving}
            isLoading={isSaving}
            size="lg"
            leftIcon={<FiSave />}
          >
            Save Changes
          </StandardButton>
        </HStack>
      </VStack>
    </DashboardLayout>
  );
};

export default EditCustomerPage;

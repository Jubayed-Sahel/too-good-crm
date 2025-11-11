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
import { useLead, useUpdateLead } from '@/hooks';
import type { UpdateLeadData, LeadSource, LeadStatus } from '@/types';

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

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const EditLeadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: lead, isLoading: loadingLead, error } = useLead(id || '');
  const updateLead = useUpdateLead();

  const [formData, setFormData] = useState<UpdateLeadData>({
    name: '',
    email: '',
    phone: '',
    organization_name: '',
    job_title: '',
    source: 'website',
    status: 'active',
    estimated_value: 0,
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    notes: '',
  });

  // Populate form when lead data loads
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        organization_name: lead.organization_name || '',
        job_title: lead.job_title || '',
        source: lead.source,
        status: lead.status,
        estimated_value: lead.estimated_value || 0,
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        postal_code: lead.postal_code || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleSubmit = () => {
    if (!id) return;

    updateLead.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          toaster.create({
            title: 'Lead updated successfully',
            type: 'success',
          });
          navigate('/leads');
        },
        onError: () => {
          toaster.create({
            title: 'Failed to update lead',
            description: 'Please try again',
            type: 'error',
          });
        },
      }
    );
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  const isFormValid = formData.name && formData.email;

  if (loadingLead) {
    return (
      <DashboardLayout title="Edit Lead">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text color="gray.600">Loading lead...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout title="Edit Lead">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Lead not found
          </Heading>
          <Text color="gray.500" mb={4}>
            The lead you're looking for doesn't exist or has been deleted.
          </Text>
          <StandardButton variant="primary" onClick={() => navigate('/leads')} leftIcon={<FiArrowLeft />}>
            Back to Leads
          </StandardButton>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Lead">
      <VStack gap={5} align="stretch" maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box>
          <StandardButton
            size="sm"
            variant="ghost"
            onClick={() => navigate('/leads')}
            mb={3}
            ml={-2}
            leftIcon={<FiArrowLeft />}
          >
            Back
          </StandardButton>
          <Heading size="xl" mb={2}>
            Edit Lead
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Update lead information and track their progress
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
                    Full Name *
                  </Text>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                Organization Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Organization
                  </Text>
                  <Input
                    placeholder="Acme Corporation"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
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
              </SimpleGrid>
            </Box>

            {/* Lead Details */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Lead Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Source
                  </Text>
                  <CustomSelect
                    options={sourceOptions}
                    value={formData.source as string}
                    onChange={(value: string) => setFormData({ 
                      ...formData, 
                      source: value as LeadSource 
                    })}
                    placeholder="Select source"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Status
                  </Text>
                  <CustomSelect
                    options={statusOptions}
                    value={formData.status as string}
                    onChange={(value: string) => setFormData({ 
                      ...formData, 
                      status: value as LeadStatus 
                    })}
                    placeholder="Select status"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Estimated Value ($)
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={formData.estimated_value || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estimated_value: e.target.value ? Number(e.target.value) : 0 
                    })}
                    size="md"
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
                  placeholder="Add notes about this lead..."
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
            disabled={!isFormValid || updateLead.isPending}
            loading={updateLead.isPending}
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

export default EditLeadPage;

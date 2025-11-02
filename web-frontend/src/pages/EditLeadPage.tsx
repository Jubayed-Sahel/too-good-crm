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
  Button,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CustomSelect from '../components/ui/CustomSelect';
import { Card } from '../components/common';
import { toaster } from '../components/ui/toaster';
import { useLead, useUpdateLead } from '@/hooks';
import type { UpdateLeadData, LeadSource, LeadStatus, LeadPriority } from '@/types';

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

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const EditLeadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: lead, isLoading: loadingLead, error } = useLead(id || '');
  const updateLead = useUpdateLead();

  const [formData, setFormData] = useState<UpdateLeadData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    website: '',
    source: 'website',
    status: 'new',
    priority: 'medium',
    score: 0,
    estimatedValue: 0,
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    description: '',
  });

  // Populate form when lead data loads
  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
        title: lead.title || '',
        website: lead.website || '',
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        score: lead.score,
        estimatedValue: lead.estimatedValue || 0,
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        postalCode: lead.postalCode || '',
        description: lead.description || '',
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

  const isFormValid = formData.firstName && formData.lastName && formData.email;

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
          <Button onClick={() => navigate('/leads')} colorPalette="purple">
            <FiArrowLeft />
            <Box ml={2}>Back to Leads</Box>
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Lead">
      <VStack gap={5} align="stretch" maxW="1200px" mx="auto">
        {/* Page Header */}
        <HStack justify="space-between" align="start">
          <Box>
            <HStack gap={2} mb={2}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/leads')}
              >
                <FiArrowLeft />
                <Box ml={2}>Back</Box>
              </Button>
            </HStack>
            <Heading size="2xl" mb={2}>
              Edit Lead
            </Heading>
            <Text color="gray.600" fontSize="md">
              Update lead information and track their progress
            </Text>
          </Box>

          <HStack gap={2}>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <FiX />
              <Box ml={2}>Cancel</Box>
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleSubmit}
              disabled={!isFormValid || updateLead.isPending}
              loading={updateLead.isPending}
            >
              <FiSave />
              <Box ml={2}>Save Changes</Box>
            </Button>
          </HStack>
        </HStack>

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
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    size="md"
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    Priority
                  </Text>
                  <CustomSelect
                    options={priorityOptions}
                    value={formData.priority as string}
                    onChange={(value: string) => setFormData({ 
                      ...formData, 
                      priority: value as LeadPriority 
                    })}
                    placeholder="Select priority"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Lead Score (0-100)
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="75"
                    value={formData.score || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      score: e.target.value ? Number(e.target.value) : 0 
                    })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch" gridColumn={{ base: '1', md: 'span 2' }}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Estimated Value ($)
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={formData.estimatedValue || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estimatedValue: e.target.value ? Number(e.target.value) : 0 
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
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
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
                  Description
                </Text>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  size="md"
                />
              </VStack>
            </Box>
          </VStack>
        </Card>

        {/* Bottom Action Buttons */}
        <HStack justify="flex-end" gap={2} pb={8}>
          <Button
            variant="outline"
            onClick={handleCancel}
            size="lg"
          >
            <FiX />
            <Box ml={2}>Cancel</Box>
          </Button>
          <Button
            colorPalette="purple"
            onClick={handleSubmit}
            disabled={!isFormValid || updateLead.isPending}
            loading={updateLead.isPending}
            size="lg"
          >
            <FiSave />
            <Box ml={2}>Save Changes</Box>
          </Button>
        </HStack>
      </VStack>
    </DashboardLayout>
  );
};

export default EditLeadPage;

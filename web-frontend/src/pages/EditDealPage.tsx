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
import { dealService } from '@/services/deal.service';
import type { Deal } from '@/types';

const stageOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
];

export const EditDealPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    value: 0,
    stage: 'lead',
    probability: 0,
    expectedCloseDate: '',
    owner: '',
    description: '',
  });

  // Fetch deal data
  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const dealData = await dealService.getDeal(parseInt(id));
        if (dealData) {
          setDeal(dealData);
          setFormData({
            title: dealData.title,
            customer: dealData.customer_name || '',
            value: typeof dealData.value === 'string' ? parseFloat(dealData.value) : dealData.value,
            stage: dealData.stage,
            probability: dealData.probability,
            expectedCloseDate: dealData.expected_close_date?.split('T')[0] || '', // Format for date input
            owner: dealData.assigned_to_name || 'Unassigned',
            description: dealData.description || '',
          });
        } else {
          setError('Deal not found');
        }
      } catch (err) {
        setError('Failed to load deal');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || !deal) return;

    try {
      setIsSaving(true);
      await dealService.updateDeal(parseInt(id), {
        title: formData.title,
        value: formData.value,
        probability: formData.probability,
        expected_close_date: formData.expectedCloseDate,
        description: formData.description,
      });
      
      toaster.create({
        title: 'Deal updated successfully',
        type: 'success',
      });
      navigate('/deals');
    } catch (err) {
      toaster.create({
        title: 'Failed to update deal',
        description: 'Please try again',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/deals');
  };

  const isFormValid = formData.title && formData.customer && formData.value > 0;

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Deal">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text color="gray.600">Loading deal...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !deal) {
    return (
      <DashboardLayout title="Edit Deal">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Deal not found
          </Heading>
          <Text color="gray.500" mb={4}>
            The deal you're looking for doesn't exist or has been deleted.
          </Text>
          <StandardButton variant="primary" onClick={() => navigate('/deals')} leftIcon={<FiArrowLeft />}>
            Back to Deals
          </StandardButton>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Deal">
      <VStack gap={5} align="stretch" maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box>
          <StandardButton
            size="sm"
            variant="ghost"
            onClick={() => navigate('/deals')}
            mb={3}
            ml={-2}
            leftIcon={<FiArrowLeft />}
          >
            Back
          </StandardButton>
          <Heading size="2xl" mb={2}>
            Edit Deal
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Update deal information and track progress
          </Text>
        </Box>

        {/* Form Content */}
        <Card>
          <VStack gap={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Basic Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch" gridColumn={{ base: '1', md: 'span 2' }}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Deal Title *
                  </Text>
                  <Input
                    placeholder="Enterprise CRM Implementation"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Customer Name *
                  </Text>
                  <Input
                    placeholder="Acme Corporation"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    size="md"
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
                    size="md"
                  />
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Deal Details */}
            <Box>
              <Heading size="md" mb={4} color="gray.900">
                Deal Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Deal Value ($) *
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      value: e.target.value ? Number(e.target.value) : 0 
                    })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Stage
                  </Text>
                  <CustomSelect
                    options={stageOptions}
                    value={formData.stage}
                    onChange={(value: string) => setFormData({ 
                      ...formData, 
                      stage: value 
                    })}
                    placeholder="Select stage"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Win Probability (%)
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="75"
                    value={formData.probability || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      probability: e.target.value ? Number(e.target.value) : 0 
                    })}
                    size="md"
                  />
                </VStack>

                <VStack gap={1} align="stretch" gridColumn={{ base: '1', md: 'span 3' }}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Expected Close Date
                  </Text>
                  <Input
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
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
                  placeholder="Add notes about this deal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  size="md"
                />
              </VStack>
            </Box>

            {/* Expected Revenue Display */}
            <Box
              p={4}
              bg="green.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Text fontSize="sm" fontWeight="semibold" color="green.800" mb={2}>
                Expected Revenue
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.900">
                ${((formData.value * formData.probability) / 100).toLocaleString()}
              </Text>
              <Text fontSize="sm" color="green.700" mt={1}>
                Based on {formData.probability}% win probability
              </Text>
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

export default EditDealPage;

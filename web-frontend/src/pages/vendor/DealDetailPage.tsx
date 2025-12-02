import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  FiMail,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiArrowLeft,
  FiActivity,
  FiFileText,
  FiTrendingUp,
  FiTarget,
} from 'react-icons/fi';
import { dealService } from '@/features/deals/services/deal.service';
import { useDeleteDeal } from '@/hooks';
import { StandardButton, ConfirmDialog } from '@/components/common';
import type { Deal } from '@/types';

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deleteDeal = useDeleteDeal();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const dealData = await dealService.getDeal(parseInt(id));
        if (dealData) {
          setDeal(dealData);
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

  const getStageColor = (stage: string): string => {
    const stageColors: Record<string, string> = {
      lead: 'blue',
      qualified: 'cyan',
      proposal: 'purple',
      negotiation: 'orange',
      'closed-won': 'green',
      'closed-lost': 'red',
    };
    return stageColors[stage] || 'gray';
  };

  const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      lead: 'Lead',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost',
    };
    return labels[stage] || stage;
  };

  const getDealValue = (deal: Deal): number => {
    return typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = () => {
    navigate(`/deals/${id}/edit`);
  };

  const handleDelete = () => {
    if (!deal) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deal || !id) return;
    deleteDeal.mutate(parseInt(id), {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate('/deals');
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Deal Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text fontSize="md" color="gray.600">
              Loading deal details...
            </Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !deal) {
    return (
      <DashboardLayout title="Deal Details">
        <Box textAlign="center" py={12}>
          <Box
            w={16}
            h={16}
            bg="red.50"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={4}
          >
            <Text fontSize="3xl">⚠️</Text>
          </Box>
          <Heading size="lg" color="red.600" mb={3}>
            Deal Not Found
          </Heading>
          <Text color="gray.600" fontSize="md" mb={6}>
            The deal you are looking for does not exist.
          </Text>
          <StandardButton
            variant="primary"
            onClick={() => navigate('/deals')}
            leftIcon={<FiArrowLeft />}
          >
            Back to Deals
          </StandardButton>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={deal.title}>
      <VStack align="stretch" gap={5}>
        {/* Back Button and Actions */}
        <HStack justify="space-between" align="center">
          <StandardButton
            variant="ghost"
            onClick={() => navigate('/deals')}
            leftIcon={<FiArrowLeft />}
          >
            Back to Deals
          </StandardButton>
          <HStack gap={2}>
            <StandardButton
              variant="outline"
              onClick={handleEdit}
              leftIcon={<FiEdit2 />}
            >
              Edit
            </StandardButton>
            <StandardButton
              variant="danger"
              onClick={handleDelete}
              leftIcon={<FiTrash2 />}
            >
              Delete
            </StandardButton>
          </HStack>
        </HStack>

        {/* Header Section with Deal Info */}
        <Box
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          color="white"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative Background Elements */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="200px"
            h="200px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(40px)"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="150px"
            h="150px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(30px)"
          />

          <VStack align="stretch" gap={4} position="relative" zIndex={1}>
            <HStack
              justify="space-between"
              align={{ base: 'start', md: 'center' }}
              flexWrap="wrap"
              gap={4}
            >
              <HStack gap={4} flex={1}>
                <Box
                  w={{ base: 16, md: 20 }}
                  h={{ base: 16, md: 20 }}
                  bg="whiteAlpha.300"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="bold"
                  backdropFilter="blur(10px)"
                  borderWidth="2px"
                  borderColor="whiteAlpha.400"
                >
                  {deal.title.charAt(0).toUpperCase()}
                </Box>
                <VStack align="start" gap={1}>
                  <Heading size={{ base: 'xl', md: '2xl' }}>
                    {deal.title}
                  </Heading>
                  <HStack gap={2}>
                    <FiUser size={16} />
                    <Text fontSize="lg">{deal.customer_name || 'Unknown Customer'}</Text>
                  </HStack>
                  <HStack gap={2} opacity={0.85}>
                    <FiBriefcase size={14} />
                    <Text fontSize="md">Owner: {deal.assigned_to_name || 'Unassigned'}</Text>
                  </HStack>
                </VStack>
              </HStack>
              <Badge
                colorPalette={getStageColor(deal.stage)}
                size="lg"
                variant="solid"
                px={4}
                py={2}
                borderRadius="full"
                textTransform="capitalize"
                fontSize="md"
              >
                {getStageLabel(deal.stage)}
              </Badge>
            </HStack>

            {/* Deal Value & Probability */}
            <HStack
              p={4}
              bg="whiteAlpha.200"
              borderRadius="lg"
              backdropFilter="blur(10px)"
              justify="space-between"
            >
              <HStack gap={3}>
                <Box p={2} bg="whiteAlpha.300" borderRadius="md">
                  <FiDollarSign size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" opacity={0.9}>
                    Deal Value
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(getDealValue(deal))}
                  </Text>
                </VStack>
              </HStack>
              <HStack gap={3}>
                <VStack align="end" gap={0}>
                  <Text fontSize="sm" opacity={0.9}>
                    Win Probability
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {deal.probability}%
                  </Text>
                </VStack>
                <Box p={2} bg="whiteAlpha.300" borderRadius="md">
                  <FiTrendingUp size={20} />
                </Box>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={5}
        >
          {/* Left Column - Deal Details */}
          <VStack align="stretch" gap={5}>
            {/* Deal Information Card */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Heading size="lg" mb={4} color="gray.800">
                Deal Information
              </Heading>
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4}>
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <HStack gap={3} mb={2}>
                    <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                      <FiCalendar size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                      Expected Close Date
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="bold" color="blue.900">
                    {formatDate(deal.expected_close_date)}
                  </Text>
                </Box>

                <Box
                  p={4}
                  bg="purple.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="purple.200"
                >
                  <HStack gap={3} mb={2}>
                    <Box p={2} bg="purple.100" borderRadius="md" color="purple.600">
                      <FiTarget size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="purple.800">
                      Probability
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="bold" color="purple.900">
                    {deal.probability}% chance to win
                  </Text>
                </Box>

                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="green.200"
                  gridColumn={{ base: '1', sm: 'span 2' }}
                >
                  <HStack gap={3} mb={2}>
                    <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                      <FiDollarSign size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="green.800">
                      Expected Revenue
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.900">
                    {formatCurrency((getDealValue(deal) * deal.probability) / 100)}
                  </Text>
                  <Text fontSize="sm" color="green.700" mt={1}>
                    Based on {deal.probability}% probability
                  </Text>
                </Box>
              </Grid>
            </Box>

            {/* Description Card */}
            {deal.description && (
              <Box
                bg="white"
                borderRadius="xl"
                p={{ base: 5, md: 6 }}
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <HStack gap={3} mb={4}>
                  <Box p={2} bg="yellow.100" borderRadius="md" color="yellow.600">
                    <FiFileText size={20} />
                  </Box>
                  <Heading size="lg" color="gray.800">
                    Description
                  </Heading>
                </HStack>
                <Box
                  p={4}
                  bg="yellow.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="yellow.200"
                >
                  <Text fontSize="md" color="gray.700" lineHeight="tall">
                    {deal.description}
                  </Text>
                </Box>
              </Box>
            )}
          </VStack>

          {/* Right Column - Timeline & Actions */}
          <VStack align="stretch" gap={5}>
            {/* Timeline Card */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack gap={3} mb={4}>
                <Box p={2} bg="purple.100" borderRadius="md" color="purple.600">
                  <FiActivity size={20} />
                </Box>
                <Heading size="lg" color="gray.800">
                  Timeline
                </Heading>
              </HStack>
              <VStack align="stretch" gap={3}>
                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderLeftWidth="3px"
                  borderLeftColor="purple.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Deal Created
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {formatDate(deal.created_at)}
                  </Text>
                </Box>

                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderLeftWidth="3px"
                  borderLeftColor="blue.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Last Activity
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {formatDate(deal.updated_at)}
                  </Text>
                </Box>

                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderLeftWidth="3px"
                  borderLeftColor="green.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Expected Close
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {formatDate(deal.expected_close_date)}
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Quick Actions Card */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Heading size="lg" mb={4} color="gray.800">
                Quick Actions
              </Heading>
              <VStack align="stretch" gap={2}>
                <StandardButton
                  variant="outline"
                  w="full"
                  justifyContent="flex-start"
                  leftIcon={<FiMail />}
                >
                  Send Email
                </StandardButton>
                <StandardButton
                  variant="outline"
                  w="full"
                  justifyContent="flex-start"
                  leftIcon={<FiFileText />}
                >
                  Add Note
                </StandardButton>
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </VStack>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Deal"
        message={
          deal
            ? `Are you sure you want to delete deal "${deal.title}"? This action cannot be undone.`
            : 'Are you sure you want to delete this deal?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={deleteDeal.isPending}
      />
    </DashboardLayout>
  );
};

export default DealDetailPage;

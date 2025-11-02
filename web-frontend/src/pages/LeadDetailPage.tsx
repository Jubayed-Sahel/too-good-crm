import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Button,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  FiMail,
  FiPhone,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiArrowLeft,
  FiActivity,
  FiFileText,
  FiGlobe,
  FiMapPin,
  FiTrendingUp,
  FiTarget,
} from 'react-icons/fi';
import { useLead } from '@/hooks';
import type { LeadStatus, LeadPriority, LeadSource } from '@/types';

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading, error } = useLead(id || '');

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'cyan';
      case 'qualified':
        return 'green';
      case 'proposal':
        return 'purple';
      case 'negotiation':
        return 'orange';
      case 'converted':
        return 'green';
      case 'lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: LeadPriority) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getSourceLabel = (source: LeadSource) => {
    const labels: Record<LeadSource, string> = {
      website: 'Website',
      referral: 'Referral',
      cold_call: 'Cold Call',
      email: 'Email',
      social_media: 'Social Media',
      trade_show: 'Trade Show',
      partner: 'Partner',
      other: 'Other',
    };
    return labels[source] || source;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    navigate(`/leads/${id}/edit`);
  };

  const handleDelete = () => {
    if (!lead) return;
    if (confirm(`Are you sure you want to delete lead ${lead.fullName}?`)) {
      // TODO: Implement delete functionality
      alert(`Lead ${lead.fullName} deleted`);
      navigate('/leads');
    }
  };

  const handleConvert = () => {
    if (!lead) return;
    // TODO: Implement convert functionality
    alert(`Convert ${lead.fullName} to customer`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Lead Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text fontSize="md" color="gray.600">
              Loading lead details...
            </Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout title="Lead Details">
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
            Lead Not Found
          </Heading>
          <Text color="gray.600" fontSize="md" mb={6}>
            The lead you are looking for does not exist.
          </Text>
          <Button
            colorPalette="purple"
            onClick={() => navigate('/leads')}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Leads</Text>
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={lead.fullName}>
      <VStack align="stretch" gap={5}>
        {/* Back Button and Actions */}
        <HStack justify="space-between" align="center">
          <Button
            variant="ghost"
            colorPalette="gray"
            onClick={() => navigate('/leads')}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Leads</Text>
          </Button>
          <HStack gap={2}>
            <Button
              variant="solid"
              colorPalette="green"
              onClick={handleConvert}
            >
              <FiTarget />
              <Text ml={2}>Convert to Customer</Text>
            </Button>
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={handleEdit}
            >
              <FiEdit2 />
              <Text ml={2}>Edit</Text>
            </Button>
            <IconButton
              aria-label="Delete lead"
              variant="outline"
              colorPalette="red"
              onClick={handleDelete}
            >
              <FiTrash2 />
            </IconButton>
          </HStack>
        </HStack>

        {/* Header Section with Lead Info */}
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
                  {lead.firstName.charAt(0).toUpperCase()}
                </Box>
                <VStack align="start" gap={1}>
                  <Heading size={{ base: 'xl', md: '2xl' }}>
                    {lead.fullName}
                  </Heading>
                  {lead.company && (
                    <HStack gap={2} opacity={0.9}>
                      <FiBriefcase size={16} />
                      <Text fontSize="lg">{lead.company}</Text>
                    </HStack>
                  )}
                  {lead.title && (
                    <HStack gap={2} opacity={0.85}>
                      <FiUser size={14} />
                      <Text fontSize="md">{lead.title}</Text>
                    </HStack>
                  )}
                </VStack>
              </HStack>
              <HStack gap={2}>
                <Badge
                  colorPalette={getStatusColor(lead.status)}
                  size="lg"
                  variant="solid"
                  px={4}
                  py={2}
                  borderRadius="full"
                  textTransform="capitalize"
                  fontSize="md"
                >
                  {lead.status}
                </Badge>
                <Badge
                  colorPalette={getPriorityColor(lead.priority)}
                  size="lg"
                  variant="solid"
                  px={4}
                  py={2}
                  borderRadius="full"
                  textTransform="capitalize"
                  fontSize="md"
                >
                  {lead.priority}
                </Badge>
              </HStack>
            </HStack>

            {/* Lead Score */}
            <HStack
              p={4}
              bg="whiteAlpha.200"
              borderRadius="lg"
              backdropFilter="blur(10px)"
              justify="space-between"
            >
              <HStack gap={3}>
                <Box p={2} bg="whiteAlpha.300" borderRadius="md">
                  <FiTrendingUp size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" opacity={0.9}>
                    Lead Score
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {lead.score}/100
                  </Text>
                </VStack>
              </HStack>
              <HStack gap={3}>
                <VStack align="end" gap={0}>
                  <Text fontSize="sm" opacity={0.9}>
                    Estimated Value
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(lead.estimatedValue)}
                  </Text>
                </VStack>
                <Box p={2} bg="whiteAlpha.300" borderRadius="md">
                  <FiDollarSign size={20} />
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
          {/* Left Column - Contact & Business Info */}
          <VStack align="stretch" gap={5}>
            {/* Contact Information Card */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Heading size="lg" mb={4} color="gray.800">
                Contact Information
              </Heading>
              <VStack align="stretch" gap={4}>
                <HStack
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Box
                    p={3}
                    bg="purple.100"
                    borderRadius="lg"
                    color="purple.600"
                  >
                    <FiMail size={20} />
                  </Box>
                  <VStack align="start" gap={0.5} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                      Email Address
                    </Text>
                    <Text fontSize="md" fontWeight="medium" color="gray.900">
                      {lead.email}
                    </Text>
                  </VStack>
                </HStack>

                {lead.phone && (
                  <HStack
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Box
                      p={3}
                      bg="blue.100"
                      borderRadius="lg"
                      color="blue.600"
                    >
                      <FiPhone size={20} />
                    </Box>
                    <VStack align="start" gap={0.5} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                        Phone Number
                      </Text>
                      <Text fontSize="md" fontWeight="medium" color="gray.900">
                        {lead.phone}
                      </Text>
                    </VStack>
                  </HStack>
                )}

                {lead.website && (
                  <HStack
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Box
                      p={3}
                      bg="green.100"
                      borderRadius="lg"
                      color="green.600"
                    >
                      <FiGlobe size={20} />
                    </Box>
                    <VStack align="start" gap={0.5} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                        Website
                      </Text>
                      <Text fontSize="md" fontWeight="medium" color="gray.900">
                        {lead.website}
                      </Text>
                    </VStack>
                  </HStack>
                )}

                {(lead.city || lead.state || lead.country) && (
                  <HStack
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Box
                      p={3}
                      bg="orange.100"
                      borderRadius="lg"
                      color="orange.600"
                    >
                      <FiMapPin size={20} />
                    </Box>
                    <VStack align="start" gap={0.5} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                        Location
                      </Text>
                      <Text fontSize="md" fontWeight="medium" color="gray.900">
                        {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
                      </Text>
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Lead Details Card */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Heading size="lg" mb={4} color="gray.800">
                Lead Details
              </Heading>
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4}>
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={2}>
                    Source
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="blue.900">
                    {getSourceLabel(lead.source)}
                  </Text>
                </Box>

                <Box
                  p={4}
                  bg="purple.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="purple.200"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="purple.800" mb={2}>
                    Assigned To
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="purple.900">
                    {lead.assignedToName || 'Unassigned'}
                  </Text>
                </Box>

                {lead.nextFollowUpAt && (
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
                        <FiCalendar size={20} />
                      </Box>
                      <Text fontSize="sm" fontWeight="semibold" color="green.800">
                        Next Follow-up
                      </Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="bold" color="green.900">
                      {formatDate(lead.nextFollowUpAt)}
                    </Text>
                  </Box>
                )}
              </Grid>
            </Box>

            {/* Description Card */}
            {lead.description && (
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
                    {lead.description}
                  </Text>
                </Box>
              </Box>
            )}
          </VStack>

          {/* Right Column - Activity & Timeline */}
          <VStack align="stretch" gap={5}>
            {/* Recent Activity Card */}
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
                    Lead Created
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {formatDate(lead.createdAt)}
                  </Text>
                </Box>

                {lead.lastContactedAt && (
                  <Box
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderLeftWidth="3px"
                    borderLeftColor="blue.500"
                  >
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                      Last Contacted
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {formatDate(lead.lastContactedAt)}
                    </Text>
                  </Box>
                )}

                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderLeftWidth="3px"
                  borderLeftColor="green.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Last Updated
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {formatDate(lead.updatedAt)}
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Tags Card */}
            {lead.tags && lead.tags.length > 0 && (
              <Box
                bg="white"
                borderRadius="xl"
                p={{ base: 5, md: 6 }}
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Heading size="lg" mb={4} color="gray.800">
                  Tags
                </Heading>
                <HStack gap={2} flexWrap="wrap">
                  {lead.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      colorPalette="purple"
                      size="md"
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

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
                <Button
                  variant="outline"
                  colorPalette="purple"
                  w="full"
                  justifyContent="flex-start"
                >
                  <FiMail />
                  <Text ml={2}>Send Email</Text>
                </Button>
                <Button
                  variant="outline"
                  colorPalette="blue"
                  w="full"
                  justifyContent="flex-start"
                >
                  <FiPhone />
                  <Text ml={2}>Make Call</Text>
                </Button>
                <Button
                  variant="outline"
                  colorPalette="green"
                  w="full"
                  justifyContent="flex-start"
                  onClick={handleConvert}
                >
                  <FiTarget />
                  <Text ml={2}>Convert to Customer</Text>
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </VStack>
    </DashboardLayout>
  );
};

export default LeadDetailPage;

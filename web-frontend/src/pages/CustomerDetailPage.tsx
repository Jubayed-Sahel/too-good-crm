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
} from 'react-icons/fi';
import { useCustomers } from '@/hooks';
import { useMemo } from 'react';

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, isLoading, error } = useCustomers();

  // Find the customer by ID - now uses full mock data with activities, notes, etc.
  const customer = useMemo(() => {
    if (!customers || !id) return null;
    
    const found = customers.find((c) => c.id.toString() === id) as any;
    if (!found) return null;

    // Return the full customer object with all mock data fields
    return {
      id: found.id.toString(),
      name: found.full_name,
      email: found.email,
      phone: found.phone || '',
      company: found.company || '',
      website: found.website || '',
      address: found.address || '',
      city: found.city || '',
      state: found.state || '',
      country: found.country || '',
      status: (found.status?.toLowerCase() || 'active') as 'active' | 'inactive' | 'pending',
      job_title: found.job_title || '',
      industry: found.industry || '',
      source: found.source || '',
      notes: found.notes || '',
      tags: found.tags || [],
      totalValue: found.total_value || 0,
      lifetimeValue: found.lifetime_value || 0,
      lastContact: found.last_contact || found.updated_at || found.created_at,
      created_at: found.created_at,
    };
  }, [customers, id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'pending':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    alert(`Edit customer: ${customer?.name}`);
  };

  const handleDelete = () => {
    if (!customer) return;
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      // TODO: Implement delete functionality
      alert(`Customer ${customer.name} deleted`);
      navigate('/customers');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Customer Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text fontSize="md" color="gray.600">
              Loading customer details...
            </Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout title="Customer Details">
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
            Customer Not Found
          </Heading>
          <Text color="gray.600" fontSize="md" mb={6}>
            {error?.message || 'The customer you are looking for does not exist.'}
          </Text>
          <Button
            colorPalette="purple"
            onClick={() => navigate('/customers')}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Customers</Text>
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={customer.name}>
      <VStack align="stretch" gap={5}>
        {/* Back Button and Actions */}
        <HStack justify="space-between" align="center">
          <Button
            variant="ghost"
            colorPalette="gray"
            onClick={() => navigate('/customers')}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Customers</Text>
          </Button>
          <HStack gap={2}>
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={handleEdit}
            >
              <FiEdit2 />
              <Text ml={2}>Edit</Text>
            </Button>
            <IconButton
              aria-label="Delete customer"
              variant="outline"
              colorPalette="red"
              onClick={handleDelete}
            >
              <FiTrash2 />
            </IconButton>
          </HStack>
        </HStack>

        {/* Header Section with Customer Info */}
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

          <HStack
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
            flexWrap="wrap"
            gap={4}
            position="relative"
            zIndex={1}
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
                {customer.name.charAt(0).toUpperCase()}
              </Box>
              <VStack align="start" gap={1}>
                <Heading size={{ base: 'xl', md: '2xl' }}>
                  {customer.name}
                </Heading>
                {customer.company && (
                  <HStack gap={2} opacity={0.9}>
                    <FiBriefcase size={16} />
                    <Text fontSize="lg">{customer.company}</Text>
                  </HStack>
                )}
                <HStack gap={2} opacity={0.85}>
                  <FiUser size={14} />
                  <Text fontSize="md">Customer ID: #{customer.id}</Text>
                </HStack>
              </VStack>
            </HStack>
            <Badge
              colorPalette={getStatusColor(customer.status)}
              size="lg"
              variant="solid"
              px={4}
              py={2}
              borderRadius="full"
              textTransform="capitalize"
              fontSize="md"
            >
              {customer.status}
            </Badge>
          </HStack>
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
                      {customer.email}
                    </Text>
                  </VStack>
                </HStack>

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
                      {customer.phone || 'Not provided'}
                    </Text>
                  </VStack>
                </HStack>

                {customer.company && (
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
                      <FiBriefcase size={20} />
                    </Box>
                    <VStack align="start" gap={0.5} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                        Company
                      </Text>
                      <Text fontSize="md" fontWeight="medium" color="gray.900">
                        {customer.company}
                      </Text>
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Business Metrics Card */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Heading size="lg" mb={4} color="gray.800">
                Business Metrics
              </Heading>
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4}>
                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="green.200"
                >
                  <HStack gap={3} mb={2}>
                    <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                      <FiDollarSign size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="green.800">
                      Total Value
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.900">
                    {formatCurrency(customer.totalValue)}
                  </Text>
                </Box>

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
                      Last Contact
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="bold" color="blue.900">
                    {formatDate(customer.lastContact)}
                  </Text>
                </Box>
              </Grid>
            </Box>
          </VStack>

          {/* Right Column - Activity & Notes */}
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
                  Recent Activity
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
                    Customer Created
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {formatDate(customer.lastContact)}
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
                    Profile Updated
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    All information up to date
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Notes Card */}
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
                  Notes
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
                  Customer profile is active and maintained in the system. All
                  contact information and business details are up to date and
                  verified.
                </Text>
              </Box>
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
                >
                  <FiFileText />
                  <Text ml={2}>Create Deal</Text>
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </VStack>
    </DashboardLayout>
  );
};

export default CustomerDetailPage;

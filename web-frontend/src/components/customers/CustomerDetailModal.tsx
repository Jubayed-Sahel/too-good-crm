import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  IconButton,
  Separator,
} from '@chakra-ui/react';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '../ui/dialog';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';
import type { Customer } from './CustomerTable';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

const CustomerDetailModal = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailModalProps) => {
  if (!customer) return null;

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
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="xl"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <DialogContent>
        <DialogHeader>
          <HStack justify="space-between" align="start" w="full">
            <Box flex="1">
              <DialogTitle fontSize="2xl" fontWeight="bold" mb={1}>
                Customer Details
              </DialogTitle>
              <Text fontSize="md" color="gray.500">
                Complete information about this customer
              </Text>
            </Box>
            <HStack gap={2}>
              {onEdit && (
                <IconButton
                  aria-label="Edit customer"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(customer)}
                  colorPalette="blue"
                >
                  <FiEdit2 />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  aria-label="Delete customer"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(customer)}
                  colorPalette="red"
                >
                  <FiTrash2 />
                </IconButton>
              )}
            </HStack>
          </HStack>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack align="stretch" gap={5}>
            {/* Header Section with Name and Status */}
            <Box
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="xl"
              p={5}
              color="white"
            >
              <HStack justify="space-between" align="start" mb={3}>
                <VStack align="start" gap={1}>
                  <HStack>
                    <Box
                      w={12}
                      h={12}
                      bg="whiteAlpha.300"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xl"
                      fontWeight="bold"
                      backdropFilter="blur(10px)"
                    >
                      {customer.name.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Heading size="xl" mb={0.5}>
                        {customer.name}
                      </Heading>
                      {customer.company && (
                        <HStack gap={2} opacity={0.9}>
                          <FiBriefcase size={14} />
                          <Text fontSize="md">{customer.company}</Text>
                        </HStack>
                      )}
                    </Box>
                  </HStack>
                </VStack>
                <Badge
                  colorPalette={getStatusColor(customer.status)}
                  size="lg"
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                  fontSize="sm"
                >
                  {customer.status}
                </Badge>
              </HStack>
            </Box>

            {/* Contact Information */}
            <Box>
              <Heading size="lg" mb={3} color="gray.800">
                Contact Information
              </Heading>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <HStack gap={3} mb={2}>
                    <Box
                      p={2}
                      bg="purple.100"
                      borderRadius="md"
                      color="purple.600"
                    >
                      <FiMail size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                      Email Address
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color="gray.900">
                    {customer.email}
                  </Text>
                </Box>

                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <HStack gap={3} mb={2}>
                    <Box
                      p={2}
                      bg="blue.100"
                      borderRadius="md"
                      color="blue.600"
                    >
                      <FiPhone size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                      Phone Number
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color="gray.900">
                    {customer.phone || 'Not provided'}
                  </Text>
                </Box>
              </Grid>
            </Box>

            <Separator />

            {/* Business Information */}
            <Box>
              <Heading size="lg" mb={3} color="gray.800">
                Business Information
              </Heading>
              <VStack align="stretch" gap={3}>
                <HStack
                  justify="space-between"
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <HStack gap={3}>
                    <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                      <FiDollarSign size={20} />
                    </Box>
                    <Text fontSize="md" fontWeight="medium" color="gray.700">
                      Total Value
                    </Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    {formatCurrency(customer.totalValue)}
                  </Text>
                </HStack>

                {customer.company && (
                  <HStack
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <HStack gap={3}>
                      <Box
                        p={2}
                        bg="orange.100"
                        borderRadius="md"
                        color="orange.600"
                      >
                        <FiBriefcase size={20} />
                      </Box>
                      <Text fontSize="md" fontWeight="medium" color="gray.700">
                        Company
                      </Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900">
                      {customer.company}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Separator />

            {/* Activity Information */}
            <Box>
              <Heading size="lg" mb={3} color="gray.800">
                Activity
              </Heading>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
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
                  <Text fontSize="md" fontWeight="medium" color="blue.900">
                    {formatDate(customer.lastContact)}
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
                    <Box
                      p={2}
                      bg="purple.100"
                      borderRadius="md"
                      color="purple.600"
                    >
                      <FiUser size={20} />
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="purple.800">
                      Customer ID
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color="purple.900">
                    #{customer.id}
                  </Text>
                </Box>
              </Grid>
            </Box>

            {/* Additional Notes Section */}
            <Box
              p={4}
              bg="yellow.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="yellow.200"
            >
              <HStack gap={2} mb={2}>
                <FiMapPin color="#D97706" />
                <Text fontSize="sm" fontWeight="semibold" color="yellow.800">
                  Quick Notes
                </Text>
              </HStack>
              <Text fontSize="md" color="yellow.900">
                Customer profile created and maintained in the system. All contact
                information and business details are up to date.
              </Text>
            </Box>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default CustomerDetailModal;

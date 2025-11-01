import {
  Box,
  Badge,
  HStack,
  Text,
  IconButton,
  Flex,
  Grid,
  VStack,
  Heading,
  Stack,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiEye, FiUser } from 'react-icons/fi';
import { Card } from '../common';

// Simple progress bar component
const SimpleProgress = ({ value, colorPalette }: { value: number; colorPalette: string }) => {
  const colors: Record<string, string> = {
    green: '#48BB78',
    orange: '#ED8936',
    red: '#F56565',
  };
  
  return (
    <Box
      h="6px"
      bg="gray.100"
      borderRadius="full"
      overflow="hidden"
      position="relative"
    >
      <Box
        h="100%"
        w={`${value}%`}
        bg={colors[colorPalette] || colors.green}
        borderRadius="full"
        transition="width 0.3s"
      />
    </Box>
  );
};

export interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdDate: string;
}

interface DealsTableProps {
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onView: (deal: Deal) => void;
}

const DealsTable = ({ deals, onEdit, onDelete, onView }: DealsTableProps) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'gray';
      case 'qualified':
        return 'blue';
      case 'proposal':
        return 'purple';
      case 'negotiation':
        return 'orange';
      case 'closed-won':
        return 'green';
      case 'closed-lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStageName = (stage: string) => {
    return stage
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Stack gap={3}>
      {/* Table Header - Desktop Only */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        bg="gray.50"
        borderRadius="lg"
        px={6}
        py={3}
      >
        <Grid
          templateColumns="2fr 1.5fr 1fr 1.5fr 1fr 1.5fr 1fr 80px"
          gap={4}
          alignItems="center"
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Deal Title
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Customer
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" textAlign="right">
            Value
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Stage
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" textAlign="center">
            Probability
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Expected Close
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Owner
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
            Actions
          </Text>
        </Grid>
      </Box>

      {/* Deal Cards/Rows */}
      {deals.map((deal) => (
        <Card
          key={deal.id}
          variant="elevated"
          _hover={{
            shadow: 'md',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          }}
        >
          {/* Desktop Layout */}
          <Box display={{ base: 'none', lg: 'block' }}>
            <Grid
              templateColumns="2fr 1.5fr 1fr 1.5fr 1fr 1.5fr 1fr 80px"
              gap={4}
              alignItems="center"
            >
              {/* Deal Title */}
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                  {deal.title}
                </Text>
              </Box>

              {/* Customer */}
              <HStack gap={1.5}>
                <FiUser size={12} color="#718096" />
                <Text fontSize="sm" color="gray.600">
                  {deal.customer}
                </Text>
              </HStack>

              {/* Value */}
              <Text fontWeight="semibold" fontSize="sm" color="gray.900" textAlign="right">
                {formatCurrency(deal.value)}
              </Text>

              {/* Stage */}
              <Box>
                <Badge
                  colorPalette={getStageColor(deal.stage)}
                  borderRadius="full"
                  px={3}
                  py={1}
                  textTransform="capitalize"
                  fontSize="xs"
                >
                  {getStageName(deal.stage)}
                </Badge>
              </Box>

              {/* Probability */}
              <VStack gap={1} align="stretch">
                <Text fontSize="xs" color="gray.600" textAlign="center">
                  {deal.probability}%
                </Text>
                <SimpleProgress
                  value={deal.probability}
                  colorPalette={deal.probability >= 70 ? 'green' : deal.probability >= 40 ? 'orange' : 'red'}
                />
              </VStack>

              {/* Expected Close */}
              <Text fontSize="sm" color="gray.600">
                {formatDate(deal.expectedCloseDate)}
              </Text>

              {/* Owner */}
              <Text fontSize="sm" color="gray.600">
                {deal.owner}
              </Text>

              {/* Actions */}
              <HStack gap={1} justifyContent="flex-end">
                <IconButton
                  aria-label="View deal"
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(deal)}
                >
                  <FiEye />
                </IconButton>
                <IconButton
                  aria-label="Edit deal"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(deal)}
                >
                  <FiEdit />
                </IconButton>
                <IconButton
                  aria-label="Delete deal"
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => onDelete(deal)}
                >
                  <FiTrash2 />
                </IconButton>
              </HStack>
            </Grid>
          </Box>

          {/* Mobile/Tablet Layout */}
          <Box display={{ base: 'block', lg: 'none' }}>
            <VStack align="stretch" gap={3}>
              {/* Header Row */}
              <Flex justifyContent="space-between" alignItems="start">
                <Box flex="1">
                  <Heading size="sm" mb={1}>
                    {deal.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {deal.customer}
                  </Text>
                </Box>
                <Badge
                  colorPalette={getStageColor(deal.stage)}
                  borderRadius="full"
                  px={3}
                  py={1}
                  textTransform="capitalize"
                  fontSize="xs"
                >
                  {getStageName(deal.stage)}
                </Badge>
              </Flex>

              {/* Value & Probability */}
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    Deal Value
                  </Text>
                  <Text fontWeight="semibold" fontSize="md" color="gray.900">
                    {formatCurrency(deal.value)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    Probability
                  </Text>
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      {deal.probability}%
                    </Text>
                    <SimpleProgress
                      value={deal.probability}
                      colorPalette={deal.probability >= 70 ? 'green' : deal.probability >= 40 ? 'orange' : 'red'}
                    />
                  </VStack>
                </Box>
              </Grid>

              {/* Details Row */}
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    Expected Close
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(deal.expectedCloseDate)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    Owner
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {deal.owner}
                  </Text>
                </Box>
              </Grid>

              {/* Actions Row */}
              <Flex gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
                <IconButton
                  aria-label="View deal"
                  size="sm"
                  variant="outline"
                  flex="1"
                  onClick={() => onView(deal)}
                >
                  <FiEye />
                  <Text ml={2} fontSize="sm">View</Text>
                </IconButton>
                <IconButton
                  aria-label="Edit deal"
                  size="sm"
                  variant="outline"
                  flex="1"
                  onClick={() => onEdit(deal)}
                >
                  <FiEdit />
                  <Text ml={2} fontSize="sm">Edit</Text>
                </IconButton>
                <IconButton
                  aria-label="Delete deal"
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => onDelete(deal)}
                >
                  <FiTrash2 />
                </IconButton>
              </Flex>
            </VStack>
          </Box>
        </Card>
      ))}
    </Stack>
  );
};

export default DealsTable;

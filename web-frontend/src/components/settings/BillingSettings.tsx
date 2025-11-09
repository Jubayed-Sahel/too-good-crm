import { Box, Button, VStack, HStack, Text, Badge, Grid } from '@chakra-ui/react';
import { Card } from '../common';
import { FiCreditCard, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { toaster } from '../ui/toaster';

const BillingSettings = () => {
  const handleUpgrade = () => {
    toaster.create({
      title: 'Upgrade Plan',
      description: 'Plan upgrade functionality will be available soon.',
      type: 'info',
      duration: 3000,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toaster.create({
      title: 'Download Invoice',
      description: `Invoice ${invoiceId} download functionality will be available soon.`,
      type: 'info',
      duration: 3000,
    });
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Current Plan */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Current Plan
            </Text>
            <Badge colorPalette="blue" borderRadius="full" px={3} py={1}>
              Professional
            </Badge>
          </HStack>

          <Box p={4} bg="blue.50" borderRadius="md" borderWidth="2px" borderColor="blue.200">
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                    $79.99
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    per month
                  </Text>
                </Box>
                <Button colorPalette="blue" size="sm" onClick={handleUpgrade}>
                  Upgrade Plan
                </Button>
              </HStack>

              <VStack align="start" gap={2} pt={2}>
                <HStack gap={2}>
                  <FiCheckCircle size={16} color="#38A169" />
                  <Text fontSize="sm" color="gray.700">Up to 20 team members</Text>
                </HStack>
                <HStack gap={2}>
                  <FiCheckCircle size={16} color="#38A169" />
                  <Text fontSize="sm" color="gray.700">10,000 contacts</Text>
                </HStack>
                <HStack gap={2}>
                  <FiCheckCircle size={16} color="#38A169" />
                  <Text fontSize="sm" color="gray.700">1,000 deals</Text>
                </HStack>
                <HStack gap={2}>
                  <FiCheckCircle size={16} color="#38A169" />
                  <Text fontSize="sm" color="gray.700">Advanced reports & analytics</Text>
                </HStack>
                <HStack gap={2}>
                  <FiCheckCircle size={16} color="#38A169" />
                  <Text fontSize="sm" color="gray.700">API access</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          <HStack justify="space-between" pt={2}>
            <Text fontSize="sm" color="gray.600">
              Next billing date: <Text as="span" fontWeight="semibold">December 1, 2025</Text>
            </Text>
          </HStack>
        </VStack>
      </Card>

      {/* Payment Method */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Payment Method
            </Text>
            <Button size="sm" variant="outline">
              Update
            </Button>
          </HStack>

          <HStack gap={3} p={4} bg="gray.50" borderRadius="md">
            <Box
              w="12"
              h="8"
              bg="gray.700"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiCreditCard size={20} color="white" />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="medium" color="gray.900">
                Visa ending in 4242
              </Text>
              <Text fontSize="xs" color="gray.500">
                Expires 12/2026
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>

      {/* Billing History */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Billing History
          </Text>

          {/* Desktop View */}
          <Box display={{ base: 'none', md: 'block' }}>
            <VStack align="stretch" gap={0}>
              {/* Header */}
              <Grid
                templateColumns="2fr 1fr 1fr 1fr 100px"
                gap={4}
                p={3}
                bg="gray.50"
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
                color="gray.600"
                textTransform="uppercase"
              >
                <Text>Invoice</Text>
                <Text>Date</Text>
                <Text>Amount</Text>
                <Text>Status</Text>
                <Text>Action</Text>
              </Grid>

              {/* Invoices */}
              {[
                { id: 'INV-2025-11', date: 'Nov 1, 2025', amount: '$79.99', status: 'Paid' },
                { id: 'INV-2025-10', date: 'Oct 1, 2025', amount: '$79.99', status: 'Paid' },
                { id: 'INV-2025-09', date: 'Sep 1, 2025', amount: '$79.99', status: 'Paid' },
                { id: 'INV-2025-08', date: 'Aug 1, 2025', amount: '$79.99', status: 'Paid' },
              ].map((invoice) => (
                <Grid
                  key={invoice.id}
                  templateColumns="2fr 1fr 1fr 1fr 100px"
                  gap={4}
                  p={3}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  alignItems="center"
                  _hover={{ bg: 'gray.50' }}
                >
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {invoice.id}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {invoice.date}
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                    {invoice.amount}
                  </Text>
                  <Badge
                    colorPalette="green"
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="xs"
                    w="fit-content"
                  >
                    {invoice.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <FiDownload />
                  </Button>
                </Grid>
              ))}
            </VStack>
          </Box>

          {/* Mobile View */}
          <VStack align="stretch" gap={3} display={{ base: 'flex', md: 'none' }}>
            {[
              { id: 'INV-2025-11', date: 'Nov 1, 2025', amount: '$79.99', status: 'Paid' },
              { id: 'INV-2025-10', date: 'Oct 1, 2025', amount: '$79.99', status: 'Paid' },
              { id: 'INV-2025-09', date: 'Sep 1, 2025', amount: '$79.99', status: 'Paid' },
              { id: 'INV-2025-08', date: 'Aug 1, 2025', amount: '$79.99', status: 'Paid' },
            ].map((invoice) => (
              <Card key={invoice.id} p={4} bg="gray.50">
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {invoice.id}
                    </Text>
                    <Badge
                      colorPalette="green"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                    >
                      {invoice.status}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      {invoice.date}
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {invoice.amount}
                    </Text>
                  </HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    w="full"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <FiDownload />
                    <Box ml={2}>Download</Box>
                  </Button>
                </VStack>
              </Card>
            ))}
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default BillingSettings;

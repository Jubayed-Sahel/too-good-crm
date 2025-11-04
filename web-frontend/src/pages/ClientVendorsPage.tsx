import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, SimpleGrid, HStack, Badge, Button } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/common';
import { VendorContactDialog } from '../components/common/VendorContactDialog';
import { FiMail, FiPhone, FiExternalLink, FiPackage } from 'react-icons/fi';

const ClientVendorsPage = () => {
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const handleViewOrders = (vendorName: string) => {
    // Navigate to orders page with vendor filter
    navigate('/client/orders', { state: { vendorFilter: vendorName } });
  };

  const handleContact = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsContactDialogOpen(true);
  };

  // Mock vendor data
  const vendors = [
    {
      id: 1,
      name: 'Tech Solutions Inc',
      category: 'Software Development',
      description: 'Full-stack development and cloud solutions',
      status: 'Active',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      totalOrders: 12,
      totalSpent: '$8,500',
      lastOrder: '2 days ago',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Marketing Pro Agency',
      category: 'Digital Marketing',
      description: 'SEO, content marketing, and social media management',
      status: 'Active',
      email: 'hello@marketingpro.com',
      phone: '+1 (555) 234-5678',
      totalOrders: 8,
      totalSpent: '$5,200',
      lastOrder: '1 week ago',
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Design Studio Co',
      category: 'Graphic Design',
      description: 'Branding, UI/UX design, and visual content',
      status: 'Active',
      email: 'info@designstudio.com',
      phone: '+1 (555) 345-6789',
      totalOrders: 15,
      totalSpent: '$6,750',
      lastOrder: '3 days ago',
      rating: 5.0,
    },
    {
      id: 4,
      name: 'Cloud Services Ltd',
      category: 'Cloud Infrastructure',
      description: 'AWS, Azure, and cloud architecture consulting',
      status: 'Active',
      email: 'support@cloudservices.com',
      phone: '+1 (555) 456-7890',
      totalOrders: 5,
      totalSpent: '$12,000',
      lastOrder: '5 days ago',
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Content Creators Hub',
      category: 'Content Creation',
      description: 'Video production, photography, and copywriting',
      status: 'Active',
      email: 'create@contenthub.com',
      phone: '+1 (555) 567-8901',
      totalOrders: 10,
      totalSpent: '$4,800',
      lastOrder: '1 week ago',
      rating: 4.6,
    },
  ];

  return (
    <DashboardLayout title="My Vendors">
      <VStack align="stretch" gap={6}>
        {/* Page Header */}
        <Box>
          <Heading size="2xl" color="gray.900" mb={2}>
            My Vendors
          </Heading>
          <Text fontSize="md" color="gray.600">
            Manage your relationships with {vendors.length} active vendors
          </Text>
        </Box>

        {/* Vendors Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <VStack align="stretch" gap={4}>
                {/* Header */}
                <HStack justify="space-between" align="start">
                  <Box flex={1}>
                    <Heading size="lg" color="gray.900" mb={1}>
                      {vendor.name}
                    </Heading>
                    <Badge
                      colorPalette="blue"
                      size="sm"
                      textTransform="capitalize"
                    >
                      {vendor.category}
                    </Badge>
                  </Box>
                  <Badge
                    colorPalette="green"
                    size="lg"
                    textTransform="capitalize"
                  >
                    {vendor.status}
                  </Badge>
                </HStack>

                {/* Description */}
                <Text fontSize="sm" color="gray.600">
                  {vendor.description}
                </Text>

                {/* Stats */}
                <SimpleGrid columns={3} gap={3}>
                  <Box textAlign="center" p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xl" fontWeight="bold" color="gray.900">
                      {vendor.totalOrders}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Orders
                    </Text>
                  </Box>
                  <Box textAlign="center" p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {vendor.totalSpent}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Total Spent
                    </Text>
                  </Box>
                  <Box textAlign="center" p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xl" fontWeight="bold" color="orange.600">
                      {vendor.rating}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Rating
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Contact Info */}
                <VStack align="stretch" gap={2}>
                  <HStack gap={2}>
                    <FiMail size={16} color="#667eea" />
                    <Text fontSize="sm" color="gray.700">
                      {vendor.email}
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <FiPhone size={16} color="#667eea" />
                    <Text fontSize="sm" color="gray.700">
                      {vendor.phone}
                    </Text>
                  </HStack>
                </VStack>

                {/* Last Order */}
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="xs" color="blue.700" fontWeight="semibold" mb={1}>
                    LAST ORDER
                  </Text>
                  <Text fontSize="sm" color="blue.900" fontWeight="medium">
                    {vendor.lastOrder}
                  </Text>
                </Box>

                {/* Actions */}
                <HStack gap={2}>
                  <Button
                    colorPalette="blue"
                    flex={1}
                    size="sm"
                    onClick={() => handleViewOrders(vendor.name)}
                  >
                    <HStack gap={2}>
                      <FiPackage size={16} />
                      <Text>View Orders</Text>
                    </HStack>
                  </Button>
                  <Button
                    colorPalette="purple"
                    variant="outline"
                    flex={1}
                    size="sm"
                    onClick={() => handleContact(vendor)}
                  >
                    <HStack gap={2}>
                      <FiExternalLink size={16} />
                      <Text>Contact</Text>
                    </HStack>
                  </Button>
                </HStack>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Contact Dialog */}
        {selectedVendor && (
          <VendorContactDialog
            isOpen={isContactDialogOpen}
            onClose={() => setIsContactDialogOpen(false)}
            vendor={selectedVendor}
          />
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default ClientVendorsPage;

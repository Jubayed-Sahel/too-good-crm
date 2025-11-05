import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { VendorContactDialog } from '../components/common/VendorContactDialog';
import {
  VendorStats,
  VendorFilters,
  VendorTable,
  type Vendor,
} from '../components/client-vendors';

const ClientVendorsPage = () => {
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading] = useState(false);

  const handleViewOrders = (vendorName: string) => {
    // Navigate to orders page with vendor filter
    navigate('/client/orders', { state: { vendorFilter: vendorName } });
  };

  const handleContact = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsContactDialogOpen(true);
  };

  // Mock vendor data
  const vendors: Vendor[] = [
    {
      id: 1,
      name: 'Tech Solutions Inc',
      category: 'Software Development',
      description: 'Full-stack development and cloud solutions',
      status: 'Active',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      totalOrders: 12,
      totalSpent: 8500,
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
      totalSpent: 5200,
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
      totalSpent: 6750,
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
      totalSpent: 12000,
      lastOrder: '5 days ago',
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Content Creators Hub',
      category: 'Content Creation',
      description: 'Video production, photography, and copywriting',
      status: 'Inactive',
      email: 'create@contenthub.com',
      phone: '+1 (555) 567-8901',
      totalOrders: 10,
      totalSpent: 4800,
      lastOrder: '2 months ago',
      rating: 4.6,
    },
    {
      id: 6,
      name: 'Data Analytics Pro',
      category: 'Data Science',
      description: 'Business intelligence and data visualization',
      status: 'Active',
      email: 'data@analyticspro.com',
      phone: '+1 (555) 678-9012',
      totalOrders: 7,
      totalSpent: 9200,
      lastOrder: '1 week ago',
      rating: 4.9,
    },
  ];

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(vendors.map(v => v.category)));
  }, []);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || vendor.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [vendors, searchQuery, categoryFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'Active').length,
    totalOrders: vendors.reduce((sum, v) => sum + v.totalOrders, 0),
    totalSpent: vendors.reduce((sum, v) => sum + v.totalSpent, 0),
  }), [vendors]);

  return (
    <DashboardLayout title="My Vendors">
      <VStack gap={5} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="xl" mb={2}>
            My Vendors
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage your vendor relationships and view order history
          </Text>
        </Box>

        {/* Stats Cards */}
        <VendorStats {...stats} />

        {/* Filters */}
        <VendorFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categories={categories}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : (
          <>
            {/* Vendor Table */}
            <VendorTable
              vendors={filteredVendors}
              onContact={handleContact}
              onViewOrders={handleViewOrders}
            />

            {/* Empty State */}
            {filteredVendors.length === 0 && (
              <Box
                textAlign="center"
                py={12}
                px={6}
                bg="gray.50"
                borderRadius="lg"
              >
                <Heading size="lg" color="gray.600" mb={2}>
                  No vendors found
                </Heading>
                <Text color="gray.500" fontSize="md">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first vendor'}
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>

      {/* Contact Dialog */}
      {selectedVendor && (
        <VendorContactDialog
          isOpen={isContactDialogOpen}
          onClose={() => setIsContactDialogOpen(false)}
          vendor={selectedVendor}
        />
      )}
    </DashboardLayout>
  );
};

export default ClientVendorsPage;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { VendorContactDialog } from '../../components/common/VendorContactDialog';
import {
  VendorStats,
  VendorFilters,
  VendorTable,
  type Vendor,
} from '../../components/client-vendors';
import { useVendors } from '@/hooks';
import type { VendorFilters as VendorFiltersType } from '@/types';
// import { initiateCall } from '@/components/jitsi/JitsiCallManager';
import { toaster } from '@/components/ui/toaster';

const ClientVendorsPage = () => {
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Build API filters (note: backend vendor doesn't have category)
  const apiFilters: VendorFiltersType = useMemo(() => {
    const filters: VendorFiltersType = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== 'all') filters.status = statusFilter as any;
    return filters;
  }, [searchQuery, statusFilter]);

  // Fetch data from backend
  const { data: vendorsData, isLoading, error } = useVendors(apiFilters);
  const vendors = vendorsData?.results || [];

  // Get unique categories for filter - use placeholder since backend doesn't have category
  const categories = useMemo(() => {
    return ['Software Development', 'Digital Marketing', 'Graphic Design', 'Cloud Infrastructure', 'Content Creation', 'Data Science'];
  }, []);

  // Map backend vendors to component format
  const mappedVendors: Vendor[] = useMemo(() => {
    let filtered = vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: 'General', // Backend doesn't have category field
      description: '', // Backend vendor model doesn't have description in list
      status: vendor.status === 'active' ? 'Active' : 'Inactive',
      email: vendor.email || '',
      phone: vendor.phone || '',
      totalOrders: 0, // Would need to be calculated from orders
      totalSpent: 0, // Would need to be calculated from orders
      lastOrder: 'N/A',
      rating: 0,
      user_id: vendor.user_id || null, // For Jitsi video calls
    }));
    
    // Apply frontend category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(v => v.category === categoryFilter);
    }
    
    return filtered;
  }, [vendors, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalVendors: mappedVendors.length,
    activeVendors: mappedVendors.filter(v => v.status === 'Active').length,
    totalOrders: mappedVendors.reduce((sum, v) => sum + v.totalOrders, 0),
    totalSpent: mappedVendors.reduce((sum, v) => sum + v.totalSpent, 0),
  }), [mappedVendors]);

  const handleViewOrders = (vendorName: string) => {
    // Navigate to orders page with vendor filter
    navigate('/client/orders', { state: { vendorFilter: vendorName } });
  };

  const handleContact = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsContactDialogOpen(true);
  };

  const handleCall = async (vendor: Vendor) => {
    // if (!vendor.user_id) {
    //   toaster.create({
    //     title: 'Cannot initiate call',
    //     description: 'This vendor does not have a user account linked.',
    //     type: 'error',
    //     duration: 3000,
    //   });
    //   return;
    // }

    // try {
    //   const callData = await initiateCall(vendor.user_id, vendor.name, 'audio');
    //   
    //   toaster.create({
    //     title: 'Call initiated',
    //     description: `Connecting to ${vendor.name}...`,
    //     type: 'success',
    //     duration: 3000,
    //   });

    //   // Open Jitsi meeting in new window
    //   window.open(callData.jitsi_url, '_blank', 'width=1200,height=800');
    // } catch (error) {
    //   console.error('Failed to initiate call:', error);
    //   toaster.create({
    //     title: 'Call failed',
    //     description: 'Failed to initiate call. Please try again.',
    //     type: 'error',
    //     duration: 3000,
    //   });
    // }

    toaster.create({
      title: 'Feature Disabled',
      description: 'Video/Audio calling is currently disabled.',
      type: 'info',
    });
  };

  // Error state
  if (error) {
    return (
      <DashboardLayout title="My Vendors">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load vendors
          </Heading>
          <Text color="gray.500">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="My Vendors">
        <Box display="flex" justifyContent="center" py={12}>
          <Spinner size="xl" color="blue.500" />
        </Box>
      </DashboardLayout>
    );
  }

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
              vendors={mappedVendors}
              onContact={handleContact}
              onCall={handleCall}
              onViewOrders={handleViewOrders}
            />

            {/* Empty State */}
            {mappedVendors.length === 0 && (
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

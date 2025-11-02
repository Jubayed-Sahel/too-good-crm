import { useState, useMemo } from 'react';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  CustomerTable,
  CustomerFilters,
  CustomerStats,
  CreateCustomerDialog,
} from '../components/customers';
import { useCustomers } from '@/hooks';

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Fetch customers data
  const { customers, isLoading, error } = useCustomers();

  // Filter customers based on search and status
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    return customers.filter((customer) => {
      const matchesSearch =
        searchQuery === '' ||
        customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!customers) {
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        totalRevenue: 0,
      };
    }

    const total = customers.length;
    const active = customers.filter((c) => c.status?.toLowerCase() === 'active').length;
    const inactive = customers.filter((c) => c.status?.toLowerCase() === 'inactive').length;
    const revenue = 0; // Backend doesn't provide this field yet

    return {
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: inactive,
      totalRevenue: revenue,
    };
  }, [customers]);

  // Map API customers to component format
  const mappedCustomers = useMemo(() => {
    if (!customers) return [];
    return filteredCustomers.map((customer) => ({
      id: customer.id.toString(),
      name: customer.full_name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      status: (customer.status?.toLowerCase() || 'active') as 'active' | 'inactive' | 'pending',
      totalValue: 0, // Backend doesn't provide this yet
      lastContact: customer.updated_at || customer.created_at,
    }));
  }, [customers, filteredCustomers]);

  const handleEdit = (customer: any) => {
    console.log('Edit customer:', customer);
    // TODO: Implement edit modal
    alert(`Edit customer: ${customer.name}`);
  };

  const handleDelete = (customer: any) => {
    console.log('Delete customer:', customer);
    // TODO: Implement delete confirmation
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      alert(`Customer ${customer.name} deleted`);
    }
  };

  const handleView = (customer: any) => {
    console.log('View customer:', customer);
    // TODO: Implement view modal/page
    alert(`View customer: ${customer.name}`);
  };

  const handleAddCustomer = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateCustomer = (data: any) => {
    console.log('Create customer:', data);
    // TODO: Implement API call to create customer
    alert(`Customer "${data.fullName}" created successfully!`);
  };

  if (error) {
    return (
      <DashboardLayout title="Customers">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load customers
          </Heading>
          <Text color="gray.500">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customers">
      <VStack gap={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Customers
          </Heading>
          <Text color="gray.600">
            Manage your customer relationships and track interactions
          </Text>
        </Box>

        {/* Stats Cards */}
        <CustomerStats {...stats} />

        {/* Filters */}
        <CustomerFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onAddCustomer={handleAddCustomer}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : (
          <>
            {/* Customer Table */}
            <CustomerTable
              customers={mappedCustomers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />

            {/* Empty State */}
            {mappedCustomers.length === 0 && (
              <Box
                textAlign="center"
                py={12}
                px={6}
                bg="gray.50"
                borderRadius="lg"
              >
                <Heading size="md" color="gray.600" mb={2}>
                  No customers found
                </Heading>
                <Text color="gray.500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first customer'}
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>

      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </DashboardLayout>
  );
};

export default CustomersPage;

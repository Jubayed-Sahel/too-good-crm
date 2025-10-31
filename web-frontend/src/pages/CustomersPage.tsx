import { useState, useMemo } from 'react';
import { Box, Heading, VStack } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  CustomerTable,
  CustomerFilters,
  CustomerStats,
  type Customer,
} from '../components/customers';

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc.',
    status: 'active',
    totalValue: 125000,
    lastContact: '2024-10-28',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@innovate.io',
    phone: '+1 (555) 234-5678',
    company: 'Innovate Solutions',
    status: 'active',
    totalValue: 89500,
    lastContact: '2024-10-30',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@globalventures.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Ventures Ltd',
    status: 'pending',
    totalValue: 45000,
    lastContact: '2024-10-25',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'e.davis@startuplab.co',
    phone: '+1 (555) 456-7890',
    company: 'StartupLab',
    status: 'active',
    totalValue: 175000,
    lastContact: '2024-10-29',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'r.wilson@mediaco.net',
    phone: '+1 (555) 567-8901',
    company: 'MediaCo Networks',
    status: 'inactive',
    totalValue: 32000,
    lastContact: '2024-09-15',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'landerson@financegroup.com',
    phone: '+1 (555) 678-9012',
    company: 'Finance Group LLC',
    status: 'active',
    totalValue: 210000,
    lastContact: '2024-10-31',
  },
  {
    id: '7',
    name: 'David Martinez',
    email: 'dmartinez@retailpros.com',
    phone: '+1 (555) 789-0123',
    company: 'Retail Pros',
    status: 'pending',
    totalValue: 58000,
    lastContact: '2024-10-27',
  },
  {
    id: '8',
    name: 'Jennifer Lee',
    email: 'jlee@healthtech.io',
    phone: '+1 (555) 890-1234',
    company: 'HealthTech Solutions',
    status: 'active',
    totalValue: 142000,
    lastContact: '2024-10-30',
  },
];

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter customers based on search and status
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter((customer) => {
      const matchesSearch =
        searchQuery === '' ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockCustomers.length;
    const active = mockCustomers.filter((c) => c.status === 'active').length;
    const inactive = mockCustomers.filter((c) => c.status === 'inactive').length;
    const revenue = mockCustomers.reduce((sum, c) => sum + c.totalValue, 0);

    return {
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: inactive,
      totalRevenue: revenue,
    };
  }, []);

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer);
    // TODO: Implement edit modal
    alert(`Edit customer: ${customer.name}`);
  };

  const handleDelete = (customer: Customer) => {
    console.log('Delete customer:', customer);
    // TODO: Implement delete confirmation
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      alert(`Customer ${customer.name} deleted`);
    }
  };

  const handleView = (customer: Customer) => {
    console.log('View customer:', customer);
    // TODO: Implement view modal/page
    alert(`View customer: ${customer.name}`);
  };

  const handleAddCustomer = () => {
    console.log('Add new customer');
    // TODO: Implement add customer modal
    alert('Add new customer form coming soon!');
  };

  return (
    <DashboardLayout title="Customers">
      <VStack gap={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size={{ base: 'lg', md: 'xl' }} mb={2}>
            Customers
          </Heading>
          <Box fontSize="sm" color="gray.600">
            Manage your customer relationships and track interactions
          </Box>
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

        {/* Customer Table */}
        <CustomerTable
          customers={filteredCustomers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
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
            <Box fontSize="sm" color="gray.500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first customer'}
            </Box>
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default CustomersPage;

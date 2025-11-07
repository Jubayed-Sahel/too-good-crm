import { useState, useMemo, useEffect } from 'react';
import { Box, Input, VStack, Text, Spinner } from '@chakra-ui/react';
import { useCustomers } from '@/hooks';
import type { Customer } from '@/types';

interface CustomerAutocompleteProps {
  value?: number; // Selected customer ID
  onChange: (customerId: number, customerName: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const CustomerAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search and select customer...',
  required = false,
}: CustomerAutocompleteProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch customers with search filter
  const { customers, isLoading } = useCustomers({ search: searchQuery });

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers.slice(0, 10); // Show first 10 when no search
    return customers.slice(0, 10); // Backend already filters, just limit results
  }, [customers, searchQuery]);

  // Update display name when value changes externally
  useEffect(() => {
    if (value && customers.length > 0) {
      const customer = customers.find((c: Customer) => c.id === value);
      if (customer) {
        setSelectedCustomer(customer);
        setSearchQuery(customer.full_name);
      }
    }
  }, [value, customers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // Clear selection if user modifies the input
    if (selectedCustomer && query !== selectedCustomer.full_name) {
      setSelectedCustomer(null);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.full_name);
    setIsOpen(false);
    onChange(customer.id, customer.full_name);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Box position="relative" width="100%">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && (searchQuery || customers.length > 0) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
          zIndex={1000}
        >
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Spinner size="sm" />
            </Box>
          ) : filteredCustomers.length > 0 ? (
            <VStack gap={0} align="stretch">
              {filteredCustomers.map((customer: Customer) => (
                <Box
                  key={customer.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  bg={selectedCustomer?.id === customer.id ? 'purple.50' : 'white'}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSelectCustomer(customer);
                  }}
                >
                  <Text fontWeight="medium" fontSize="sm">
                    {customer.full_name}
                  </Text>
                  {customer.email && (
                    <Text fontSize="xs" color="gray.600">
                      {customer.email}
                    </Text>
                  )}
                  {customer.company && (
                    <Text fontSize="xs" color="gray.500">
                      {customer.company}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          ) : (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                {searchQuery ? 'No customers found' : 'Start typing to search customers'}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomerAutocomplete;

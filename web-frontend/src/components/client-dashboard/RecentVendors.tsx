import { Box, VStack, HStack, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export interface VendorItem {
  id: number;
  name: string;
  category: string;
  status: string;
  lastOrder: string;
}

interface RecentVendorsProps {
  vendors: VendorItem[];
}

const RecentVendors = ({ vendors }: RecentVendorsProps) => {
  const navigate = useNavigate();

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderColor="gray.200"
    >
      <VStack align="stretch" gap={4}>
        <Heading size="md" color="gray.900">
          Your Vendors
        </Heading>
        <VStack align="stretch" gap={3}>
          {vendors.map((vendor) => (
            <Box
              key={vendor.id}
              p={4}
              bg="gray.50"
              borderRadius="lg"
              _hover={{ bg: 'gray.100', cursor: 'pointer' }}
              transition="all 0.2s"
              onClick={() => navigate('/client/vendors')}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  {vendor.name}
                </Text>
                <Box
                  px={2}
                  py={1}
                  bg="green.100"
                  color="green.700"
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="medium"
                >
                  {vendor.status}
                </Box>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">
                  {vendor.category}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Last order: {vendor.lastOrder}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default RecentVendors;

import { SimpleGrid, Text, VStack, HStack, Box } from '@chakra-ui/react';
import InfoCard from './InfoCard';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';

const InfoCardsGrid = () => {
  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
      <InfoCard
        title="Authentication Successful"
        icon={<FiCheckCircle />}
        iconBg="green.100"
        iconColor="green.600"
      >
        <VStack align="stretch" gap={4}>
          <Text fontSize="md">
            Your login was successful and you're now authenticated. This is a mock dashboard to demonstrate the authentication flow.
          </Text>
          <Box
            bg="green.50"
            border="1px"
            borderColor="green.200"
            borderRadius="lg"
            p={3}
          >
            <Text fontSize="sm" color="green.800">
              <strong>Next Steps:</strong> Connect this to your Django backend to enable real authentication and data management.
            </Text>
          </Box>
        </VStack>
      </InfoCard>

      <InfoCard
        title="Getting Started"
        icon={<FiInfo />}
        iconBg="blue.100"
        iconColor="blue.600"
      >
        <VStack align="stretch" gap={2}>
          <HStack align="center">
            <Text color="purple.600" fontSize="lg">→</Text>
            <Text fontSize="md">Set up your organization profile</Text>
          </HStack>
          <HStack align="center">
            <Text color="purple.600" fontSize="lg">→</Text>
            <Text fontSize="md">Invite team members to collaborate</Text>
          </HStack>
          <HStack align="center">
            <Text color="purple.600" fontSize="lg">→</Text>
            <Text fontSize="md">Import your existing customer data</Text>
          </HStack>
          <HStack align="center">
            <Text color="purple.600" fontSize="lg">→</Text>
            <Text fontSize="md">Create your first sales pipeline</Text>
          </HStack>
        </VStack>
      </InfoCard>
    </SimpleGrid>
  );
};

export default InfoCardsGrid;

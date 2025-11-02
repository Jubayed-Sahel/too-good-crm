import { VStack, Spinner, Box, Text, Heading, Container } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  WelcomeBanner,
  StatsGrid,
  InfoCardsGrid,
} from '../components/dashboard';
import { useDashboardStats } from '@/hooks';

const DashboardPage = () => {
  const { stats, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <Container maxW="md">
          <Box 
            textAlign="center" 
            py={20}
            px={6}
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="red.200"
          >
            <Box
              w={16}
              h={16}
              bg="red.50"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Text fontSize="3xl">⚠️</Text>
            </Box>
            <Heading size="md" color="red.600" mb={3}>
              Failed to load dashboard data
            </Heading>
            <Text color="gray.600" fontSize="sm" mb={6}>
              {error.message || 'Please try again later or contact support if the problem persists'}
            </Text>
            <Box
              as="button"
              px={6}
              py={2}
              bg="red.500"
              color="white"
              borderRadius="lg"
              fontWeight="medium"
              fontSize="sm"
              _hover={{ bg: 'red.600' }}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Box>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <VStack gap={6} align="stretch">
        <WelcomeBanner />
        {isLoading ? (
          <Box 
            display="flex" 
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={20}
            gap={4}
          >
            <Spinner 
              size="xl" 
              color="purple.500"
            />
            <Text color="gray.600" fontSize="sm">
              Loading your dashboard...
            </Text>
          </Box>
        ) : (
          <>
            <StatsGrid stats={stats} />
            <InfoCardsGrid />
          </>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default DashboardPage;

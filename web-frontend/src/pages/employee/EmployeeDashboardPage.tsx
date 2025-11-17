import { VStack, Box, Text, Heading, Container, SimpleGrid } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  StatsGrid,
  InfoCardsGrid,
} from '../../components/dashboard';
import { DashboardWidgetsGrid } from '../../components/dashboard/DashboardWidgets';
import { EmployeeWelcomeBanner } from '../../components/dashboard/EmployeeWelcomeBanner';
import { MyWorkSection } from '../../components/dashboard/MyWorkSection';
import { StandardButton } from '../../components/common';
import { useDashboardStats } from '@/hooks';
import { usePermissions } from '@/contexts/PermissionContext';

const EmployeeDashboardPage = () => {
  const { stats, isLoading, error } = useDashboardStats();
  const { canAccess } = usePermissions();

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
            <StandardButton
              variant="danger"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </StandardButton>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  // Check if employee has any relevant permissions
  const hasAnyResourceAccess = canAccess('deals') || canAccess('leads') || canAccess('customers') || canAccess('activities') || canAccess('analytics');

  return (
    <DashboardLayout title="Dashboard">
      <VStack gap={5} align="stretch">
        <EmployeeWelcomeBanner />
        
        {/* Stats Grid - Component handles its own permission checks */}
        <StatsGrid stats={stats || undefined} isLoading={isLoading} />

        {/* Main Content Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
          {/* My Work Section */}
          <MyWorkSection />
          
          {/* Quick Access Cards - Component handles its own permission checks */}
          {hasAnyResourceAccess ? (
            <InfoCardsGrid />
          ) : (
            <Box p={6} bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
              <VStack gap={3} align="center" py={8}>
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  Quick Access
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Your quick access options will appear here based on your assigned role permissions.
                </Text>
                <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                  Contact your administrator to assign role permissions.
                </Text>
              </VStack>
            </Box>
          )}
        </SimpleGrid>

        {/* Permission-Aware Dashboard Widgets */}
        {hasAnyResourceAccess && (
          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Overview
            </Heading>
            <DashboardWidgetsGrid />
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeDashboardPage;

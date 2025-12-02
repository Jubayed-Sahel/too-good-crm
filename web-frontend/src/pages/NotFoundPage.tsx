import { useNavigate, useLocation } from 'react-router-dom';
import { Box, VStack, HStack, Heading, Text, Button } from '@chakra-ui/react';
import { FiHome, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { StandardButton } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { activeProfile } = useProfile();

  const handleGoHome = () => {
    if (isAuthenticated && !isLoading) {
      // Redirect based on profile type
      if (activeProfile?.profile_type === 'customer') {
        navigate('/client/dashboard');
      } else if (activeProfile?.profile_type === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  const content = (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="calc(100vh - 200px)"
      py={12}
    >
      <VStack gap={6} textAlign="center" maxW="600px" px={4}>
        {/* 404 Icon/Number */}
        <Box position="relative">
          <Heading
            size="4xl"
            fontWeight="bold"
            color="gray.300"
            fontSize={{ base: '8xl', md: '9xl' }}
            lineHeight="1"
          >
            404
          </Heading>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="purple.500"
          >
            <FiAlertTriangle size={80} />
          </Box>
        </Box>

        {/* Title */}
        <VStack gap={2}>
          <Heading size="xl" color="gray.900" fontWeight="bold">
            Page Not Found
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="500px">
            Oops! The page you're looking for doesn't exist or has been moved.
          </Text>
        </VStack>

        {/* URL Info */}
        <Box
          p={4}
          bg="gray.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          w="full"
        >
          <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>
            Attempted URL:
          </Text>
          <Text
            fontSize="sm"
            color="gray.700"
            fontFamily="mono"
            wordBreak="break-all"
          >
            {location.pathname}
          </Text>
        </Box>

        {/* Action Buttons */}
        <HStack gap={4} flexWrap="wrap" justify="center">
          <StandardButton
            variant="primary"
            onClick={handleGoHome}
            leftIcon={<FiHome />}
          >
            {isAuthenticated && !isLoading ? 'Go to Dashboard' : 'Go to Login'}
          </StandardButton>
          <StandardButton
            variant="outline"
            onClick={handleGoBack}
            leftIcon={<FiArrowLeft />}
          >
            Go Back
          </StandardButton>
        </HStack>

        {/* Helpful Links */}
        {isAuthenticated && !isLoading && (
          <VStack gap={2} mt={4}>
            <Text fontSize="sm" color="gray.500">
              You might be looking for:
            </Text>
            <HStack gap={4} flexWrap="wrap" justify="center">
              <Button
                variant="link"
                colorPalette="blue"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="link"
                colorPalette="blue"
                size="sm"
                onClick={() => navigate('/customers')}
              >
                Customers
              </Button>
              <Button
                variant="link"
                colorPalette="blue"
                size="sm"
                onClick={() => navigate('/sales')}
              >
                Sales
              </Button>
              <Button
                variant="link"
                colorPalette="blue"
                size="sm"
                onClick={() => navigate('/activities')}
              >
                Activities
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );

  // Wrap in DashboardLayout only if authenticated, otherwise use simple layout
  if (isAuthenticated && !isLoading) {
    return <DashboardLayout title="Page Not Found">{content}</DashboardLayout>;
  }

  // Simple layout for unauthenticated users
  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      {content}
    </Box>
  );
};

export default NotFoundPage;


import { Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { AuthLayout, LoginForm } from '../../components/auth';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config/constants';

const LoginPage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box h="100vh" maxH="100vh" overflow="hidden" position="fixed" w="100vw" top={0} left={0}>
        <AuthLayout>
          <Box>Loading...</Box>
        </AuthLayout>
      </Box>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated && user) {
    const primaryProfile = user.primaryProfile || user.profiles?.[0];
    if (primaryProfile?.profile_type === 'customer') {
      return <Navigate to="/client/dashboard" replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <Box h="100vh" maxH="100vh" overflow="hidden" position="fixed" w="100vw" top={0} left={0}>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </Box>
  );
};

export default LoginPage;

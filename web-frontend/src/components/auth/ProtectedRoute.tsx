import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Box, Spinner } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedProfiles?: ('vendor' | 'employee' | 'customer')[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Restricts access based on authentication and optionally user profile type
 */
const ProtectedRoute = ({
  children,
  allowedProfiles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="100vh"
        w="100vw"
      >
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If specific profiles are required, check user's active profile
  if (allowedProfiles && allowedProfiles.length > 0) {
    const primaryProfile = user.primaryProfile || user.profiles?.[0];
    
    if (!primaryProfile) {
      return <Navigate to="/login" replace />;
    }

    // Check if user's profile type is allowed
    const hasAllowedProfile = allowedProfiles.includes(
      primaryProfile.profile_type as any
    );

    if (!hasAllowedProfile) {
      // Redirect based on their actual profile
      const redirectPath = getRedirectPath(primaryProfile.profile_type);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and has required profile (if specified)
  return <>{children}</>;
};

/**
 * Get redirect path based on profile type
 */
function getRedirectPath(profileType: string): string {
  switch (profileType) {
    case 'customer':
      return '/client/dashboard';
    case 'vendor':
    case 'employee':
    default:
      return '/dashboard';
  }
}

export default ProtectedRoute;

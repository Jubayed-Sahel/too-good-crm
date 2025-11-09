import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - BEFORE ANY CONDITIONAL RETURNS
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const hasRedirected = useRef(false);
  const redirectPathRef = useRef<string | null>(null);

  // Handle profile-based redirects in useEffect to prevent render loops
  // This must be called unconditionally, even if we return early below
  useEffect(() => {
    // Only process redirects if user is authenticated and loaded
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    // Reset redirect flag when pathname changes (user navigated)
    if (location.pathname !== redirectPathRef.current) {
      hasRedirected.current = false;
      redirectPathRef.current = null;
    }

    // Skip if already redirected
    if (hasRedirected.current) {
      return;
    }

    if (!allowedProfiles || allowedProfiles.length === 0) {
      return; // No profile restrictions
    }

    const primaryProfile = user.primaryProfile || user.profiles?.[0];
    
    // If user has no profile, allow access (don't redirect to prevent loops)
    if (!primaryProfile) {
      console.warn('User is authenticated but has no profiles');
      return;
    }

    // Check if user's profile type is allowed
    const hasAllowedProfile = allowedProfiles.includes(
      primaryProfile.profile_type as any
    );

    if (!hasAllowedProfile) {
      // Determine redirect path based on profile type
      const redirectPath = getRedirectPath(primaryProfile.profile_type);
      
      // Only redirect if we're not already on the target path
      if (location.pathname !== redirectPath) {
        redirectPathRef.current = redirectPath;
        hasRedirected.current = true;
        // Use setTimeout to ensure redirect happens outside of render cycle
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 0);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedProfiles, location.pathname]);

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

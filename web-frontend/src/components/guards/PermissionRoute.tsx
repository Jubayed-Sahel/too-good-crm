/**
 * PermissionRoute Component
 * Route protection based on permissions
 * Redirects to access denied or fallback route if user lacks permission
 */
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, VStack, Text, Heading, Button } from '@chakra-ui/react';
import { usePermissions } from '@/contexts/PermissionContext';
import type { ReactNode } from 'react';

interface PermissionRouteProps {
  children: ReactNode;
  resource: string;
  action?: string;
  redirectTo?: string;
  fallback?: ReactNode;
  requireAll?: boolean; // If true, requires all permissions in resource array
  resources?: Array<{ resource: string; action?: string }>; // Multiple resource checks
}

/**
 * Permission-based route protection
 * 
 * @example
 * <Route
 *   path="/customers"
 *   element={
 *     <PermissionRoute resource="customer" action="read">
 *       <CustomersPage />
 *     </PermissionRoute>
 *   }
 * />
 * 
 * @example Multiple resources (any)
 * <PermissionRoute 
 *   resources={[
 *     { resource: 'deals', action: 'read' },
 *     { resource: 'leads', action: 'read' }
 *   ]}
 * >
 *   <SalesPage />
 * </PermissionRoute>
 */
export const PermissionRoute = ({
  children,
  resource,
  action = 'read',
  redirectTo = '/dashboard',
  fallback,
  requireAll = false,
  resources,
}: PermissionRouteProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, isVendor, isOwner } = usePermissions();
  const location = useLocation();

  // Show loading state
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

  // Vendors and owners have full access - bypass permission checks
  if (isVendor || isOwner) {
    return <>{children}</>;
  }

  // Check permissions for employees
  let hasAccess = false;

  if (resources && resources.length > 0) {
    // Multiple resource checks
    if (requireAll) {
      const result = hasAllPermissions(resources);
      hasAccess = result.hasPermission;
    } else {
      const result = hasAnyPermission(resources);
      hasAccess = result.hasPermission;
    }
  } else {
    // Single resource check
    const result = hasPermission(resource, action);
    hasAccess = result.hasPermission;
  }

  // If no access, show fallback or redirect
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Store attempted location for redirect after login
    const state = {
      from: location,
      message: `You don't have permission to access this page.`,
    };

    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        p={6}
      >
        <VStack gap={4} maxW="md" textAlign="center">
          <Heading size="lg" color="red.600">
            Access Denied
          </Heading>
          <Text color="gray.600">
            You don't have permission to access this page.
          </Text>
          <Button
            colorPalette="purple"
            onClick={() => window.location.href = redirectTo}
          >
            Go to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
};


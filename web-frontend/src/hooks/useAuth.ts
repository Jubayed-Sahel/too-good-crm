/**
 * Authentication hook
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, roleSelectionService } from '@/services';
import { ROUTES } from '@/config/constants';
import type { User, LoginCredentials, RegisterData } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();

      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handlePostAuth = async (authUser: User) => {
    // No role selection dialog - just navigate to default route based on primary profile
    navigateToDefaultRoute(authUser);
  };

  const navigateToDefaultRoute = (authUser: User) => {
    const primaryProfile = authUser.primaryProfile || authUser.profiles?.[0];
    
    if (!primaryProfile) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    // Navigate based on profile type
    switch (primaryProfile.profile_type) {
      case 'customer':
        navigate('/client/dashboard');
        break;
      case 'vendor':
      case 'employee':
      default:
        navigate(ROUTES.DASHBOARD);
        break;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Navigate directly to dashboard
      await handlePostAuth(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Navigate directly to dashboard
      await handlePostAuth(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate(ROUTES.LOGIN);
    }
  };

  const switchRole = async (profileId: number) => {
    try {
      console.log('🔄 Switching to profile ID:', profileId);
      const response = await roleSelectionService.selectRole(profileId);
      
      console.log('📦 Backend response:', response);
      
      // Process the updated user data to update primaryProfile
      const processedUser = processUserData(response.user);
      
      console.log('✅ Processed user:', {
        primaryProfile: processedUser.primaryProfile,
        profiles: processedUser.profiles?.map(p => ({
          id: p.id,
          type: p.profile_type,
          isPrimary: p.is_primary
        }))
      });
      
      // Update localStorage with processed user
      localStorage.setItem('user', JSON.stringify(processedUser));
      
      // Update state with completely new object reference
      setUser(processedUser);
      
      console.log('🚀 Navigating to default route...');
      
      // Navigate to appropriate dashboard based on new role
      const targetRoute = getTargetRoute(processedUser);
      console.log('📍 Target route:', targetRoute);
      
      // Force page reload to ensure all components re-render with new profile
      window.location.href = targetRoute;
    } catch (error) {
      console.error('❌ Role switch failed:', error);
      throw error;
    }
  };

  const getTargetRoute = (authUser: User): string => {
    const primaryProfile = authUser.primaryProfile || authUser.profiles?.[0];
    
    if (!primaryProfile) {
      return '/dashboard';
    }

    // Return route based on profile type
    switch (primaryProfile.profile_type) {
      case 'customer':
        return '/client/dashboard';
      case 'vendor':
      case 'employee':
      default:
        return '/dashboard';
    }
  };

  // Helper to process user data (same as authService)
  const processUserData = (user: User): User => {
    // Find primary profile or first active profile
    const primaryProfile = user.profiles?.find((p) => p.is_primary && p.status === 'active') 
      || user.profiles?.find((p) => p.status === 'active');
    
    // Add computed properties
    (user as any).primaryProfile = primaryProfile;
    (user as any).primaryOrganizationId = primaryProfile?.organization;
    
    return user;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    switchRole,
  };
};

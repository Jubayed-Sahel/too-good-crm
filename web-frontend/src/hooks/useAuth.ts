/**
 * Authentication hook
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, roleSelectionService } from '@/services';
import { ROUTES } from '@/config/constants';
import type { User, LoginCredentials, RegisterData } from '@/types';

// Global state to prevent multiple simultaneous refresh calls
let initializationPromise: Promise<User | null> | null = null;

// Initialize auth state once globally
const initializeAuthState = (): Promise<User | null> => {
  // If already initializing, return existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Create and store the promise immediately to prevent race conditions
  initializationPromise = (async () => {
    const authenticated = authService.isAuthenticated();
    
    if (authenticated) {
      try {
        if (import.meta.env.DEV) {
          console.log('[useAuth] Refreshing user data from API...');
        }
        const currentUser = await authService.refreshUser();
        if (import.meta.env.DEV) {
          console.log('[useAuth] User data refreshed:', {
            profiles: currentUser.profiles?.length || 0,
            primaryProfile: currentUser.primaryProfile?.profile_type,
          });
        }
        return currentUser;
      } catch (error) {
        // If refresh fails, fall back to localStorage
        console.warn('[useAuth] Failed to refresh user data, using cached data:', error);
        return authService.getCurrentUser();
      } finally {
        // Clear promise after a short delay to allow all instances to read the result
        setTimeout(() => {
          initializationPromise = null;
        }, 100);
      }
    } else {
      initializationPromise = null;
      return null;
    }
  })();

  return initializationPromise;
};

export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Initialize auth state - all instances will share the same promise
    const loadAuthState = async () => {
      try {
        const currentUser = await initializeAuthState();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      } catch (error) {
        // Fallback to localStorage
        const authenticated = authService.isAuthenticated();
        const currentUser = authenticated ? authService.getCurrentUser() : null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const handlePostAuth = async (authUser: User) => {
    // No role selection dialog - just navigate to default route based on primary profile
    navigateToDefaultRoute(authUser);
  };

  const navigateToDefaultRoute = (authUser: User) => {
    const primaryProfile = authUser.primaryProfile || authUser.profiles?.[0];
    
    let targetRoute = ROUTES.DASHBOARD;
    
    if (primaryProfile) {
      // Navigate based on profile type
      switch (primaryProfile.profile_type) {
        case 'customer':
          targetRoute = '/client/dashboard';
          break;
        case 'vendor':
        case 'employee':
        default:
          targetRoute = ROUTES.DASHBOARD;
          break;
      }
    }
    
    // Use hard redirect to ensure auth state is properly set
    // This prevents race conditions with React state updates
    window.location.href = targetRoute;
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

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.refreshUser();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    switchRole,
    refreshUser,
  };
};

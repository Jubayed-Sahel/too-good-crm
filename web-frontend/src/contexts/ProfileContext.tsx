/**
 * User Profile Context
 * Manages the active profile (vendor/employee) and organization context
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/types/auth.types';

export type ProfileType = 'vendor' | 'employee' | 'customer';

export interface ProfileContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  activeProfileType: ProfileType | null;
  activeOrganizationId: number | null;
  isLoading: boolean;
  switchProfile: (profileId: number) => void;
  refreshProfiles: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = () => {
    if (!user || !user.profiles) {
      setProfiles([]);
      setActiveProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use profiles from auth user
      const userProfiles = user.profiles;
      setProfiles(userProfiles);
      
      // PRIORITY 1: Use primary profile from user data (updated after role switch)
      const primaryProfile = user.primaryProfile || userProfiles.find(p => p.is_primary);
      
      if (primaryProfile) {
        setActiveProfile(primaryProfile);
        localStorage.setItem('activeProfileId', primaryProfile.id.toString());
        setIsLoading(false);
        return;
      }
      
      // PRIORITY 2: Fall back to saved profile ID from localStorage
      const savedProfileId = localStorage.getItem('activeProfileId');
      
      if (savedProfileId) {
        const saved = userProfiles.find(p => p.id === parseInt(savedProfileId));
        if (saved) {
          setActiveProfile(saved);
          setIsLoading(false);
          return;
        }
      }
      
      // PRIORITY 3: Default to first profile
      if (userProfiles[0]) {
        setActiveProfile(userProfiles[0]);
        localStorage.setItem('activeProfileId', userProfiles[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      setActiveProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const switchProfile = async (profileId: number) => {
    // Note: This function is kept for compatibility but shouldn't be used directly
    // ProfileSwitcher should use auth.switchRole() instead
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      console.warn('[ProfileContext] switchProfile is deprecated - use auth.switchRole() instead');
      // Update local state for immediate UI feedback
      setActiveProfile(profile);
      localStorage.setItem('activeProfileId', profileId.toString());
    }
  };

  const refreshProfiles = () => {
    fetchProfiles();
  };

  const contextValue: ProfileContextType = {
    profiles,
    activeProfile,
    activeProfileType: activeProfile?.profile_type || null,
    activeOrganizationId: activeProfile?.organization || null,
    isLoading,
    switchProfile,
    refreshProfiles,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};


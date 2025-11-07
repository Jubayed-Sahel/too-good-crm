import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import type { ReactNode } from 'react';

export type AccountMode = 'client' | 'vendor';

interface AccountModeContextType {
  mode: AccountMode;
  setMode: (mode: AccountMode) => void;
  toggleMode: () => void;
  isClientMode: boolean;
  isVendorMode: boolean;
}

const AccountModeContext = createContext<AccountModeContextType | undefined>(undefined);

interface AccountModeProviderProps {
  children: ReactNode;
}

export const AccountModeProvider = ({ children }: AccountModeProviderProps) => {
  const [mode, setMode] = useState<AccountMode>('vendor');
  const { user } = useAuth();

  // Automatically sync mode with active profile
  useEffect(() => {
    if (user && user.primaryProfile) {
      const primaryProfile = user.primaryProfile;
      const newMode = primaryProfile.profile_type === 'customer' ? 'client' : 'vendor';
      
      console.log('🎨 AccountModeContext: Syncing mode with profile', {
        profileType: primaryProfile.profile_type,
        profileId: primaryProfile.id,
        currentMode: mode,
        newMode,
      });
      
      if (mode !== newMode) {
        console.log('🔄 AccountModeContext: Updating mode from', mode, 'to', newMode);
        setMode(newMode);
      }
    }
  }, [user?.id, user?.primaryProfile?.id, user?.primaryProfile?.profile_type]); // Watch primaryProfile.id for changes

  const toggleMode = () => {
    setMode((prev) => (prev === 'client' ? 'vendor' : 'client'));
  };

  const value: AccountModeContextType = {
    mode,
    setMode,
    toggleMode,
    isClientMode: mode === 'client',
    isVendorMode: mode === 'vendor',
  };

  return (
    <AccountModeContext.Provider value={value}>
      {children}
    </AccountModeContext.Provider>
  );
};

export const useAccountMode = () => {
  const context = useContext(AccountModeContext);
  if (context === undefined) {
    throw new Error('useAccountMode must be used within an AccountModeProvider');
  }
  return context;
};

export default AccountModeContext;

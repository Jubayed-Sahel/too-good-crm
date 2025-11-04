import { createContext, useContext, useState } from 'react';
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

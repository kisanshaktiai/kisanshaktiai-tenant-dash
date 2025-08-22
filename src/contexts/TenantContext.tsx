
import React, { createContext, useContext, ReactNode } from 'react';
import { useTenantAuth } from '@/hooks/useTenantAuth';

interface TenantContextValue {
  currentTenant: any;
  userTenants: any[];
  loading: boolean;
  error: string | null;
  isMultiTenant: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantData: () => Promise<void>;
  clearTenantSession: () => void;
  isInitialized: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const tenantAuth = useTenantAuth();
  
  const value: TenantContextValue = {
    currentTenant: tenantAuth.currentTenant,
    userTenants: tenantAuth.userTenants,
    loading: tenantAuth.loading,
    error: null, // Error handling moved to useTenantAuth
    isMultiTenant: tenantAuth.isMultiTenant,
    switchTenant: tenantAuth.switchTenant,
    refreshTenantData: tenantAuth.refreshTenantData,
    clearTenantSession: tenantAuth.clearTenantSession,
    isInitialized: tenantAuth.isInitialized,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

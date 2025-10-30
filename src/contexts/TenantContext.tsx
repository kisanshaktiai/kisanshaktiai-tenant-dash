
import React, { createContext, useContext } from 'react';
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
  initializeOnboarding: (tenantId: string) => Promise<any>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tenantAuth = useTenantAuth();
  
  const initializeOnboarding = async (tenantId: string) => {
    try {
      // Initialize onboarding workflow for the tenant
      console.log('Initializing onboarding for tenant:', tenantId);
      return { success: true, tenantId };
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      throw error;
    }
  };
  
  const value: TenantContextValue = {
    currentTenant: tenantAuth.currentTenant,
    userTenants: tenantAuth.userTenants,
    loading: tenantAuth.loading,
    error: null,
    isMultiTenant: tenantAuth.isMultiTenant,
    switchTenant: tenantAuth.switchTenant,
    refreshTenantData: tenantAuth.refreshTenantData,
    clearTenantSession: tenantAuth.clearTenantSession,
    isInitialized: tenantAuth.isInitialized,
    initializeOnboarding,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

// Legacy support - remove the old context gradually
export const LegacyTenantProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn('LegacyTenantProvider is deprecated. Use TenantProvider instead.');
  return <TenantProvider>{children}</TenantProvider>;
};

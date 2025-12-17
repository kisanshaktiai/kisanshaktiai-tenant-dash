
import React, { createContext, useContext } from 'react';
import { useTenantAuthOptimized } from '@/hooks/useTenantAuthOptimized';

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
  retryFetch: () => Promise<void>;
}

const TenantContextOptimized = createContext<TenantContextValue | undefined>(undefined);

export const useTenantContextOptimized = () => {
  const context = useContext(TenantContextOptimized);
  if (!context) {
    throw new Error('useTenantContextOptimized must be used within a TenantProviderOptimized');
  }
  return context;
};

export const TenantProviderOptimized: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tenantAuth = useTenantAuthOptimized();
  
  const initializeOnboarding = async (tenantId: string) => {
    try {
      return { success: true, tenantId };
    } catch (error) {
      console.error('TenantContextOptimized: Error initializing onboarding:', error);
      throw error;
    }
  };
  
  const retryFetch = async () => {
    await tenantAuth.refreshTenantData();
  };
  
  const value: TenantContextValue = {
    currentTenant: tenantAuth.currentTenant,
    userTenants: tenantAuth.userTenants,
    loading: tenantAuth.loading,
    error: tenantAuth.error || null,
    isMultiTenant: tenantAuth.isMultiTenant,
    switchTenant: tenantAuth.switchTenant,
    refreshTenantData: tenantAuth.refreshTenantData,
    clearTenantSession: tenantAuth.clearTenantSession,
    isInitialized: tenantAuth.isInitialized,
    initializeOnboarding,
    retryFetch,
  };

  return (
    <TenantContextOptimized.Provider value={value}>
      {children}
    </TenantContextOptimized.Provider>
  );
};

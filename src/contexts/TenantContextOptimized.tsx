
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
  
  // Simplified initialization that doesn't trigger tenant data refresh
  const initializeOnboarding = async (tenantId: string) => {
    try {
      console.log('TenantContextOptimized: Simple onboarding initialization for tenant:', tenantId);
      return { success: true, tenantId };
    } catch (error) {
      console.error('TenantContextOptimized: Error initializing onboarding:', error);
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
    <TenantContextOptimized.Provider value={value}>
      {children}
    </TenantContextOptimized.Provider>
  );
};

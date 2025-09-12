import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useTenantAuth } from './useTenantAuth';

/**
 * A stable version of useTenantAuth that prevents unnecessary re-renders
 * by memoizing the tenant data and only updating when actual changes occur
 */
export const useTenantAuthStable = () => {
  const { currentTenant, userTenants, loading, isMultiTenant, switchTenant, refreshTenantData, clearTenantSession } = useTenantAuth();
  
  // Memoize the current tenant to prevent object identity changes
  const stableCurrentTenant = useMemo(() => {
    if (!currentTenant) return null;
    return currentTenant;
  }, [currentTenant?.id]); // Only update when ID changes
  
  // Memoize the user tenants array
  const stableUserTenants = useMemo(() => {
    return userTenants;
  }, [userTenants?.length]); // Only update when array length changes
  
  return {
    currentTenant: stableCurrentTenant,
    userTenants: stableUserTenants,
    loading,
    isMultiTenant,
    switchTenant,
    refreshTenantData,
    clearTenantSession
  };
};
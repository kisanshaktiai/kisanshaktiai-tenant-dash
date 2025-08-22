
import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { setCurrentTenant } from '@/store/slices/tenantSlice';
import { useTenantSession } from '@/hooks/core/useTenantSession';
import { useTenantDataFetch } from '@/hooks/core/useTenantData';
import { useTenantRealtime } from '@/hooks/core/useTenantRealtime';
import { useAppDispatch } from '@/store/hooks';

export const useTenantAuth = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, loading } = useAppSelector((state) => state.tenant);
  const [isInitialized, setIsInitialized] = useState(false);

  const { switchTenant, clearTenantSession } = useTenantSession();
  const { fetchUserTenants } = useTenantDataFetch();

  const refreshTenantData = useCallback(async () => {
    if (!user?.id) {
      console.log('useTenantAuth: No user ID available');
      return;
    }

    try {
      console.log('useTenantAuth: Fetching tenants for user:', user.id);
      const tenants = await fetchUserTenants(user.id);
      
      // Set current tenant if not set and tenants available
      if (!currentTenant && tenants && tenants.length > 0) {
        const storedTenantId = localStorage.getItem('currentTenantId');
        let tenantToSet = tenants[0]; // default to first tenant
        
        // Try to find stored tenant or primary tenant
        if (storedTenantId) {
          const storedTenant = tenants.find(ut => ut.tenant && 'id' in ut.tenant && ut.tenant.id === storedTenantId);
          if (storedTenant) {
            tenantToSet = storedTenant;
          }
        } else {
          const primaryTenant = tenants.find(ut => ut.is_primary);
          if (primaryTenant) {
            tenantToSet = primaryTenant;
          }
        }
        
        if (tenantToSet?.tenant && 'id' in tenantToSet.tenant) {
          console.log('useTenantAuth: Setting current tenant:', tenantToSet.tenant);
          dispatch(setCurrentTenant(tenantToSet.tenant));
          localStorage.setItem('currentTenantId', tenantToSet.tenant.id);
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('useTenantAuth: Error refreshing tenant data:', error);
      setIsInitialized(true); // Still mark as initialized to prevent endless loading
    }
  }, [user?.id, fetchUserTenants, currentTenant, dispatch]);

  // Initialize tenant data when user logs in
  useEffect(() => {
    if (!user) {
      console.log('useTenantAuth: No user, clearing tenant session');
      clearTenantSession();
      setIsInitialized(false);
      return;
    }

    if (!isInitialized && !loading) {
      // Try to restore current tenant from localStorage first
      const storedTenantId = localStorage.getItem('currentTenantId');
      if (storedTenantId && currentTenant?.id === storedTenantId) {
        console.log('useTenantAuth: Current tenant already matches stored ID');
        setIsInitialized(true);
        return;
      }

      console.log('useTenantAuth: Initializing tenant data for user:', user.id);
      refreshTenantData();
    }
  }, [user, isInitialized, loading, refreshTenantData, clearTenantSession, currentTenant]);

  // Set up real-time subscriptions
  useTenantRealtime(user?.id, currentTenant?.id, refreshTenantData);

  const handleSwitchTenant = useCallback(async (tenantId: string) => {
    console.log('useTenantAuth: Switching tenant to:', tenantId);
    await switchTenant(tenantId, userTenants);
  }, [switchTenant, userTenants]);

  return {
    currentTenant,
    userTenants,
    loading: loading || !isInitialized,
    isMultiTenant: userTenants.length > 1,
    switchTenant: handleSwitchTenant,
    refreshTenantData,
    clearTenantSession,
    isInitialized,
  };
};

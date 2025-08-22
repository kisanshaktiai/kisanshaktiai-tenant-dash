
import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setError } from '@/store/slices/tenantSlice';
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
    if (user?.id) {
      const tenants = await fetchUserTenants(user.id);
      
      // Set current tenant if not set and tenants available
      if (!currentTenant && tenants.length > 0) {
        const primaryTenant = tenants.find(ut => ut.is_primary) || tenants[0];
        if (primaryTenant?.tenant) {
          console.log('useTenantAuth: Setting current tenant:', primaryTenant.tenant);
          dispatch(setCurrentTenant(primaryTenant.tenant));
          localStorage.setItem('currentTenantId', primaryTenant.tenant.id);
        }
      }
      
      setIsInitialized(true);
    }
  }, [user?.id, fetchUserTenants, currentTenant, dispatch]);

  // Initialize tenant data when user logs in
  useEffect(() => {
    if (!user) {
      clearTenantSession();
      setIsInitialized(false);
      return;
    }

    if (!isInitialized && !loading) {
      // Try to restore current tenant from localStorage
      const storedTenantId = localStorage.getItem('currentTenantId');
      if (storedTenantId && currentTenant?.id === storedTenantId) {
        setIsInitialized(true);
        return;
      }

      refreshTenantData();
    }
  }, [user, isInitialized, loading, refreshTenantData, clearTenantSession, currentTenant]);

  // Set up real-time subscriptions
  useTenantRealtime(user?.id, currentTenant?.id, refreshTenantData);

  const handleSwitchTenant = useCallback(async (tenantId: string) => {
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

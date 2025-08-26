
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTenant } from '@/store/slices/tenantSlice';
import { useTenantSession } from '@/hooks/core/useTenantSession';
import { supabase } from '@/integrations/supabase/client';
import { transformUserTenant } from '@/utils/tenantTransformers';

export const useTenantAuth = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, loading } = useAppSelector((state) => state.tenant);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  const { switchTenant, clearTenantSession } = useTenantSession();

  // Memoized fetch function to prevent recreation
  const fetchUserTenants = useCallback(async (userId: string) => {
    if (initializationRef.current) return []; // Prevent duplicate calls
    
    try {
      console.log('useTenantAuth: Fetching user tenants for user:', userId);
      
      const { data: userTenantsData, error } = await supabase
        .from('user_tenants')
        .select(`
          *,
          tenant:tenants!user_tenants_tenant_id_fkey(
            *,
            branding:tenant_branding!tenant_branding_tenant_id_fkey(*),
            features:tenant_features!tenant_features_tenant_id_fkey(*),
            subscription:tenant_subscriptions!tenant_subscriptions_tenant_id_fkey(
              *,
              plan:subscription_plans(*)
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('useTenantAuth: Error fetching user tenants:', error);
        return [];
      }

      const transformedData = (userTenantsData || [])
        .filter(userTenant => userTenant.tenant && typeof userTenant.tenant === 'object')
        .map(userTenant => {
          try {
            return transformUserTenant(userTenant);
          } catch (error) {
            console.warn('useTenantAuth: Error transforming user tenant:', error);
            return null;
          }
        })
        .filter(Boolean);
      
      return transformedData;
    } catch (error) {
      console.error('useTenantAuth: Exception fetching user tenants:', error);
      return [];
    }
  }, []);

  // Single initialization effect
  useEffect(() => {
    if (!user) {
      console.log('useTenantAuth: No user, clearing tenant session');
      clearTenantSession();
      setIsInitialized(false);
      initializationRef.current = false;
      return;
    }

    if (initializationRef.current || isInitialized) {
      return; // Already initialized or in progress
    }

    const initializeTenantData = async () => {
      if (initializationRef.current) return;
      
      initializationRef.current = true;
      
      try {
        console.log('useTenantAuth: Initializing tenant data for user:', user.id);
        
        // Check if we already have a current tenant from localStorage
        const storedTenantId = localStorage.getItem('currentTenantId');
        if (storedTenantId && currentTenant?.id === storedTenantId) {
          console.log('useTenantAuth: Current tenant already matches stored ID');
          setIsInitialized(true);
          return;
        }

        const tenants = await fetchUserTenants(user.id);
        
        if (tenants && tenants.length > 0) {
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
        console.error('useTenantAuth: Error initializing tenant data:', error);
        setIsInitialized(true); // Still mark as initialized to prevent endless loading
      }
    };

    // Debounce initialization
    const timeoutId = setTimeout(initializeTenantData, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, currentTenant, dispatch, fetchUserTenants, clearTenantSession, isInitialized]);

  const handleSwitchTenant = useCallback(async (tenantId: string) => {
    console.log('useTenantAuth: Switching tenant to:', tenantId);
    await switchTenant(tenantId, userTenants);
  }, [switchTenant, userTenants]);

  const refreshTenantData = useCallback(async () => {
    if (!user?.id || initializationRef.current) return;
    
    initializationRef.current = true;
    try {
      await fetchUserTenants(user.id);
    } finally {
      initializationRef.current = false;
    }
  }, [user?.id, fetchUserTenants]);

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

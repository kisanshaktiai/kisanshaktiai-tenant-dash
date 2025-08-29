
import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setLoading } from '@/store/slices/tenantSlice';
import { supabase } from '@/integrations/supabase/client';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';

export const useTenantAuth = () => {
  const dispatch = useAppDispatch();
  const { user, initialized: authInitialized } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants } = useAppSelector((state) => state.tenant);
  const [loading, setLoadingState] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const hasUserRef = useRef<string | null>(null);
  const hasClearedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();
  const maxInitTimeoutRef = useRef<NodeJS.Timeout>();

  const refreshTenantData = async () => {
    if (!user?.id || isRefreshingRef.current || !authInitialized) {
      console.log('useTenantAuth: Cannot refresh - conditions not met');
      return;
    }

    try {
      isRefreshingRef.current = true;
      setLoadingState(true);
      dispatch(setLoading(true));
      
      console.log('useTenantAuth: Refreshing tenant data for user:', user.id);

      // Create timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tenant data fetch timeout')), 5000);
      });

      const fetchPromise = supabase
        .from('user_tenants')
        .select(`
          tenant_id,
          role,
          is_active,
          tenants!user_tenants_tenant_id_fkey (
            id,
            name,
            slug,
            type,
            status,
            subscription_plan,
            owner_name,
            owner_email,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data: userTenantsData, error: userTenantsError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (userTenantsError) {
        console.error('useTenantAuth: Error fetching user tenants:', userTenantsError);
        throw userTenantsError;
      }

      const tenants = userTenantsData
        ?.filter(ut => ut.tenants && typeof ut.tenants === 'object')
        .map(ut => {
          const tenantData = ut.tenants as any;
          return {
            ...tenantData,
            userRole: ut.role
          };
        }) || [];

      console.log('useTenantAuth: Found tenants:', tenants.length);

      dispatch(setUserTenants(tenants));

      if (!currentTenant || !tenants.find(t => t.id === currentTenant.id)) {
        const firstTenant = tenants[0];
        if (firstTenant) {
          console.log('useTenantAuth: Setting current tenant:', firstTenant.id);
          
          const tenantForState = {
            id: firstTenant.id,
            name: firstTenant.name,
            slug: firstTenant.slug,
            type: firstTenant.type,
            status: firstTenant.status,
            subscription_plan: firstTenant.subscription_plan,
            owner_name: firstTenant.owner_name,
            owner_email: firstTenant.owner_email,
            created_at: firstTenant.created_at,
            updated_at: firstTenant.updated_at,
            userRole: firstTenant.userRole
          };
          
          dispatch(setCurrentTenant(tenantForState));
        } else {
          console.log('useTenantAuth: No tenants available for user');
          dispatch(setCurrentTenant(null));
        }
      }

      setIsInitialized(true);
      hasClearedRef.current = false;
    } catch (error: any) {
      console.error('useTenantAuth: Error refreshing tenant data:', error);
      if (error.message !== 'Tenant data fetch timeout') {
        dispatch(setCurrentTenant(null));
        dispatch(setUserTenants([]));
      }
      setIsInitialized(true);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
      isRefreshingRef.current = false;
    }
  };

  const switchTenant = async (tenantId: string) => {
    console.log('useTenantAuth: Switching to tenant:', tenantId);
    
    const tenant = userTenants.find(t => t.id === tenantId);
    if (tenant) {
      dispatch(setCurrentTenant(tenant as any));
      enhancedOnboardingService.clearCache();
      console.log('useTenantAuth: Successfully switched to tenant:', tenantId);
    } else {
      console.error('useTenantAuth: Tenant not found in user tenants:', tenantId);
    }
  };

  const clearTenantSession = () => {
    if (hasClearedRef.current) {
      return;
    }
    
    console.log('useTenantAuth: Clearing tenant session');
    hasClearedRef.current = true;
    dispatch(setCurrentTenant(null));
    dispatch(setUserTenants([]));
    setIsInitialized(false);
    enhancedOnboardingService.clearCache();
    
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
    }
    if (maxInitTimeoutRef.current) {
      clearTimeout(maxInitTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    const currentUserId = user?.id || null;
    const previousUserId = hasUserRef.current;
    
    if (currentUserId !== previousUserId) {
      hasUserRef.current = currentUserId;
      
      if (currentUserId && !isInitialized) {
        console.log('useTenantAuth: User logged in, initializing tenant data');
        
        // Set maximum initialization timeout
        maxInitTimeoutRef.current = setTimeout(() => {
          if (!isInitialized) {
            console.log('useTenantAuth: Max timeout reached, forcing initialization');
            setIsInitialized(true);
            setLoadingState(false);
            dispatch(setLoading(false));
          }
        }, 8000);
        
        initializationTimeoutRef.current = setTimeout(() => {
          refreshTenantData();
        }, 300);
      } else if (!currentUserId) {
        console.log('useTenantAuth: User logged out, clearing tenant session');
        clearTenantSession();
      }
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (maxInitTimeoutRef.current) {
        clearTimeout(maxInitTimeoutRef.current);
      }
    };
  }, [user?.id, authInitialized, isInitialized]);

  return {
    currentTenant,
    userTenants,
    loading,
    isMultiTenant: userTenants.length > 1,
    switchTenant,
    refreshTenantData,
    clearTenantSession,
    isInitialized
  };
};

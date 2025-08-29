
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
  
  // Use refs to prevent multiple operations and track state
  const hasUserRef = useRef<string | null>(null);
  const hasClearedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();

  const refreshTenantData = async () => {
    if (!user?.id || isRefreshingRef.current || !authInitialized) {
      console.log('useTenantAuth: Cannot refresh - no user, already refreshing, or auth not initialized');
      return;
    }

    try {
      isRefreshingRef.current = true;
      setLoadingState(true);
      dispatch(setLoading(true));
      
      console.log('useTenantAuth: Refreshing tenant data for user:', user.id);

      const { data: userTenantsData, error: userTenantsError } = await supabase
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

      // Only set current tenant if we don't have one or if it's not in the list
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
    } catch (error) {
      console.error('useTenantAuth: Error refreshing tenant data:', error);
      dispatch(setCurrentTenant(null));
      dispatch(setUserTenants([]));
      setIsInitialized(true); // Still set initialized even on error
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
      console.log('useTenantAuth: Session already cleared, skipping');
      return;
    }
    
    console.log('useTenantAuth: Clearing tenant session');
    hasClearedRef.current = true;
    dispatch(setCurrentTenant(null));
    dispatch(setUserTenants([]));
    setIsInitialized(false);
    enhancedOnboardingService.clearCache();
    
    // Clear any pending initialization
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
    }
  };

  // Handle user state changes - only when auth is properly initialized
  useEffect(() => {
    if (!authInitialized) {
      console.log('useTenantAuth: Auth not initialized yet, waiting...');
      return;
    }

    const currentUserId = user?.id || null;
    const previousUserId = hasUserRef.current;
    
    console.log('useTenantAuth: User state change check:', {
      currentUserId,
      previousUserId,
      hasChanged: currentUserId !== previousUserId,
      authInitialized
    });
    
    // Only act if the user ID has actually changed
    if (currentUserId !== previousUserId) {
      hasUserRef.current = currentUserId;
      
      if (currentUserId && !isInitialized) {
        console.log('useTenantAuth: User logged in, initializing tenant data with delay');
        // Add a small delay to ensure auth is fully settled
        initializationTimeoutRef.current = setTimeout(() => {
          refreshTenantData();
        }, 100);
      } else if (!currentUserId) {
        console.log('useTenantAuth: User logged out, clearing tenant session');
        clearTenantSession();
      }
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
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

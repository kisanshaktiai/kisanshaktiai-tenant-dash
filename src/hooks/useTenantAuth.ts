
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setLoading } from '@/store/slices/tenantSlice';
import { supabase } from '@/integrations/supabase/client';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';

export const useTenantAuth = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants } = useAppSelector((state) => state.tenant);
  const [loading, setLoadingState] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshTenantData = async () => {
    if (!user?.id) {
      console.log('useTenantAuth: No user available for tenant data refresh');
      return;
    }

    try {
      setLoadingState(true);
      dispatch(setLoading(true));
      
      console.log('useTenantAuth: Refreshing tenant data for user:', user.id);

      // Get user's tenants with proper RLS policies
      const { data: userTenantsData, error: userTenantsError } = await supabase
        .from('user_tenants')
        .select(`
          tenant_id,
          role,
          is_active,
          tenants:tenant_id (
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

      // Transform the data to proper format with type safety
      const tenants = userTenantsData
        ?.filter(ut => ut.tenants && typeof ut.tenants === 'object')
        .map(ut => {
          const tenantData = ut.tenants as any; // Safe cast since we filtered above
          return {
            ...tenantData,
            userRole: ut.role
          };
        }) || [];

      console.log('useTenantAuth: Found tenants:', tenants.length);

      dispatch(setUserTenants(tenants));

      // Set current tenant if not already set or if current one is invalid
      if (!currentTenant || !tenants.find(t => t.id === currentTenant.id)) {
        const firstTenant = tenants[0];
        if (firstTenant) {
          console.log('useTenantAuth: Setting current tenant:', firstTenant.id);
          
          // Create proper Tenant object from the transformed data
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
          console.log('useTenantAuth: No tenants available');
          dispatch(setCurrentTenant(null));
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('useTenantAuth: Error refreshing tenant data:', error);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  const switchTenant = async (tenantId: string) => {
    console.log('useTenantAuth: Switching to tenant:', tenantId);
    
    // Find the tenant in the userTenants array (which contains properly transformed Tenant objects)
    const tenant = userTenants.find(t => t.id === tenantId);
    if (tenant) {
      // Cast the tenant to Tenant type since userTenants contains transformed tenant objects
      // that have all the required Tenant properties
      dispatch(setCurrentTenant(tenant as any));
      
      // Clear onboarding service cache when switching tenants
      enhancedOnboardingService.clearCache();
      
      console.log('useTenantAuth: Successfully switched to tenant:', tenantId);
    } else {
      console.error('useTenantAuth: Tenant not found in user tenants:', tenantId);
    }
  };

  const clearTenantSession = () => {
    console.log('useTenantAuth: Clearing tenant session');
    dispatch(setCurrentTenant(null));
    dispatch(setUserTenants([]));
    setIsInitialized(false);
    enhancedOnboardingService.clearCache();
  };

  // Initialize tenant data when user changes
  useEffect(() => {
    if (user?.id && !isInitialized) {
      console.log('useTenantAuth: User changed, initializing tenant data');
      refreshTenantData();
    } else if (!user?.id) {
      console.log('useTenantAuth: No user, clearing tenant session');
      clearTenantSession();
    }
  }, [user?.id, isInitialized]);

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

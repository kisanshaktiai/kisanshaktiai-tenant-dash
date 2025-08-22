
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { setUserTenants, setCurrentTenant, setLoading, setError } from '@/store/slices/tenantSlice';
import { transformUserTenant } from '@/utils/tenantTransformers';

export const useTenantDataFetch = () => {
  const dispatch = useAppDispatch();

  const fetchUserTenants = useCallback(async (userId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('useTenantDataFetch: Fetching tenant data for user:', userId);
      
      const { data: userTenantsData, error: userTenantsError } = await supabase
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

      if (userTenantsError) {
        console.error('useTenantDataFetch: Error fetching user tenants:', userTenantsError);
        throw userTenantsError;
      }

      if (!userTenantsData || userTenantsData.length === 0) {
        console.log('useTenantDataFetch: User has no active tenants');
        dispatch(setUserTenants([]));
        dispatch(setCurrentTenant(null));
        return [];
      }

      // Transform data using centralized transformers
      const transformedUserTenants = userTenantsData
        .filter(ut => ut.tenant)
        .map(transformUserTenant);

      console.log('useTenantDataFetch: Processed user tenants:', transformedUserTenants);
      dispatch(setUserTenants(transformedUserTenants));

      return transformedUserTenants;
    } catch (error) {
      console.error('useTenantDataFetch: Error in fetchUserTenants:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load tenant data'));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    fetchUserTenants,
  };
};

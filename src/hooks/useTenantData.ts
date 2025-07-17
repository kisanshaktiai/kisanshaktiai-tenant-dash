import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants } from '@/store/slices/tenantSlice';

export const useTenantData = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!user) return;

    const fetchUserTenants = async () => {
      try {
        // Get user's tenants
        const { data: userTenantsData, error: userTenantsError } = await supabase
          .from('user_tenants')
          .select(`
            *,
            tenant:tenants!inner(
              *,
              branding:tenant_branding(*),
              features:tenant_features(*)
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (userTenantsError) throw userTenantsError;

        dispatch(setUserTenants(userTenantsData || []));

        // Set current tenant if not set
        if (!currentTenant && userTenantsData && userTenantsData.length > 0) {
          const primaryTenant = userTenantsData.find(ut => ut.is_primary) || userTenantsData[0];
          if (primaryTenant?.tenant) {
            dispatch(setCurrentTenant({
              ...primaryTenant.tenant,
              branding: primaryTenant.tenant.branding?.[0] || null,
              features: primaryTenant.tenant.features?.[0] || null,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchUserTenants();

    // Set up real-time subscription for tenant changes
    const channel = supabase
      .channel('tenant_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tenants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUserTenants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, dispatch, currentTenant]);

  return {
    currentTenant,
    userTenants,
    isMultiTenant: userTenants.length > 1,
  };
};
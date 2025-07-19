
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setSubscriptionPlans } from '@/store/slices/tenantSlice';

export const useTenantData = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, subscriptionPlans } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!user) return;

    const fetchUserTenants = async () => {
      try {
        // Get user's tenants with complete related data
        const { data: userTenantsData, error: userTenantsError } = await supabase
          .from('user_tenants')
          .select(`
            *,
            tenant:tenants!inner(
              *,
              branding:tenant_branding(*),
              features:tenant_features(*),
              subscription:tenant_subscriptions(
                *,
                plan:subscription_plans(*)
              )
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
            // Map old subscription plan values to new ones
            const mapSubscriptionPlan = (plan: string): 'kisan' | 'shakti' | 'ai' => {
              switch (plan) {
                case 'starter':
                case 'basic':
                  return 'kisan';
                case 'professional':
                case 'growth':
                  return 'shakti';
                case 'enterprise':
                case 'custom':
                  return 'ai';
                default:
                  return 'kisan';
              }
            };

            const tenant = primaryTenant.tenant;
            dispatch(setCurrentTenant({
              ...tenant,
              subscription_plan: mapSubscriptionPlan(tenant.subscription_plan),
              branding: Array.isArray(tenant.branding) ? tenant.branding[0] : tenant.branding,
              features: Array.isArray(tenant.features) ? tenant.features[0] : tenant.features,
              subscription: Array.isArray(tenant.subscription) ? tenant.subscription[0] : tenant.subscription,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    const fetchSubscriptionPlans = async () => {
      try {
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (plansError) throw plansError;

        dispatch(setSubscriptionPlans(plansData || []));
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      }
    };

    fetchUserTenants();
    fetchSubscriptionPlans();

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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_features',
        },
        () => {
          fetchUserTenants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_branding',
        },
        () => {
          fetchUserTenants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_subscriptions',
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
    subscriptionPlans,
    isMultiTenant: userTenants.length > 1,
  };
};

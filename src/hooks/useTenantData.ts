
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

        // Transform the data to match our interfaces
        const transformedUserTenants = (userTenantsData || []).map(userTenant => ({
          ...userTenant,
          tenant: userTenant.tenant ? {
            ...userTenant.tenant,
            // Handle status mapping
            status: mapTenantStatus(userTenant.tenant.status),
            subscription_plan: mapSubscriptionPlan(userTenant.tenant.subscription_plan),
            branding: Array.isArray(userTenant.tenant.branding) ? userTenant.tenant.branding[0] : userTenant.tenant.branding,
            features: Array.isArray(userTenant.tenant.features) ? userTenant.tenant.features[0] : userTenant.tenant.features,
            subscription: userTenant.tenant.subscription ? processSubscription(
              Array.isArray(userTenant.tenant.subscription) ? userTenant.tenant.subscription[0] : userTenant.tenant.subscription
            ) : null,
          } : undefined
        }));

        dispatch(setUserTenants(transformedUserTenants));

        // Set current tenant if not set
        if (!currentTenant && transformedUserTenants && transformedUserTenants.length > 0) {
          const primaryTenant = transformedUserTenants.find(ut => ut.is_primary) || transformedUserTenants[0];
          if (primaryTenant?.tenant) {
            dispatch(setCurrentTenant(primaryTenant.tenant));
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

        // Map the data to match our interface structure
        const mappedPlans = (plansData || []).map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price_monthly: plan.price_monthly || 0,
          price_annually: plan.price_annually || 0,
          max_farmers: plan.max_farmers || 0,
          max_dealers: plan.max_dealers || 0,
          max_products: plan.max_products || 0,
          max_storage_gb: plan.max_storage_gb || 0,
          max_api_calls_per_day: plan.max_api_calls_per_day || 0,
          features: typeof plan.features === 'object' && plan.features !== null ? plan.features as Record<string, any> : {},
          is_active: plan.is_active,
        }));

        dispatch(setSubscriptionPlans(mappedPlans));
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

// Helper functions
const mapTenantStatus = (status: string): 'pending' | 'active' | 'suspended' | 'cancelled' | 'trial' => {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'active':
      return 'active';
    case 'suspended':
      return 'suspended';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'trial':
      return 'trial';
    default:
      return 'pending';
  }
};

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

const processSubscription = (subscription: any) => {
  if (!subscription) return null;
  
  return {
    ...subscription,
    status: mapSubscriptionStatus(subscription.status),
  };
};

const mapSubscriptionStatus = (status: string): 'trial' | 'active' | 'canceled' | 'past_due' => {
  switch (status) {
    case 'trial':
      return 'trial';
    case 'active':
      return 'active';
    case 'canceled':
    case 'cancelled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    default:
      return 'trial';
  }
};

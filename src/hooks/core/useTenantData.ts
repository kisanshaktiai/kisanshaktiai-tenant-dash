import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setSubscriptionPlans, setLoading, setError } from '@/store/slices/tenantSlice';
import { tenantDataService } from '@/services/TenantDataService';
import { onboardingValidationService } from '@/services/OnboardingValidationService';
import { transformUserTenant } from '@/utils/tenantTransformers';

export const useTenantData = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, subscriptionPlans, loading } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!user) {
      dispatch(setCurrentTenant(null));
      dispatch(setUserTenants([]));
      return;
    }

    const fetchUserTenants = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        
        console.log('useTenantData: Fetching tenant data for user:', user.id);
        
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
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (userTenantsError) {
          console.error('useTenantData: Error fetching user tenants:', userTenantsError);
          
          // If no tenants found, this is normal for new users
          if (userTenantsError.code === 'PGRST116') {
            console.log('useTenantData: No tenants found for user - this is normal for new users');
            dispatch(setUserTenants([]));
            return;
          }
          
          throw userTenantsError;
        }

        console.log('useTenantData: Fetched user tenants:', userTenantsData);

        // Transform and filter valid user tenants using the transformer utility
        const transformedUserTenants = (userTenantsData || [])
          .filter(userTenant => userTenant.tenant && typeof userTenant.tenant === 'object' && !('error' in userTenant.tenant))
          .map(userTenant => {
            try {
              return transformUserTenant(userTenant);
            } catch (error) {
              console.warn('useTenantData: Error transforming user tenant:', error);
              return null;
            }
          })
          .filter(Boolean);

        dispatch(setUserTenants(transformedUserTenants as any));

        if (!currentTenant && transformedUserTenants && transformedUserTenants.length > 0) {
          const primaryTenant = transformedUserTenants.find(ut => ut?.role === 'tenant_owner') || transformedUserTenants[0];
          if (primaryTenant?.tenant) {
            console.log('useTenantData: Setting current tenant:', primaryTenant.tenant);
            dispatch(setCurrentTenant(primaryTenant.tenant));
            
            try {
              await onboardingValidationService.validateAndRepairOnboarding(primaryTenant.tenant.id);
            } catch (validationError) {
              console.warn('useTenantData: Onboarding validation warning:', validationError);
            }
          }
        }
      } catch (error) {
        console.error('useTenantData: Error fetching tenant data:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Failed to load tenant data'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    const fetchSubscriptionPlans = async () => {
      try {
        if (currentTenant?.id) {
          const plansData = await tenantDataService.getSubscriptionPlans(currentTenant.id);
          
          const mappedPlans = (plansData || []).map(plan => {
            const limits = typeof plan.limits === 'object' && plan.limits !== null ? plan.limits as Record<string, any> : {};
            
            return {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price_monthly: plan.price_monthly || 0,
              price_annually: plan.price_annually || 0,
              max_farmers: limits.max_farmers || 0,
              max_dealers: limits.max_dealers || 0,
              max_products: limits.max_products || 0,
              max_storage_gb: limits.storage_gb || 0,
              max_api_calls_per_day: limits.api_calls_per_day || 0,
              features: typeof plan.features === 'object' && plan.features !== null ? plan.features as Record<string, any> : {},
              is_active: plan.is_active,
            };
          });

          dispatch(setSubscriptionPlans(mappedPlans));
        } else {
          const { data: plansData, error: plansError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });

          if (plansError) {
            console.error('Error fetching subscription plans:', plansError);
            throw plansError;
          }

          const mappedPlans = (plansData || []).map(plan => {
            const limits = typeof plan.limits === 'object' && plan.limits !== null ? plan.limits as Record<string, any> : {};
            
            return {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price_monthly: plan.price_monthly || 0,
              price_annually: plan.price_annually || 0,
              max_farmers: limits.max_farmers || 0,
              max_dealers: limits.max_dealers || 0,
              max_products: limits.max_products || 0,
              max_storage_gb: limits.storage_gb || 0,
              max_api_calls_per_day: limits.api_calls_per_day || 0,
              features: typeof plan.features === 'object' && plan.features !== null ? plan.features as Record<string, any> : {},
              is_active: plan.is_active,
            };
          });

          dispatch(setSubscriptionPlans(mappedPlans));
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      }
    };

    const channel = supabase
      .channel(`tenant_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tenants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('Real-time tenant data change detected');
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

    if (userTenants.length === 0 || !loading) {
      fetchUserTenants();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, dispatch, currentTenant?.id, userTenants.length, loading]);

  return {
    currentTenant,
    userTenants,
    subscriptionPlans,
    isMultiTenant: userTenants.length > 1,
    loading,
  };
};

// Export the fetchUserTenants function
export const useTenantDataFetch = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const fetchUserTenants = async (userId: string) => {
    // This is a simplified version - in practice you'd want the full implementation
    // For now, just call the main hook's logic
    return [];
  };

  return { fetchUserTenants };
};

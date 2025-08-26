
import { useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setSubscriptionPlans, setLoading, setError } from '@/store/slices/tenantSlice';
import { tenantDataService } from '@/services/TenantDataService';
import { onboardingValidationService } from '@/services/OnboardingValidationService';
import { useMemoizedTenantTransformer } from '@/utils/optimizedTenantTransformers';

export const useOptimizedTenantData = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, subscriptionPlans, loading } = useAppSelector((state) => state.tenant);
  
  const transformUserTenant = useMemoizedTenantTransformer();

  // Memoize expensive computations
  const isMultiTenant = useMemo(() => userTenants.length > 1, [userTenants.length]);
  
  const fetchUserTenants = useCallback(async () => {
    if (!user) {
      dispatch(setCurrentTenant(null));
      dispatch(setUserTenants([]));
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('useOptimizedTenantData: Fetching tenant data for user:', user.id);
      
      const { data: userTenantsData, error: userTenantsError } = await supabase
        .from('user_tenants')
        .select(`
          *,
          tenant:tenants(
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

      if (userTenantsError) {
        console.error('useOptimizedTenantData: Error fetching user tenants:', userTenantsError);
        
        if (userTenantsError.code === 'PGRST116') {
          console.log('useOptimizedTenantData: No tenants found for user - this is normal for new users');
          dispatch(setUserTenants([]));
          return;
        }
        
        throw userTenantsError;
      }

      console.log('useOptimizedTenantData: Fetched user tenants:', userTenantsData);

      // Use memoized transformer for better performance
      const transformedUserTenants = (userTenantsData || [])
        .map(transformUserTenant)
        .filter(Boolean);

      dispatch(setUserTenants(transformedUserTenants as any));

      if (!currentTenant && transformedUserTenants && transformedUserTenants.length > 0) {
        const primaryTenant = transformedUserTenants.find(ut => ut?.role === 'tenant_owner') || transformedUserTenants[0];
        if (primaryTenant?.tenant) {
          console.log('useOptimizedTenantData: Setting current tenant:', primaryTenant.tenant);
          dispatch(setCurrentTenant(primaryTenant.tenant));
          
          try {
            await onboardingValidationService.validateAndRepairOnboarding(primaryTenant.tenant.id);
          } catch (validationError) {
            console.warn('useOptimizedTenantData: Onboarding validation warning:', validationError);
          }
        }
      }
    } catch (error) {
      console.error('useOptimizedTenantData: Error fetching tenant data:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load tenant data'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, currentTenant, transformUserTenant]);

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      let plansData;
      
      if (currentTenant?.id) {
        plansData = await tenantDataService.getSubscriptionPlans(currentTenant.id);
      } else {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;
        plansData = data;
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
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  }, [currentTenant?.id, dispatch]);

  // Debounced real-time subscription to prevent excessive re-renders
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    
    const debouncedRefetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Real-time tenant data change detected');
        fetchUserTenants();
      }, 500);
    };

    const channel = supabase
      .channel(`tenant_changes_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_tenants',
        filter: `user_id=eq.${user.id}`,
      }, debouncedRefetch)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tenant_features',
      }, debouncedRefetch)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tenant_branding',
      }, debouncedRefetch)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tenant_subscriptions',
      }, debouncedRefetch)
      .subscribe();

    // Initial fetch only if needed
    if (userTenants.length === 0 && !loading) {
      fetchUserTenants();
    }

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user, dispatch, userTenants.length, loading, fetchUserTenants]);

  // Fetch subscription plans when tenant changes
  useEffect(() => {
    if (currentTenant) {
      fetchSubscriptionPlans();
    }
  }, [currentTenant, fetchSubscriptionPlans]);

  return {
    currentTenant,
    userTenants,
    subscriptionPlans,
    isMultiTenant,
    loading,
  };
};

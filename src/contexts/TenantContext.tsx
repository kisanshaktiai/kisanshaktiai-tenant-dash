
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setLoading, setError } from '@/store/slices/tenantSlice';
import { supabase } from '@/integrations/supabase/client';
import { tenantDataService } from '@/services/TenantDataService';

interface TenantContextValue {
  currentTenant: any;
  userTenants: any[];
  loading: boolean;
  error: string | null;
  initializeOnboarding: (tenantId: string) => Promise<any>;
  refreshTenantData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, loading, error } = useAppSelector((state) => state.tenant);
  const [initializing, setInitializing] = useState(false);

  const fetchUserTenants = useCallback(async () => {
    if (!user) {
      dispatch(setCurrentTenant(null));
      dispatch(setUserTenants([]));
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('TenantProvider: Fetching tenant data for user:', user.id);
      
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

      if (userTenantsError) {
        console.error('TenantProvider: Error fetching user tenants:', userTenantsError);
        dispatch(setError(`Failed to load tenant data: ${userTenantsError.message}`));
        throw userTenantsError;
      }

      console.log('TenantProvider: Fetched user tenants:', userTenantsData);

      const transformedUserTenants = (userTenantsData || []).map(userTenant => ({
        ...userTenant,
        tenant: userTenant.tenant ? {
          ...userTenant.tenant,
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

      if (!currentTenant && transformedUserTenants && transformedUserTenants.length > 0) {
        const primaryTenant = transformedUserTenants.find(ut => ut.is_primary) || transformedUserTenants[0];
        if (primaryTenant?.tenant) {
          console.log('TenantProvider: Setting current tenant:', primaryTenant.tenant);
          dispatch(setCurrentTenant(primaryTenant.tenant));
        }
      }
    } catch (error) {
      console.error('TenantProvider: Error fetching tenant data:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load tenant data'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, currentTenant]);

  const initializeOnboarding = useCallback(async (tenantId: string) => {
    if (initializing) {
      console.log('TenantProvider: Onboarding initialization already in progress');
      return null;
    }
    
    try {
      setInitializing(true);
      console.log('TenantProvider: Initializing onboarding for tenant:', tenantId);
      
      const onboardingData = await tenantDataService.initializeOnboardingForTenant(tenantId);
      
      console.log('TenantProvider: Onboarding initialized successfully:', onboardingData);
      return onboardingData;
    } catch (error) {
      console.error('TenantProvider: Error initializing onboarding:', error);
      // Don't throw the error, just log it to prevent blocking the UI
      return null;
    } finally {
      setInitializing(false);
    }
  }, [initializing]);

  const refreshTenantData = useCallback(async () => {
    await fetchUserTenants();
  }, [fetchUserTenants]);

  useEffect(() => {
    if (user && userTenants.length === 0 && !loading) {
      fetchUserTenants();
    }
  }, [user, userTenants.length, loading, fetchUserTenants]);

  useEffect(() => {
    if (!user) return;

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
          console.log('TenantProvider: Real-time tenant data change detected');
          fetchUserTenants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserTenants]);

  const value: TenantContextValue = {
    currentTenant,
    userTenants,
    loading: loading || initializing,
    error,
    initializeOnboarding,
    refreshTenantData,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

// Helper functions
const mapTenantStatus = (status: string): 'pending' | 'active' | 'suspended' | 'cancelled' | 'trial' => {
  switch (status) {
    case 'pending': return 'pending';
    case 'active': return 'active';
    case 'suspended': return 'suspended';
    case 'cancelled':
    case 'canceled': return 'cancelled';
    case 'trial': return 'trial';
    default: return 'pending';
  }
};

const mapSubscriptionPlan = (plan: string): 'kisan' | 'shakti' | 'ai' => {
  switch (plan) {
    case 'starter':
    case 'basic': return 'kisan';
    case 'professional':
    case 'growth': return 'shakti';
    case 'enterprise':
    case 'custom': return 'ai';
    default: return 'kisan';
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
    case 'trial': return 'trial';
    case 'active': return 'active';
    case 'canceled':
    case 'cancelled': return 'canceled';
    case 'past_due': return 'past_due';
    default: return 'trial';
  }
};

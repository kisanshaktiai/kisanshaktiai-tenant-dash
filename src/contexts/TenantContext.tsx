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
  isInitializing: boolean;
  initializationAttempts: number;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

// Helper function to safely extract workflow ID
const getWorkflowId = (workflow: any): string => {
  return workflow && 
    typeof workflow === 'object' && 
    workflow !== null && 
    'id' in workflow && 
    typeof workflow.id === 'string' 
      ? workflow.id 
      : 'unknown';
};

// Helper function to safely access payload properties
const safePayloadAccess = (payload: any, path: string): any => {
  return payload && 
    typeof payload === 'object' && 
    payload !== null && 
    payload.new &&
    typeof payload.new === 'object' &&
    payload.new !== null &&
    path in payload.new
      ? payload.new[path]
      : null;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, loading, error } = useAppSelector((state) => state.tenant);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [lastInitializationAttempt, setLastInitializationAttempt] = useState<string | null>(null);

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
      
      // FIXED: Use explicit foreign key relationship to avoid ambiguity
      const { data: userTenantsData, error: userTenantsError } = await supabase
        .from('user_tenants')
        .select(`
          *,
          tenants!user_tenants_tenant_id_fkey(
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
        console.error('TenantProvider: Error fetching user tenants:', userTenantsError);
        const errorMessage = `Failed to load tenant data: ${userTenantsError.message}`;
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }

      console.log('TenantProvider: Fetched user tenants:', userTenantsData);

      const transformedUserTenants = (userTenantsData || []).map(userTenant => ({
        ...userTenant,
        tenant: userTenant.tenants ? {
          ...userTenant.tenants,
          status: mapTenantStatus(userTenant.tenants.status),
          subscription_plan: mapSubscriptionPlan(userTenant.tenants.subscription_plan),
          branding: Array.isArray(userTenant.tenants.branding) ? userTenant.tenants.branding[0] : userTenant.tenants.branding,
          features: Array.isArray(userTenant.tenants.features) ? userTenant.tenants.features[0] : userTenant.tenants.features,
          subscription: userTenant.tenants.subscription ? processSubscription(
            Array.isArray(userTenant.tenants.subscription) ? userTenant.tenants.subscription[0] : userTenant.tenants.subscription
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tenant data';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, currentTenant]);

  const initializeOnboarding = useCallback(async (tenantId: string) => {
    // Prevent multiple simultaneous initializations for the same tenant
    const attemptKey = `${tenantId}-${Date.now()}`;
    if (isInitializing && lastInitializationAttempt && 
        Date.now() - parseInt(lastInitializationAttempt.split('-')[1]) < 5000) {
      console.log('TenantProvider: Onboarding initialization already in progress, skipping');
      return null;
    }
    
    try {
      setIsInitializing(true);
      setLastInitializationAttempt(attemptKey);
      setInitializationAttempts(prev => prev + 1);
      
      console.log('TenantProvider: Initializing enterprise onboarding for tenant:', tenantId, 'attempt:', initializationAttempts + 1);
      
      const onboardingData = await tenantDataService.initializeOnboardingForTenant(tenantId);
      
      // Add proper type checking and null safety
      if (onboardingData && typeof onboardingData === 'object') {
        const workflow = onboardingData.workflow;
        const steps = onboardingData.steps;
        
        // Use helper function for safe workflow ID access
        const workflowId = getWorkflowId(workflow);
        
        console.log('TenantProvider: Enterprise onboarding initialized successfully:', {
          workflowId,
          stepCount: Array.isArray(steps) ? steps.length : 0,
          tenantId
        });
        
        // Reset attempt counter on success
        setInitializationAttempts(0);
        
        return onboardingData;
      } else {
        console.warn('TenantProvider: Onboarding initialization returned invalid data');
        return null;
      }
    } catch (error) {
      console.error('TenantProvider: Error initializing enterprise onboarding:', {
        tenantId,
        attempt: initializationAttempts + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Only show user-facing errors for repeated failures
      if (initializationAttempts >= 2) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        dispatch(setError(`Failed to initialize onboarding: ${errorMessage}`));
      }
      
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, lastInitializationAttempt, initializationAttempts, dispatch]);

  const refreshTenantData = useCallback(async () => {
    console.log('TenantProvider: Refreshing tenant data...');
    await fetchUserTenants();
  }, [fetchUserTenants]);

  useEffect(() => {
    if (user && userTenants.length === 0 && !loading) {
      console.log('TenantProvider: User authenticated, fetching tenants...');
      fetchUserTenants();
    }
  }, [user, userTenants.length, loading, fetchUserTenants]);

  useEffect(() => {
    if (!user) return;

    console.log('TenantProvider: Setting up real-time subscriptions for user:', user.id);

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
        (payload) => {
          console.log('TenantProvider: Real-time tenant data change detected:', payload.eventType);
          // Debounce rapid changes
          setTimeout(() => {
            fetchUserTenants();
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
        },
        (payload) => {
          console.log('TenantProvider: Real-time tenant table change detected:', payload.eventType);
          // FIXED: Use safe payload access helper
          const payloadId = safePayloadAccess(payload, 'id');
          if (currentTenant && payloadId && payloadId === currentTenant.id) {
            setTimeout(() => {
              fetchUserTenants();
            }, 500);
          }
        }
      )
      .subscribe((status) => {
        console.log('TenantProvider: Real-time subscription status:', status);
      });

    return () => {
      console.log('TenantProvider: Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserTenants, currentTenant]);

  const value: TenantContextValue = {
    currentTenant,
    userTenants,
    loading: loading || isInitializing,
    error,
    initializeOnboarding,
    refreshTenantData,
    isInitializing,
    initializationAttempts,
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


import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setLoading, setError, clearTenantData } from '@/store/slices/tenantSlice';
import { supabase } from '@/integrations/supabase/client';

export const useTenantAuthOptimized = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, loading } = useAppSelector((state) => state.tenant);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Prevent multiple simultaneous fetches
  const fetchingRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchUserTenants = useCallback(async (userId: string) => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('useTenantAuthOptimized: Fetch already in progress, skipping');
      return;
    }

    try {
      fetchingRef.current = true;
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('useTenantAuthOptimized: Fetching tenant data for user:', userId);
      
      // Get user-tenant relationships with full tenant data
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
        console.error('useTenantAuthOptimized: Error fetching user tenants:', userTenantsError);
        throw userTenantsError;
      }

      if (!userTenantsData || userTenantsData.length === 0) {
        console.log('useTenantAuthOptimized: User has no active tenants');
        dispatch(setUserTenants([]));
        dispatch(setCurrentTenant(null));
        return;
      }

      // Transform and validate tenant data
      const transformedUserTenants = userTenantsData
        .filter(ut => ut.tenant) // Only include records with valid tenant data
        .map(userTenant => ({
          ...userTenant,
          tenant: {
            ...userTenant.tenant,
            status: mapTenantStatus(userTenant.tenant.status),
            subscription_plan: mapSubscriptionPlan(userTenant.tenant.subscription_plan),
            branding: Array.isArray(userTenant.tenant.branding) 
              ? userTenant.tenant.branding[0] 
              : userTenant.tenant.branding,
            features: Array.isArray(userTenant.tenant.features) 
              ? userTenant.tenant.features[0] 
              : userTenant.tenant.features,
            subscription: userTenant.tenant.subscription 
              ? processSubscription(
                  Array.isArray(userTenant.tenant.subscription) 
                    ? userTenant.tenant.subscription[0] 
                    : userTenant.tenant.subscription
                )
              : null,
          }
        }));

      console.log('useTenantAuthOptimized: Processed user tenants:', transformedUserTenants);
      dispatch(setUserTenants(transformedUserTenants));

      // Set current tenant (prefer primary, fallback to first available)
      if (!currentTenant && transformedUserTenants.length > 0) {
        const primaryTenant = transformedUserTenants.find(ut => ut.is_primary) || transformedUserTenants[0];
        if (primaryTenant?.tenant) {
          console.log('useTenantAuthOptimized: Setting current tenant:', primaryTenant.tenant);
          dispatch(setCurrentTenant(primaryTenant.tenant));
          
          // Store tenant ID in localStorage for session persistence
          localStorage.setItem('currentTenantId', primaryTenant.tenant.id);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('useTenantAuthOptimized: Error in fetchUserTenants:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load tenant data'));
    } finally {
      dispatch(setLoading(false));
      fetchingRef.current = false;
    }
  }, [dispatch, currentTenant]);

  const switchTenant = useCallback(async (tenantId: string) => {
    const targetUserTenant = userTenants.find(ut => ut.tenant_id === tenantId);
    if (targetUserTenant?.tenant) {
      console.log('useTenantAuthOptimized: Switching to tenant:', targetUserTenant.tenant);
      dispatch(setCurrentTenant(targetUserTenant.tenant));
      localStorage.setItem('currentTenantId', tenantId);
    }
  }, [userTenants, dispatch]);

  const clearTenantSession = useCallback(() => {
    console.log('useTenantAuthOptimized: Clearing tenant session');
    dispatch(clearTenantData());
    localStorage.removeItem('currentTenantId');
    setIsInitialized(false);
    fetchingRef.current = false;
    
    // Clear any pending initialization
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
    }
  }, [dispatch]);

  // Initialize tenant data when user logs in
  useEffect(() => {
    if (!user) {
      clearTenantSession();
      return;
    }

    if (!isInitialized && !loading && !fetchingRef.current) {
      // Try to restore current tenant from localStorage
      const storedTenantId = localStorage.getItem('currentTenantId');
      if (storedTenantId && currentTenant?.id === storedTenantId) {
        setIsInitialized(true);
        return;
      }

      // Fetch tenant data immediately (removed debounce)
      console.log('useTenantAuthOptimized: Initializing tenant data for user:', user.id);
      fetchUserTenants(user.id);
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [user, isInitialized, loading, fetchUserTenants, clearTenantSession, currentTenant]);

  // Set up real-time subscriptions for tenant changes (debounced)
  useEffect(() => {
    if (!user?.id) return;

    console.log('useTenantAuthOptimized: Setting up real-time subscriptions for user:', user.id);

    let debounceTimer: NodeJS.Timeout;

    const debouncedRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!fetchingRef.current) {
          console.log('useTenantAuthOptimized: Real-time tenant data change detected, refreshing');
          fetchUserTenants(user.id);
        }
      }, 1000);
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
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
        },
        (payload) => {
          console.log('useTenantAuthOptimized: Real-time tenant update detected:', payload.eventType);
          const payloadId = (payload.new as any)?.id || (payload.old as any)?.id;
          if (currentTenant && payloadId && payloadId === currentTenant.id) {
            debouncedRefresh();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('useTenantAuthOptimized: Cleaning up real-time subscriptions');
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUserTenants, currentTenant]);

  return {
    currentTenant,
    userTenants,
    loading: loading || !isInitialized,
    isMultiTenant: userTenants.length > 1,
    switchTenant,
    refreshTenantData: user ? () => fetchUserTenants(user.id) : async () => {},
    clearTenantSession,
    isInitialized,
  };
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

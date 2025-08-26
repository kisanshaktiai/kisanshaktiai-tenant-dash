
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tenant, UserTenant } from '@/types/tenant';
import { transformUserTenant } from '@/utils/tenantTransformers';
import { useToast } from '@/hooks/use-toast';

interface TenantContextValue {
  currentTenant: Tenant | null;
  userTenants: UserTenant[];
  loading: boolean;
  error: string | null;
  isMultiTenant: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantData: () => Promise<void>;
  clearTenantSession: () => void;
  isInitialized: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<UserTenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearTenantSession = useCallback(() => {
    console.log('Clearing tenant session');
    setCurrentTenant(null);
    setUserTenants([]);
    setError(null);
    localStorage.removeItem('currentTenantId');
  }, []);

  const fetchUserTenants = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching tenant data for user:', userId);
      
      const { data: userTenantsData, error } = await supabase
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

      if (error) {
        console.error('Error fetching user tenants:', error);
        if (error.code === 'PGRST116') {
          console.log('No tenants found for user - this is normal for new users');
          setUserTenants([]);
          return [];
        }
        throw error;
      }

      const transformedData = (userTenantsData || [])
        .filter(userTenant => userTenant.tenant && typeof userTenant.tenant === 'object')
        .map(userTenant => {
          try {
            return transformUserTenant(userTenant);
          } catch (error) {
            console.warn('Error transforming user tenant:', error);
            return null;
          }
        })
        .filter(Boolean);
      
      setUserTenants(transformedData as UserTenant[]);
      return transformedData;
    } catch (error: any) {
      console.error('Exception fetching user tenants:', error);
      setError(error.message || 'Failed to load tenant data');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTenant = useCallback(async (tenantId: string) => {
    console.log('Switching to tenant:', tenantId);
    
    const targetUserTenant = userTenants.find(ut => ut.tenant && 'id' in ut.tenant && ut.tenant.id === tenantId);
    if (targetUserTenant?.tenant && 'id' in targetUserTenant.tenant) {
      setCurrentTenant(targetUserTenant.tenant);
      localStorage.setItem('currentTenantId', tenantId);
      
      toast({
        title: 'Tenant Switched',
        description: `Switched to ${targetUserTenant.tenant.name}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Switch Failed',
        description: 'Could not find the selected tenant',
      });
    }
  }, [userTenants, toast]);

  const refreshTenantData = useCallback(async () => {
    if (!user?.id) return;
    await fetchUserTenants(user.id);
  }, [user?.id, fetchUserTenants]);

  // Initialize tenant data when user changes
  useEffect(() => {
    if (!user) {
      clearTenantSession();
      setIsInitialized(false);
      return;
    }

    const initializeTenantData = async () => {
      try {
        const tenants = await fetchUserTenants(user.id);
        
        if (tenants && tenants.length > 0) {
          // Check for stored tenant or use primary/first tenant
          const storedTenantId = localStorage.getItem('currentTenantId');
          let tenantToSet = tenants[0];
          
          if (storedTenantId) {
            const storedTenant = tenants.find(ut => ut.tenant && 'id' in ut.tenant && ut.tenant.id === storedTenantId);
            if (storedTenant) {
              tenantToSet = storedTenant;
            }
          } else {
            const primaryTenant = tenants.find(ut => ut.is_primary);
            if (primaryTenant) {
              tenantToSet = primaryTenant;
            }
          }
          
          if (tenantToSet?.tenant && 'id' in tenantToSet.tenant) {
            console.log('Setting current tenant:', tenantToSet.tenant);
            setCurrentTenant(tenantToSet.tenant);
            localStorage.setItem('currentTenantId', tenantToSet.tenant.id);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing tenant data:', error);
        setIsInitialized(true);
      }
    };

    initializeTenantData();
  }, [user, fetchUserTenants, clearTenantSession]);

  const value: TenantContextValue = {
    currentTenant,
    userTenants,
    loading: loading || !isInitialized,
    error,
    isMultiTenant: userTenants.length > 1,
    switchTenant,
    refreshTenantData,
    clearTenantSession,
    isInitialized,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

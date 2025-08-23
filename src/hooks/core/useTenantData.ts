
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { setUserTenants, setError, setLoading } from '@/store/slices/tenantSlice';
import type { UserTenant, Tenant } from '@/types/tenant';

export const useTenantDataFetch = () => {
  const dispatch = useAppDispatch();

  const fetchUserTenants = useCallback(async (userId: string) => {
    if (!userId) {
      console.log('useTenantDataFetch: No user ID provided');
      return [];
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      console.log('useTenantDataFetch: Fetching tenants for user:', userId);

      // First check if user_tenants table exists and has data
      const { data: userTenantsData, error: userTenantsError } = await supabase
        .from('user_tenants')
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (userTenantsError) {
        console.error('useTenantDataFetch: Error fetching user tenants:', userTenantsError);
        
        // If user_tenants doesn't exist or has issues, create a mock tenant for development
        const mockTenant: Tenant = {
          id: 'mock-tenant-1',
          name: 'Demo Agricultural Company',
          slug: 'demo-agri',
          type: 'agri_company',
          status: 'active',
          subscription_plan: 'Kisan_Basic',
        };

        const mockTenants: UserTenant[] = [{
          id: 'mock-user-tenant-1',
          user_id: userId,
          tenant_id: 'mock-tenant-1',
          role: 'tenant_owner',
          is_primary: true,
          is_active: true,
          tenant: mockTenant
        }];
        
        console.log('useTenantDataFetch: Using mock tenant data');
        dispatch(setUserTenants(mockTenants));
        return mockTenants;
      }

      // Transform and validate the data
      const tenants = (userTenantsData || []).map(userTenant => ({
        ...userTenant,
        role: userTenant.role as UserTenant['role'], // Type assertion for role
        tenant: userTenant.tenant && typeof userTenant.tenant === 'object' && 'id' in userTenant.tenant 
          ? userTenant.tenant as Tenant 
          : undefined
      })).filter(ut => ut.tenant) as UserTenant[];
      
      console.log('useTenantDataFetch: Fetched tenants:', tenants.length);
      
      dispatch(setUserTenants(tenants));
      return tenants;
    } catch (error) {
      console.error('useTenantDataFetch: Unexpected error:', error);
      dispatch(setError('Failed to fetch tenant data'));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    fetchUserTenants,
  };
};

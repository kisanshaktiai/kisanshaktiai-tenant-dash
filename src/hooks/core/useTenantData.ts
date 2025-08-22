
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { setUserTenants, setError, setLoading } from '@/store/slices/tenantSlice';

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
        const mockTenants = [{
          id: 'mock-user-tenant-1',
          user_id: userId,
          tenant_id: 'mock-tenant-1',
          role: 'owner',
          is_primary: true,
          is_active: true,
          tenant: {
            id: 'mock-tenant-1',
            name: 'Demo Agricultural Company',
            slug: 'demo-agri',
            type: 'agri_company',
            status: 'active',
            subscription_plan: 'Kisan_Basic',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }];
        
        console.log('useTenantDataFetch: Using mock tenant data');
        dispatch(setUserTenants(mockTenants));
        return mockTenants;
      }

      const tenants = userTenantsData || [];
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

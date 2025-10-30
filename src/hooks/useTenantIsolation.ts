
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'tenants' | 'farmers' | 'products' | 'user_tenants' | 'onboarding_workflows' | 'onboarding_steps';

interface TenantValidation {
  userId: string;
  tenantId: string;
}

export const useTenantIsolation = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  const getTenantId = () => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available. Please ensure user is properly authenticated and has access to a tenant.');
    }
    return currentTenant.id;
  };

  const validateTenantAccess = () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!currentTenant) {
      throw new Error('No tenant context available');
    }
    return {
      userId: user.id,
      tenantId: currentTenant.id,
    } as TenantValidation;
  };

  const createTenantQuery = (tableName: TableName) => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available');
    }
    // Explicitly type the return to avoid deep type inference
    return supabase
      .from(tableName as any)
      .select('*')
      .eq('tenant_id', currentTenant.id);
  };

  const createTenantInsert = (tableName: TableName, data: Record<string, any>) => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available');
    }
    return supabase
      .from(tableName as any)
      .insert({
        ...data,
        tenant_id: currentTenant.id,
      });
  };

  const createTenantUpdate = (tableName: TableName, id: string, data: Record<string, any>) => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available');
    }
    return supabase
      .from(tableName as any)
      .update(data)
      .eq('id', id)
      .eq('tenant_id', currentTenant.id);
  };

  const createTenantDelete = (tableName: TableName, id: string) => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available');
    }
    return supabase
      .from(tableName as any)
      .delete()
      .eq('id', id)
      .eq('tenant_id', currentTenant.id);
  };

  return {
    currentTenant,
    getTenantId,
    validateTenantAccess,
    createTenantQuery,
    createTenantInsert,
    createTenantUpdate,
    createTenantDelete,
  };
};


import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'tenants' | 'farmers' | 'products' | 'user_tenants' | 'onboarding_workflows' | 'onboarding_steps';

export const useTenantIsolation = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  const getTenantId = useCallback(() => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available. Please ensure user is properly authenticated and has access to a tenant.');
    }
    return currentTenant.id;
  }, [currentTenant?.id]);

  const validateTenantAccess = useCallback(() => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!currentTenant) {
      throw new Error('No tenant context available');
    }
    return {
      userId: user.id,
      tenantId: currentTenant.id,
    };
  }, [user, currentTenant]);

  const createTenantQuery = useCallback((tableName: TableName) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

  const createTenantInsert = useCallback((tableName: TableName, data: Record<string, unknown>) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .insert({
        ...data,
        tenant_id: tenantId,
      });
  }, [getTenantId]);

  const createTenantUpdate = useCallback((tableName: TableName, id: string, data: Record<string, unknown>) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

  const createTenantDelete = useCallback((tableName: TableName, id: string) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

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

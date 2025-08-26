
import { useCallback } from 'react';
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

  const getTenantId = useCallback((): string => {
    if (!currentTenant?.id) {
      throw new Error('No current tenant available. Please ensure user is properly authenticated and has access to a tenant.');
    }
    return currentTenant.id;
  }, [currentTenant?.id]);

  const validateTenantAccess = useCallback((): TenantValidation => {
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

  const createTenantInsert = useCallback((tableName: TableName, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .insert({
        ...data,
        tenant_id: tenantId,
      });
  }, [getTenantId]);

  const createTenantUpdate = useCallback((tableName: TableName, id: string, data: any) => {
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

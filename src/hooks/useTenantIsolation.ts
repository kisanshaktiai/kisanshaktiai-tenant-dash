
import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';

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

  // Simplified query builder for tenant-isolated data
  const createTenantQuery = useCallback((table: string) => {
    const tenantId = getTenantId();
    return supabase
      .from(table as any)
      .select('*')
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

  const createTenantInsert = useCallback((table: string, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(table as any)
      .insert({
        ...data,
        tenant_id: tenantId,
      });
  }, [getTenantId]);

  const createTenantUpdate = useCallback((table: string, id: string, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(table as any)
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

  const createTenantDelete = useCallback((table: string, id: string) => {
    const tenantId = getTenantId();
    return supabase
      .from(table as any)
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

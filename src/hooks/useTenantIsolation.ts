
import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Define a more constrained type for table names to avoid infinite recursion
type TableName = keyof Database['public']['Tables'];

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

  const createTenantQuery = useCallback(<T extends TableName>(table: T) => {
    const tenantId = getTenantId();
    return supabase
      .from(table)
      .select('*')
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

  const createTenantInsert = useCallback(<T extends TableName>(table: T, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(table)
      .insert({
        ...data,
        tenant_id: tenantId,
      });
  }, [getTenantId]);

  const createTenantUpdate = useCallback(<T extends TableName>(table: T, id: string, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
  }, [getTenantId]);

  const createTenantDelete = useCallback(<T extends TableName>(table: T, id: string) => {
    const tenantId = getTenantId();
    return supabase
      .from(table)
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

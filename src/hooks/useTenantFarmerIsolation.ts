import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that ensures proper tenant and farmer isolation for all data operations
 * Provides consistent tenant and farmer context across the application
 */
export const useTenantFarmerIsolation = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  /**
   * Get current tenant ID with validation
   */
  const getTenantId = (): string => {
    if (!currentTenant?.id) {
      throw new Error('No tenant context available. User must be associated with a tenant.');
    }
    return currentTenant.id;
  };

  /**
   * Get current farmer ID from JWT claims or context
   */
  const getFarmerId = (): string | null => {
    try {
      // Try to get farmer ID from JWT claims
      const farmerId = (user as any)?.user_metadata?.farmer_id;
      if (farmerId) return farmerId;
      
      // Try from app context
      const contextFarmerId = sessionStorage.getItem('current_farmer_id');
      if (contextFarmerId) return contextFarmerId;
      
      return null;
    } catch {
      return null;
    }
  };

  /**
   * Create a query with automatic tenant isolation
   */
  const createTenantQuery = (tableName: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', tenantId);
  };

  /**
   * Create a query with both tenant and farmer isolation
   */
  const createFarmerQuery = (tableName: any, farmerId?: string) => {
    const tenantId = getTenantId();
    const farmerIdToUse = farmerId || getFarmerId();
    
    if (!farmerIdToUse) {
      throw new Error('Farmer ID is required for this operation');
    }

    return supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerIdToUse);
  };

  /**
   * Insert data with automatic tenant isolation
   */
  const insertWithTenant = async (tableName: any, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .insert({
        ...data,
        tenant_id: tenantId,
      });
  };

  /**
   * Insert data with both tenant and farmer isolation
   */
  const insertWithFarmer = async (tableName: any, data: any, farmerId?: string) => {
    const tenantId = getTenantId();
    const farmerIdToUse = farmerId || getFarmerId();
    
    if (!farmerIdToUse) {
      throw new Error('Farmer ID is required for this operation');
    }

    return supabase
      .from(tableName)
      .insert({
        ...data,
        tenant_id: tenantId,
        farmer_id: farmerIdToUse,
      });
  };

  /**
   * Update data with automatic tenant isolation
   */
  const updateWithTenant = async (tableName: any, id: string, data: any) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId);
  };

  /**
   * Update data with both tenant and farmer isolation
   */
  const updateWithFarmer = async (
    tableName: any, 
    id: string, 
    data: any, 
    farmerId?: string
  ) => {
    const tenantId = getTenantId();
    const farmerIdToUse = farmerId || getFarmerId();
    
    if (!farmerIdToUse) {
      throw new Error('Farmer ID is required for this operation');
    }

    return supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerIdToUse);
  };

  /**
   * Delete data with automatic tenant isolation
   */
  const deleteWithTenant = async (tableName: any, id: string) => {
    const tenantId = getTenantId();
    return supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
  };

  /**
   * Delete data with both tenant and farmer isolation
   */
  const deleteWithFarmer = async (
    tableName: any, 
    id: string, 
    farmerId?: string
  ) => {
    const tenantId = getTenantId();
    const farmerIdToUse = farmerId || getFarmerId();
    
    if (!farmerIdToUse) {
      throw new Error('Farmer ID is required for this operation');
    }

    return supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerIdToUse);
  };

  /**
   * Set custom CORS headers with tenant and farmer context
   */
  const getCorsHeaders = (farmerId?: string): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const tenantId = getTenantId();
      headers['X-Tenant-ID'] = tenantId;
    } catch {
      // Tenant might not be available in some contexts
    }

    const farmerIdToUse = farmerId || getFarmerId();
    if (farmerIdToUse) {
      headers['X-Farmer-ID'] = farmerIdToUse;
    }

    return headers;
  };

  /**
   * Validate if current user has access to a specific tenant
   */
  const validateTenantAccess = (tenantId: string): boolean => {
    return currentTenant?.id === tenantId;
  };

  /**
   * Validate if current context has access to a specific farmer
   */
  const validateFarmerAccess = async (farmerId: string): Promise<boolean> => {
    try {
      const tenantId = getTenantId();
      const { data, error } = await supabase
        .from('farmers')
        .select('id')
        .eq('id', farmerId)
        .eq('tenant_id', tenantId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  };

  return {
    // Context getters
    getTenantId,
    getFarmerId,
    currentTenant,
    
    // Query builders
    createTenantQuery,
    createFarmerQuery,
    
    // CRUD operations
    insertWithTenant,
    insertWithFarmer,
    updateWithTenant,
    updateWithFarmer,
    deleteWithTenant,
    deleteWithFarmer,
    
    // Utilities
    getCorsHeaders,
    validateTenantAccess,
    validateFarmerAccess,
    
    // Flags
    hasTenantContext: !!currentTenant?.id,
    hasFarmerContext: !!getFarmerId(),
  };
};
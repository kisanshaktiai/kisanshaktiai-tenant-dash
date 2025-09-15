/**
 * Enhanced Farmers Data Hook with Real-time Updates
 * Wraps the centralized TenantDataService with farmer-specific logic
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { TenantDataService, type QueryOptions } from '@/services/core/TenantDataService';
import { useRealtimeTenantData } from '../useRealtimeTenantData';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

export interface Farmer {
  id: string;
  tenant_id: string;
  farmer_code: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  total_land_acres?: number;
  primary_crop?: string;
  farming_experience_years?: number;
  has_irrigation?: boolean;
  has_tractor?: boolean;
  has_storage?: boolean;
  is_verified?: boolean;
  verification_date?: string;
  onboarded_by?: string;
  total_app_opens?: number;
  last_app_open?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  farmer_profiles?: any;
  farmer_land_holdings?: any[];
  farmer_notes?: any[];
  farmer_tags?: any[];
}

export interface CreateFarmerData extends Omit<Farmer, 'id' | 'created_at' | 'updated_at' | 'tenant_id'> {}
export interface UpdateFarmerData extends Partial<CreateFarmerData> {}

/**
 * Hook to fetch farmers list with real-time updates
 */
export const useRealtimeFarmersData = (options: QueryOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';
  
  const queryKey = queryKeys.farmersList(tenantId, options);
  
  // Setup real-time subscription
  const realtimeStatus = useRealtimeTenantData({
    tableName: 'farmers',
    tenantId,
    queryKey,
    enabled: !!tenantId
  });

  // Main query
  const query = useQuery({
    queryKey,
    queryFn: () => TenantDataService.fetchTenantTableData<Farmer>(
      'farmers',
      tenantId,
      {
        ...options,
        searchFields: ['full_name', 'farmer_code', 'mobile_number'],
        includeRelations: []
      }
    ),
    enabled: !!tenantId,
    staleTime: realtimeStatus.isConnected ? 30000 : 5000, // Longer stale time when real-time is connected
    refetchInterval: realtimeStatus.isConnected ? false : 30000, // Fallback polling if disconnected
  });

  return {
    ...query,
    realtimeStatus
  };
};

/**
 * Hook to fetch a single farmer with real-time updates
 */
export const useRealtimeFarmerData = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';
  
  const queryKey = queryKeys.farmer(farmerId, tenantId);
  
  // Setup real-time subscription
  const realtimeStatus = useRealtimeTenantData({
    tableName: 'farmers',
    tenantId,
    queryKey,
    enabled: !!tenantId && !!farmerId
  });

  const query = useQuery({
    queryKey,
    queryFn: () => TenantDataService.fetchTenantRecord<Farmer>(
      'farmers',
      farmerId,
      tenantId,
      {
        includeRelations: []
      }
    ),
    enabled: !!tenantId && !!farmerId,
    staleTime: realtimeStatus.isConnected ? 30000 : 5000,
  });

  return {
    ...query,
    realtimeStatus
  };
};

/**
 * Hook to create a farmer
 */
export const useCreateFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';

  return useMutation({
    mutationFn: async (data: CreateFarmerData) => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      // Generate farmer code
      const count = await TenantDataService.countTenantRecords('farmers', tenantId);
      const tenantSlug = currentTenant?.slug?.toUpperCase().substring(0, 3) || 'KIS';
      const farmerCode = `${tenantSlug}${String(count + 1).padStart(6, '0')}`;

      return TenantDataService.createTenantRecord<Farmer>(
        'farmers',
        {
          ...data,
          farmer_code: farmerCode
        },
        tenantId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerStats(tenantId) });
      toast.success('Farmer created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create farmer');
    }
  });
};

/**
 * Hook to update a farmer
 */
export const useUpdateFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';

  return useMutation({
    mutationFn: ({ farmerId, data }: { farmerId: string; data: UpdateFarmerData }) => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      return TenantDataService.updateTenantRecord<Farmer>(
        'farmers',
        farmerId,
        data,
        tenantId
      );
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.farmer(variables.farmerId, tenantId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers(tenantId) });
      toast.success('Farmer updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update farmer');
    }
  });
};

/**
 * Hook to delete a farmer
 */
export const useDeleteFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';

  return useMutation({
    mutationFn: (farmerId: string) => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      return TenantDataService.deleteTenantRecord('farmers', farmerId, tenantId);
    },
    onSuccess: (_, farmerId) => {
      queryClient.removeQueries({ queryKey: queryKeys.farmer(farmerId, tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerStats(tenantId) });
      toast.success('Farmer deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete farmer');
    }
  });
};
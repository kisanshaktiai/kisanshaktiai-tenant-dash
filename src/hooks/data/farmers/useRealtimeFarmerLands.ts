/**
 * Farmer Lands Hook with Real-time Updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { TenantDataService } from '@/services/core/TenantDataService';
import { useRealtimeTenantData } from '../useRealtimeTenantData';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

export interface FarmerLand {
  id: string;
  tenant_id: string;
  farmer_id: string;
  land_name: string;
  land_size_acres: number;
  land_type?: string;
  soil_type?: string;
  water_source?: string;
  location?: any; // JSONB
  coordinates?: any; // JSONB
  is_irrigated?: boolean;
  ownership_type?: string;
  survey_number?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealtimeFarmerLands = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';
  
  const queryKey = queryKeys.farmerLands(farmerId || 'all', tenantId);
  
  const realtimeStatus = useRealtimeTenantData({
    tableName: 'lands',
    tenantId,
    queryKey,
    enabled: !!tenantId
  });

  const query = useQuery({
    queryKey,
    queryFn: () => TenantDataService.fetchTenantTableData<FarmerLand>(
      'lands',
      tenantId,
      {
        filters: farmerId ? { farmer_id: farmerId } : {},
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 100
      }
    ),
    enabled: !!tenantId,
    staleTime: realtimeStatus.isConnected ? 30000 : 5000,
  });

  return {
    ...query,
    realtimeStatus
  };
};

export const useCreateFarmerLandMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';

  return useMutation({
    mutationFn: (data: Omit<FarmerLand, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      return TenantDataService.createTenantRecord<FarmerLand>(
        'lands',
        data,
        tenantId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farmerLands(variables.farmer_id, tenantId) 
      });
      toast.success('Land added successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add land');
    }
  });
};

export const useUpdateFarmerLandMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';

  return useMutation({
    mutationFn: ({ landId, data }: { 
      landId: string; 
      data: Partial<FarmerLand>;
    }) => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      return TenantDataService.updateTenantRecord<FarmerLand>(
        'lands',
        landId,
        data,
        tenantId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farmerLands('all', tenantId) 
      });
      toast.success('Land updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update land');
    }
  });
};
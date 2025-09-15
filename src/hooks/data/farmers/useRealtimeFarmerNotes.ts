/**
 * Farmer Notes Hook with Real-time Updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { TenantDataService } from '@/services/core/TenantDataService';
import { useRealtimeTenantData } from '../useRealtimeTenantData';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

export interface FarmerNote {
  id: string;
  tenant_id: string;
  farmer_id: string;
  note: string;
  created_by?: string;
  is_private?: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealtimeFarmerNotes = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';
  
  const queryKey = queryKeys.farmerNotes(farmerId, tenantId);
  
  const realtimeStatus = useRealtimeTenantData({
    tableName: 'notifications',
    tenantId,
    queryKey,
    enabled: !!tenantId && !!farmerId
  });

  const query = useQuery({
    queryKey,
    queryFn: () => TenantDataService.fetchTenantTableData<FarmerNote>(
      'notifications',
      tenantId,
      {
        filters: { farmer_id: farmerId },
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 50
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

export const useAddFarmerNoteMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const tenantId = currentTenant?.id || '';

  return useMutation({
    mutationFn: ({ farmerId, note, isPrivate = false }: { 
      farmerId: string; 
      note: string; 
      isPrivate?: boolean;
    }) => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      return TenantDataService.createTenantRecord<FarmerNote>(
        'notifications',
        {
          farmer_id: farmerId,
          note,
          is_private: isPrivate,
          created_by: user?.id
        },
        tenantId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farmerNotes(variables.farmerId, tenantId) 
      });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add note');
    }
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedFarmerDataService as farmerManagementService, type BulkOperationRequest, type FarmerSegment } from '@/services/EnhancedFarmerDataService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export const useFarmerEngagementQuery = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerEngagement(currentTenant?.id || '', farmerId),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.getEngagementMetrics(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant,
  });
};

export const useFarmerTagsQuery = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerTags(currentTenant?.id || '', farmerId),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.getFarmerTags(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant,
  });
};

export const useFarmerNotesQuery = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerNotes(farmerId, currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.getFarmerNotes(farmerId, currentTenant.id);
    },
    enabled: !!currentTenant && !!farmerId,
  });
};

export const useCommunicationHistoryQuery = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.communicationHistory(farmerId, currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.getCommunicationHistory(farmerId, currentTenant.id);
    },
    enabled: !!currentTenant && !!farmerId,
  });
};

export const useFarmerSegmentsQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerSegments(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.getFarmerSegments(currentTenant.id) as Promise<FarmerSegment[]>;
    },
    enabled: !!currentTenant,
  });
};

export const useAdvancedFarmerSearchQuery = (searchParams: any) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.advancedFarmerSearch(currentTenant?.id || '', searchParams),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.searchFarmers(currentTenant.id, searchParams);
    },
    enabled: !!currentTenant,
  });
};

// Mutations
export const useAddFarmerTagMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: ({ farmerId, tagData }: { farmerId: string; tagData: any }) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.addFarmerTag(farmerId, currentTenant.id, tagData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerTags(currentTenant?.id || '') });
      toast.success('Tag added successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add tag');
    },
  });
};

export const useAddFarmerNoteMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: ({ farmerId, noteData }: { farmerId: string; noteData: any }) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.addFarmerNote(farmerId, currentTenant.id, noteData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farmerNotes(variables.farmerId, currentTenant?.id || '') 
      });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add note');
    },
  });
};

export const useCreateFarmerSegmentMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: (segmentData: Omit<FarmerSegment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.createFarmerSegment(currentTenant.id, segmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerSegments(currentTenant?.id || '') });
      toast.success('Segment created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create segment');
    },
  });
};

export const useBulkOperationMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: (operation: BulkOperationRequest) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmerManagementService.performBulkOperation(currentTenant.id, operation);
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers(currentTenant?.id || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerTags(currentTenant?.id || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerSegments(currentTenant?.id || '') });
      
      toast.success(`Bulk operation completed: ${result.success} successful, ${result.failed} failed`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bulk operation failed');
    },
  });
};

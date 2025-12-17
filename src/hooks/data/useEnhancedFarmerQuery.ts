
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedFarmerDataService as enhancedFarmerService, type AdvancedSearchFilters, type FarmerTag, type FarmerNote, type FarmerSegment, type FarmerLead } from '@/services/EnhancedFarmerDataService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

// Farmer Tags Hooks
export const useFarmerTagsQuery = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerTags(currentTenant?.id || '', farmerId),
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getFarmerTags(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant,
  });
};

export const useAddFarmerTagMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: ({ farmerId, tagData }: { farmerId: string; tagData: { tag_name: string; tag_color?: string; created_by?: string } }) => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.addFarmerTag(currentTenant.id, farmerId, tagData);
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

// Farmer Segments Hooks
export const useFarmerSegmentsQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerSegments(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getFarmerSegments(currentTenant.id) as Promise<FarmerSegment[]>;
    },
    enabled: !!currentTenant,
  });
};

export const useCreateFarmerSegmentMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: (segmentData: Omit<FarmerSegment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.createFarmerSegment(currentTenant.id, segmentData);
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

// Farmer Notes Hooks
export const useFarmerNotesQuery = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerNotes(farmerId, currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getFarmerNotes(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant && !!farmerId,
  });
};

export const useAddFarmerNoteMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: ({ farmerId, noteData }: { farmerId: string; noteData: { note_content: string; created_by?: string; is_important?: boolean; is_private?: boolean } }) => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.addFarmerNote(currentTenant.id, farmerId, noteData);
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

// Communication History Hook
export const useCommunicationHistoryQuery = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.communicationHistory(farmerId || 'all', currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getCommunicationHistory(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant,
  });
};

// Farmer Engagement Hook
export const useFarmerEngagementQuery = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerEngagement(currentTenant?.id || '', farmerId),
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getFarmerEngagement(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant,
  });
};

// Lead Management Hooks
export const useFarmerLeadsQuery = (filters?: { status?: string; assigned_to?: string }) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['farmer-leads', currentTenant?.id, filters],
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getFarmerLeads(currentTenant.id, filters);
    },
    enabled: !!currentTenant,
  });
};

export const useCreateFarmerLeadMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: (leadData: { lead_source: string; contact_name: string; phone?: string; email?: string; location?: Record<string, any>; land_size?: number; crops_interested?: string[]; lead_score?: number; status?: string; assigned_to?: string; assigned_at?: string; converted_farmer_id?: string; converted_at?: string; next_follow_up?: string; notes?: string; metadata?: Record<string, any> }) => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.createFarmerLead(currentTenant.id, { 
        ...leadData, 
        lead_score: leadData.lead_score || 0,
        status: (leadData.status as any) || 'new',
        metadata: leadData.metadata || {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead');
    },
  });
};

// Advanced Search Hook
export const useAdvancedFarmerSearchQuery = (filters: AdvancedSearchFilters) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.advancedFarmerSearch(currentTenant?.id || '', filters),
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.searchFarmersAdvanced(currentTenant.id, filters);
    },
    enabled: !!currentTenant,
  });
};

// Bulk Operations Hook
export const useBulkOperationsQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['bulk-operations', currentTenant?.id],
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.getBulkOperations(currentTenant.id);
    },
    enabled: !!currentTenant,
  });
};

export const useCreateBulkOperationMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: (operationData: any) => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerService.createBulkOperation(currentTenant.id, operationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-operations'] });
      toast.success('Bulk operation started successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to start bulk operation');
    },
  });
};

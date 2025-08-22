
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/services/CampaignService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { Campaign } from '@/types/campaign';
import { toast } from 'sonner';

export const useCampaignsQuery = () => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: ['campaigns', getTenantId()],
    queryFn: () => campaignService.getCampaigns(getTenantId()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCampaignQuery = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaign(id),
    enabled: !!id,
  });
};

export const useCampaignTemplatesQuery = () => {
  return useQuery({
    queryKey: ['campaign-templates'],
    queryFn: () => campaignService.getCampaignTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCampaignStatsQuery = () => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: ['campaign-stats', getTenantId()],
    queryFn: () => campaignService.getCampaignStats(getTenantId()),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();
  const { getTenantId } = useTenantIsolation();

  return useMutation({
    mutationFn: (campaign: Partial<Campaign>) => 
      campaignService.createCampaign({
        ...campaign,
        tenant_id: getTenantId()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign');
      console.error('Create campaign error:', error);
    },
  });
};

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Campaign> }) =>
      campaignService.updateCampaign(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] });
      toast.success('Campaign updated successfully');
    },
    onError: () => {
      toast.error('Failed to update campaign');
    },
  });
};

export const useDeleteCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] });
      toast.success('Campaign deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete campaign');
    },
  });
};

export const useDuplicateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignService.duplicateCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated successfully');
    },
    onError: () => {
      toast.error('Failed to duplicate campaign');
    },
  });
};

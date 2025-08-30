
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

// Organization Settings
export const useOrganizationSettings = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { toast } = useToast();

  const query = useQuery({
    queryKey: queryKeys.tenantSettings(currentTenant?.id || ''),
    queryFn: () => settingsService.getOrganizationSettings(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  const mutation = useMutation({
    mutationFn: (settings: any) => 
      settingsService.upsertOrganizationSettings(currentTenant!.id, settings),
    onSuccess: () => {
      toast({ title: 'Organization settings updated successfully' });
      query.refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update organization settings',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

// Security Settings
export const useSecuritySettings = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['security-settings', currentTenant?.id],
    queryFn: () => settingsService.getSecuritySettings(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  const mutation = useMutation({
    mutationFn: (settings: any) => 
      settingsService.upsertSecuritySettings(currentTenant!.id, settings),
    onSuccess: () => {
      toast({ title: 'Security settings updated successfully' });
      query.refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update security settings',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

// Notification Preferences
export const useNotificationPreferences = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['notification-preferences', user?.id, currentTenant?.id],
    queryFn: () => settingsService.getNotificationPreferences(user!.id, currentTenant!.id),
    enabled: !!user?.id && !!currentTenant?.id,
  });

  const mutation = useMutation({
    mutationFn: (preferences: any) => 
      settingsService.upsertNotificationPreferences(user!.id, currentTenant!.id, preferences),
    onSuccess: () => {
      toast({ title: 'Notification preferences updated successfully' });
      query.refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update notification preferences',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

// Data Privacy Settings
export const useDataPrivacySettings = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['data-privacy-settings', currentTenant?.id],
    queryFn: () => settingsService.getDataPrivacySettings(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  const mutation = useMutation({
    mutationFn: (settings: any) => 
      settingsService.upsertDataPrivacySettings(currentTenant!.id, settings),
    onSuccess: () => {
      toast({ title: 'Data privacy settings updated successfully' });
      query.refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update data privacy settings',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

// Localization Settings
export const useLocalizationSettings = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['localization-settings', currentTenant?.id],
    queryFn: () => settingsService.getLocalizationSettings(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  const mutation = useMutation({
    mutationFn: (settings: any) => 
      settingsService.upsertLocalizationSettings(currentTenant!.id, settings),
    onSuccess: () => {
      toast({ title: 'Localization settings updated successfully' });
      query.refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update localization settings',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

// API Keys
export const useApiKeys = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['api-keys', currentTenant?.id],
    queryFn: () => settingsService.getApiKeys(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (keyData: any) => 
      settingsService.createApiKey(currentTenant!.id, keyData),
    onSuccess: () => {
      toast({ title: 'API key created successfully' });
      queryClient.invalidateQueries({ queryKey: ['api-keys', currentTenant?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create API key',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => settingsService.revokeApiKey(keyId),
    onSuccess: () => {
      toast({ title: 'API key revoked successfully' });
      queryClient.invalidateQueries({ queryKey: ['api-keys', currentTenant?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to revoke API key',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createApiKey: createMutation.mutate,
    revokeApiKey: revokeMutation.mutate,
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
  };
};

// Team Invitations
export const useTeamInvitations = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['team-invitations', currentTenant?.id],
    queryFn: () => settingsService.getTeamInvitations(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: (inviteData: any) => 
      settingsService.inviteTeamMember(currentTenant!.id, inviteData),
    onSuccess: () => {
      toast({ title: 'Team member invited successfully' });
      queryClient.invalidateQueries({ queryKey: ['team-invitations', currentTenant?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to invite team member',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: (invitationId: string) => settingsService.resendInvitation(invitationId),
    onSuccess: () => {
      toast({ title: 'Invitation resent successfully' });
      queryClient.invalidateQueries({ queryKey: ['team-invitations', currentTenant?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to resend invitation',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (invitationId: string) => settingsService.cancelInvitation(invitationId),
    onSuccess: () => {
      toast({ title: 'Invitation cancelled successfully' });
      queryClient.invalidateQueries({ queryKey: ['team-invitations', currentTenant?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to cancel invitation',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    inviteTeamMember: inviteMutation.mutate,
    resendInvitation: resendMutation.mutate,
    cancelInvitation: cancelMutation.mutate,
    isInviting: inviteMutation.isPending,
    isResending: resendMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};

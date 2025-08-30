
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { appearanceSettingsService, AppearanceSettings } from '@/services/AppearanceSettingsService';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const useAppearanceSettings = () => {
  const { currentTenant } = useTenantIsolation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['appearance-settings', currentTenant?.id],
    queryFn: () => currentTenant ? appearanceSettingsService.getAppearanceSettings(currentTenant.id) : null,
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (newSettings: Partial<AppearanceSettings>) => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant');
      }
      return appearanceSettingsService.upsertAppearanceSettings({
        ...newSettings,
        tenant_id: currentTenant.id
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['appearance-settings', currentTenant?.id], data);
      
      // Apply theme changes immediately
      console.log('Theme updated successfully, applying colors:', data);
      appearanceSettingsService.applyThemeColors(data);
      
      // Update sessionStorage for persistence
      sessionStorage.setItem('current-theme-settings', JSON.stringify(data));
      
      toast({
        title: "Appearance updated",
        description: "Your theme preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update appearance",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Apply theme colors when settings are first loaded
  useEffect(() => {
    if (settings && currentTenant?.id) {
      console.log('Settings loaded, applying theme colors:', settings);
      appearanceSettingsService.applyThemeColors(settings);
      
      // Update sessionStorage
      sessionStorage.setItem('current-theme-settings', JSON.stringify(settings));
    }
  }, [settings, currentTenant?.id]);

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};

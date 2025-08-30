
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
      appearanceSettingsService.applyThemeColors(data);
      
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

  // Apply theme colors when settings are loaded
  useEffect(() => {
    if (settings) {
      appearanceSettingsService.applyThemeColors(settings);
    }
    
    return () => {
      // Cleanup on unmount
      appearanceSettingsService.resetThemeColors();
    };
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};

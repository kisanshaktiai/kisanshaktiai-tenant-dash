
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appearanceSettingsService, AppearanceSettings, AppearanceSettingsUpdate } from '@/services/AppearanceSettingsService';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

export const useAppearanceSettings = () => {
  const { currentTenant } = useTenantContextOptimized();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.tenantSettings(currentTenant?.id || ''),
    queryFn: () => currentTenant ? appearanceSettingsService.getAppearanceSettings(currentTenant.id) : null,
    enabled: !!currentTenant?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: AppearanceSettingsUpdate) => {
      if (!currentTenant) throw new Error('No tenant selected');
      return appearanceSettingsService.upsertAppearanceSettings(currentTenant.id, updates);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.tenantSettings(currentTenant?.id || ''), data);
      toast({
        title: "Settings updated",
        description: "Your appearance settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating appearance settings:', error);
      toast({
        title: "Update failed", 
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const applyThemeToDocument = (settings: AppearanceSettings | null) => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary', settings.primary_color);
    root.style.setProperty('--secondary', settings.secondary_color);
    root.style.setProperty('--accent', settings.accent_color);
    root.style.setProperty('--background', settings.background_color);
    root.style.setProperty('--foreground', settings.text_color);
    
    // Apply theme mode class
    root.classList.remove('light', 'dark');
    if (settings.theme_mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme_mode);
    }
    
    // Apply font family
    if (settings.font_family) {
      root.style.setProperty('--font-family', settings.font_family);
    }
  };

  // Apply theme when settings change
  useEffect(() => {
    if (settings) {
      applyThemeToDocument(settings);
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};

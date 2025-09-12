import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantAuthStable } from '@/hooks/useTenantAuthStable';
import { useToast } from '@/hooks/use-toast';
import { useRef, useCallback } from 'react';

export interface WhiteLabelConfig {
  id?: string;
  tenant_id: string;
  
  // Brand Identity
  app_name?: string;
  app_logo_url?: string;
  app_icon_url?: string;
  app_splash_screen_url?: string;
  
  // Core Colors
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  success_color?: string;
  warning_color?: string;
  error_color?: string;
  info_color?: string;
  
  // Mobile App Settings
  bundle_identifier?: string;
  android_package_name?: string;
  ios_app_id?: string;
  
  // Mobile Theme
  mobile_theme?: any;
  
  // Configuration Objects
  app_store_config?: any;
  play_store_config?: any;
  pwa_config?: any;
  mobile_features?: any;
  notification_config?: any;
  deep_link_config?: any;
  mobile_ui_config?: any;
  
  // Metadata
  is_active?: boolean;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export const useWhiteLabelSettingsOptimized = () => {
  const { currentTenant } = useTenantAuthStable();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController>();

  // Optimized fetch function
  const fetchWhiteLabelConfig = useCallback(async (tenantId: string): Promise<WhiteLabelConfig | null> => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const { data, error } = await supabase
        .from('white_label_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No config exists, return null
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching white label config:', error);
      return null;
    }
  }, []);

  // Query with optimized settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['white-label-settings-optimized', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return fetchWhiteLabelConfig(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep cache for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: 1,
    retryDelay: 1000,
  });

  // Optimized update mutation
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<WhiteLabelConfig>) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      
      const payload = {
        ...updates,
        tenant_id: currentTenant.id,
        updated_at: new Date().toISOString(),
      };

      // Check if config exists
      const { data: existing } = await supabase
        .from('white_label_configs')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('white_label_configs')
          .update(payload)
          .eq('tenant_id', currentTenant.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('white_label_configs')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      // Update cache immediately
      queryClient.setQueryData(['white-label-settings-optimized', currentTenant?.id], data);
      
      toast({
        title: "Settings updated",
        description: "Your white label configuration has been saved.",
      });
    },
    onError: (error) => {
      console.error('Failed to update white label settings:', error);
      toast({
        title: "Update failed",
        description: "Failed to save white label configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
    cleanup,
  };
};
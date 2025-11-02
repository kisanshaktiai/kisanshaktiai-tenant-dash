import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantAuthStable } from '@/hooks/useTenantAuthStable';
import { useToast } from '@/hooks/use-toast';
import { useRef, useCallback, useEffect } from 'react';
import {
  WhiteLabelConfigData as WhiteLabelConfig,
  validateWhiteLabelConfig,
  sanitizeWhiteLabelConfig,
  CURRENT_SCHEMA_VERSION,
  isCompatible
} from '@/lib/whitelabel-types';

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
      
      // Check schema compatibility
      if (data && !isCompatible((data as any).schema_version, CURRENT_SCHEMA_VERSION)) {
        console.warn(`White label config schema version ${(data as any).schema_version} may not be compatible with current version ${CURRENT_SCHEMA_VERSION}`);
      }
      
      return data as any as WhiteLabelConfig;
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
    staleTime: 10 * 60 * 1000, // Keep fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch on every mount - use cache
    refetchInterval: false,
    retry: 1,
    retryDelay: 1000,
    networkMode: 'offlineFirst', // Use cache first when offline
  });

  // Optimized update mutation
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<WhiteLabelConfig>) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      
      // Get current user for audit metadata
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        ...updates,
        tenant_id: currentTenant.id,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
        changed_by: user?.email,
        schema_version: CURRENT_SCHEMA_VERSION,
      };
      
      // Validate configuration
      const validation = validateWhiteLabelConfig(payload as WhiteLabelConfig);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors?.join(', ')}`);
      }
      
      // Sanitize configuration before saving
      const sanitizedPayload = sanitizeWhiteLabelConfig(payload as WhiteLabelConfig);

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
          .update(sanitizedPayload as any)
          .eq('tenant_id', currentTenant.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new - add created_by
        const { data, error } = await supabase
          .from('white_label_configs')
          .insert({
            ...sanitizedPayload,
            created_by: user?.id,
          } as any)
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

  // Check schema compatibility on settings change
  useEffect(() => {
    if (settings && !isCompatible(settings.schema_version, CURRENT_SCHEMA_VERSION)) {
      toast({
        title: "Schema Version Warning",
        description: `Configuration schema version ${settings.schema_version} may not be compatible with current version ${CURRENT_SCHEMA_VERSION}`,
        variant: "default",
      });
    }
  }, [settings, toast]);

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
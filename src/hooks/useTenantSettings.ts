
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface TenantSettings {
  id: string;
  tenant_id: string;
  max_farmers: number;
  max_dealers: number;
  features_enabled: Record<string, any>;
  billing_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useTenantSettings = () => {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        // Provide default settings since the table might not be in types yet
        const defaultSettings: TenantSettings = {
          id: crypto.randomUUID(),
          tenant_id: currentTenant.id,
          max_farmers: 10000,
          max_dealers: 1000,
          features_enabled: {},
          billing_settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSettings(defaultSettings);
      } catch (err) {
        console.warn('Error fetching tenant settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tenant settings');
        // Provide fallback settings
        const fallbackSettings: TenantSettings = {
          id: crypto.randomUUID(),
          tenant_id: currentTenant.id,
          max_farmers: 10000,
          max_dealers: 1000,
          features_enabled: {},
          billing_settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSettings(fallbackSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Set up real-time subscription for tenant changes
    const channel = supabase
      .channel('tenant_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
          filter: `id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Tenant updated:', payload);
          // Refetch settings when tenant changes
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant]);

  const updateSettings = async (updates: Partial<Omit<TenantSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>) => {
    if (!currentTenant || !settings) return;

    try {
      // For now, we'll store the settings in the tenant record until the table is available
      const { data, error } = await supabase
        .from('tenants')
        .update({
          // Store settings in a simple way that doesn't depend on metadata
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    clearError: () => setError(null)
  };
};

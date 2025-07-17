
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
        const { data, error } = await supabase
          .from('tenant_settings')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .single();

        if (error) {
          // If no settings exist, create default ones
          if (error.code === 'PGRST116') {
            const { data: newSettings, error: createError } = await supabase
              .from('tenant_settings')
              .insert({
                tenant_id: currentTenant.id,
                max_farmers: 10000,
                max_dealers: 1000,
                features_enabled: {},
                billing_settings: {}
              })
              .select()
              .single();

            if (createError) throw createError;
            setSettings(newSettings);
          } else {
            throw error;
          }
        } else {
          setSettings(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenant settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Set up real-time subscription
    const channel = supabase
      .channel('tenant_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_settings',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSettings(payload.new as TenantSettings);
          } else if (payload.eventType === 'INSERT') {
            setSettings(payload.new as TenantSettings);
          }
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
      const { data, error } = await supabase
        .from('tenant_settings')
        .update(updates)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
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

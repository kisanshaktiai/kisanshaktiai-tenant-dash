
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
        setLoading(true);
        setError(null);

        console.log('Fetching tenant settings for:', currentTenant.id);

        // Get tenant data directly from Supabase
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', currentTenant.id)
          .single();
        
        if (tenantError) throw tenantError;

        if (tenantData) {
          // Create settings object from tenant data
          const tenantSettings: TenantSettings = {
            id: tenantData.id,
            tenant_id: tenantData.id,
            max_farmers: tenantData.max_farmers || 10000,
            max_dealers: tenantData.max_dealers || 1000,
            features_enabled: tenantData.metadata?.features || {},
            billing_settings: tenantData.metadata?.billing || {},
            created_at: tenantData.created_at,
            updated_at: tenantData.updated_at
          };

          setSettings(tenantSettings);
        } else {
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
        }
      } catch (err) {
        console.warn('Error fetching tenant settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tenant settings');
        
        // Provide fallback settings on error
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
  }, [currentTenant]);

  const updateSettings = async (updates: Partial<Omit<TenantSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>) => {
    if (!currentTenant || !settings) return;

    try {
      console.log('Updating tenant settings:', updates);
      
      const { error } = await supabase
        .from('tenants')
        .update({
          max_farmers: updates.max_farmers || settings.max_farmers,
          max_dealers: updates.max_dealers || settings.max_dealers,
          metadata: {
            features: updates.features_enabled || settings.features_enabled,
            billing: updates.billing_settings || settings.billing_settings,
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id);
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      return true;
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

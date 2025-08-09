
import { useEffect, useState } from 'react';
import { tenantDataService } from '@/services/TenantDataService';
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

        // Try to get tenant data via edge function
        const tenantData = await tenantDataService.getTenant(currentTenant.id);
        
        if (tenantData && Array.isArray(tenantData) && tenantData.length > 0) {
          const tenant = tenantData[0];
          
          // Create settings object from tenant data
          const tenantSettings: TenantSettings = {
            id: tenant.id,
            tenant_id: tenant.id,
            max_farmers: 10000, // Default values
            max_dealers: 1000,
            features_enabled: tenant.metadata?.features || {},
            billing_settings: tenant.metadata?.billing || {},
            created_at: tenant.created_at,
            updated_at: tenant.updated_at
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
        console.warn('Error fetching tenant settings via edge function:', err);
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
      
      await tenantDataService.updateTenant(currentTenant.id, {
        metadata: {
          features: updates.features_enabled || settings.features_enabled,
          billing: updates.billing_settings || settings.billing_settings,
        },
        updated_at: new Date().toISOString()
      });
      
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

import { supabase } from '@/integrations/supabase/client';

export interface OrganizationSettings {
  id: string;
  tenant_id: string;
  business_hours?: any;
  social_links?: any;
  compliance_settings?: any;
  security_settings?: any;
  contact_info?: any;
  custom_fields?: any;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMetrics {
  total_farmers: number;
  total_dealers: number;
  total_products: number;
  active_users: number;
  storage_used_mb: number;
  engagement_rate: number;
}

class OrganizationSettingsService {
  async getSettings(tenantId: string): Promise<OrganizationSettings | null> {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching organization settings:', error);
      return null;
    }

    return data;
  }

  async upsertSettings(
    tenantId: string,
    settings: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings | null> {
    const { data, error } = await supabase
      .from('organization_settings')
      .upsert(
        {
          tenant_id: tenantId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting organization settings:', error);
      throw error;
    }

    return data;
  }

  async getMetrics(tenantId: string): Promise<OrganizationMetrics> {
    const [farmers, dealers, products] = await Promise.all([
      supabase.from('farmers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('dealers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    ]);

    return {
      total_farmers: farmers.count || 0,
      total_dealers: dealers.count || 0,
      total_products: products.count || 0,
      active_users: 0, // Will be calculated from user activity
      storage_used_mb: 0, // Will be calculated from storage
      engagement_rate: 0, // Will be calculated from activity logs
    };
  }

  async updateBusinessHours(tenantId: string, businessHours: OrganizationSettings['business_hours']) {
    return this.upsertSettings(tenantId, { business_hours: businessHours });
  }

  async updateSocialLinks(tenantId: string, socialLinks: OrganizationSettings['social_links']) {
    return this.upsertSettings(tenantId, { social_links: socialLinks });
  }

  async updateComplianceSettings(
    tenantId: string,
    complianceSettings: OrganizationSettings['compliance_settings']
  ) {
    return this.upsertSettings(tenantId, { compliance_settings: complianceSettings });
  }

  async updateSecuritySettings(
    tenantId: string,
    securitySettings: OrganizationSettings['security_settings']
  ) {
    return this.upsertSettings(tenantId, { security_settings: securitySettings });
  }
}

export const organizationSettingsService = new OrganizationSettingsService();

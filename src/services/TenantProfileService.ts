
import { supabase } from '@/integrations/supabase/client';

export interface TenantBasicData {
  name: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  business_registration?: string;
  business_address?: any;
}

export interface TenantBrandingData {
  app_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
}

export interface TenantFeaturesData {
  basic_analytics?: boolean;
  advanced_analytics?: boolean;
  ai_chat?: boolean;
  weather_forecast?: boolean;
  marketplace?: boolean;
  community_forum?: boolean;
  soil_testing?: boolean;
  satellite_imagery?: boolean;
  drone_monitoring?: boolean;
  iot_integration?: boolean;
  predictive_analytics?: boolean;
  custom_reports?: boolean;
  api_access?: boolean;
  webhook_support?: boolean;
}

export interface TeamInviteData {
  email: string;
  name: string;
  role: string;
}

class TenantProfileService {
  async updateTenantBasics(tenantId: string, data: TenantBasicData) {
    const { error } = await supabase
      .from('tenants')
      .update({
        name: data.name,
        owner_name: data.owner_name,
        owner_email: data.owner_email,
        metadata: {
          owner_phone: data.owner_phone,
          business_registration: data.business_registration,
          business_address: data.business_address,
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (error) throw error;
    return true;
  }

  async upsertBranding(tenantId: string, data: TenantBrandingData) {
    const { error } = await supabase
      .from('tenant_branding')
      .upsert({
        tenant_id: tenantId,
        app_name: data.app_name,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color || '#10B981',
        background_color: data.background_color || '#FFFFFF',
        text_color: data.text_color || '#1F2937',
        font_family: data.font_family || 'Inter',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id'
      });

    if (error) throw error;
    return true;
  }

  async upsertFeatures(tenantId: string, data: TenantFeaturesData) {
    const { error } = await supabase
      .from('tenant_features')
      .upsert({
        tenant_id: tenantId,
        ...data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id'
      });

    if (error) throw error;
    return true;
  }

  async createDataMigrationJob(tenantId: string, migrationData: any) {
    const { error } = await supabase
      .from('data_migration_jobs')
      .insert({
        tenant_id: tenantId,
        migration_type: migrationData.importMethod || 'manual',
        source_config: migrationData.sourceConfig || {},
        mapping_config: migrationData.mappingConfig || {},
        status: 'pending'
      });

    if (error) throw error;
    return true;
  }

  async inviteTeamMembers(tenantId: string, invites: TeamInviteData[]) {
    if (invites.length === 0) return true;

    const inviteRecords = invites.map(invite => ({
      tenant_id: tenantId,
      email: invite.email,
      role: invite.role,
      invited_name: invite.name,
      invitation_type: 'team_member',
      status: 'sent',
      invitation_token: crypto.randomUUID(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    const { error } = await supabase
      .from('user_invitations')
      .insert(inviteRecords);

    if (error) throw error;
    return true;
  }

  async updateBusinessVerification(tenantId: string, verificationData: any) {
    const { error } = await supabase
      .from('tenants')
      .update({
        metadata: {
          verification: {
            gst_number: verificationData.gstNumber,
            pan_number: verificationData.panNumber,
            business_license: verificationData.businessLicense,
            documents: verificationData.documents || [],
            verified_at: new Date().toISOString()
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (error) throw error;
    return true;
  }

  async getTenantProfile(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        branding:tenant_branding(*),
        features:tenant_features(*),
        subscription:tenant_subscriptions(*)
      `)
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const tenantProfileService = new TenantProfileService();

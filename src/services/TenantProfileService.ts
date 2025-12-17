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
  // Core Features
  farmer_management?: boolean;
  basic_analytics?: boolean;
  mobile_app?: boolean;
  
  // Communication Features
  sms_notifications?: boolean;
  whatsapp_integration?: boolean;
  voice_calls?: boolean;
  
  // Advanced Analytics Features
  advanced_analytics?: boolean;
  predictive_analytics?: boolean;
  custom_reports?: boolean;
  
  // Technology Features
  weather_forecast?: boolean;
  satellite_imagery?: boolean;
  iot_integration?: boolean;
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
    console.log('TenantProfileService: Upserting branding for tenant:', tenantId, data);
    
    const { data: result, error } = await supabase.rpc('upsert_tenant_branding', {
      p_tenant_id: tenantId,
      p_app_name: data.app_name,
      p_logo_url: data.logo_url || null,
      p_primary_color: data.primary_color,
      p_secondary_color: data.secondary_color,
      p_accent_color: data.accent_color || '#10B981',
      p_background_color: data.background_color || '#FFFFFF',
      p_text_color: data.text_color || '#1F2937',
      p_font_family: data.font_family || 'Inter'
    });

    if (error) {
      console.error('TenantProfileService: Error upserting branding:', error);
      throw error;
    }
    
    console.log('TenantProfileService: Branding upserted successfully');
    return true;
  }

  async upsertFeatures(tenantId: string, data: TenantFeaturesData) {
    try {
      console.log('TenantProfileService: Upserting features for tenant:', tenantId, data);
      
      const { data: result, error } = await supabase.rpc('upsert_tenant_features', {
        p_tenant_id: tenantId,
        p_farmer_management: data.farmer_management ?? true,
        p_basic_analytics: data.basic_analytics ?? true,
        p_mobile_app: data.mobile_app ?? true,
        p_sms_notifications: data.sms_notifications ?? false,
        p_whatsapp_integration: data.whatsapp_integration ?? false,
        p_voice_calls: data.voice_calls ?? false,
        p_advanced_analytics: data.advanced_analytics ?? false,
        p_predictive_analytics: data.predictive_analytics ?? false,
        p_custom_reports: data.custom_reports ?? false,
        p_weather_forecast: data.weather_forecast ?? false,
        p_satellite_imagery: data.satellite_imagery ?? false,
        p_iot_integration: data.iot_integration ?? false
      });

      if (error) {
        console.error('TenantProfileService: Error upserting features:', error);
        throw error;
      }
      
      console.log('TenantProfileService: Features upserted successfully');
      return true;
    } catch (error) {
      console.error('TenantProfileService: Failed to upsert features:', error);
      throw error;
    }
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
    console.log('TenantProfileService: Updating business verification for tenant:', tenantId);
    
    const { data: result, error } = await supabase.rpc('update_tenant_verification', {
      p_tenant_id: tenantId,
      p_verification_data: {
        gst_number: verificationData.gstNumber,
        pan_number: verificationData.panNumber,
        business_license: verificationData.businessLicense,
        documents: verificationData.documents || [],
        verified_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('TenantProfileService: Error updating verification:', error);
      throw error;
    }
    
    console.log('TenantProfileService: Verification updated successfully');
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

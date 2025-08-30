import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';
import type {
  OrganizationSettings,
  SecuritySettings,
  NotificationPreferences,
  DataPrivacySettings,
  LocalizationSettings,
  SubscriptionSettings,
} from '@/types/settings';

class SettingsService extends BaseApiService {
  // Organization Settings
  async getOrganizationSettings(tenantId: string): Promise<OrganizationSettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!data) return { data: null, error };
      
      return { 
        data: {
          ...data,
          business_hours: data.business_hours,
          contact_info: data.contact_info,
          social_links: data.social_links,
          compliance_settings: data.compliance_settings,
          custom_fields: data.custom_fields,
        } as OrganizationSettings, 
        error 
      };
    });
  }

  async upsertOrganizationSettings(tenantId: string, settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('organization_settings')
        .upsert({
          tenant_id: tenantId,
          business_hours: settings.business_hours,
          contact_info: settings.contact_info,
          social_links: settings.social_links,
          compliance_settings: settings.compliance_settings,
          custom_fields: settings.custom_fields,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { 
        data: {
          ...data,
          business_hours: data.business_hours,
          contact_info: data.contact_info,
          social_links: data.social_links,
          compliance_settings: data.compliance_settings,
          custom_fields: data.custom_fields,
        } as OrganizationSettings, 
        error 
      };
    });
  }

  // Security Settings
  async getSecuritySettings(tenantId: string): Promise<SecuritySettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!data) return { data: null, error };

      return { 
        data: {
          ...data,
          password_policy: data.password_policy,
          session_settings: data.session_settings,
          mfa_settings: data.mfa_settings,
          ip_whitelist: data.ip_whitelist,
          login_restrictions: data.login_restrictions,
          audit_settings: data.audit_settings,
        } as SecuritySettings, 
        error 
      };
    });
  }

  async upsertSecuritySettings(tenantId: string, settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert({
          tenant_id: tenantId,
          password_policy: settings.password_policy,
          session_settings: settings.session_settings,
          mfa_settings: settings.mfa_settings,
          ip_whitelist: settings.ip_whitelist,
          login_restrictions: settings.login_restrictions,
          audit_settings: settings.audit_settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { 
        data: {
          ...data,
          password_policy: data.password_policy,
          session_settings: data.session_settings,
          mfa_settings: data.mfa_settings,
          ip_whitelist: data.ip_whitelist,
          login_restrictions: data.login_restrictions,
          audit_settings: data.audit_settings,
        } as SecuritySettings, 
        error 
      };
    });
  }

  // Notification Preferences
  async getNotificationPreferences(userId: string, tenantId: string): Promise<NotificationPreferences | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!data) return { data: null, error };

      return { 
        data: {
          ...data,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
          in_app_notifications: data.in_app_notifications,
          notification_schedule: data.notification_schedule,
        } as NotificationPreferences, 
        error 
      };
    });
  }

  async upsertNotificationPreferences(userId: string, tenantId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          email_notifications: preferences.email_notifications,
          push_notifications: preferences.push_notifications,
          sms_notifications: preferences.sms_notifications,
          in_app_notifications: preferences.in_app_notifications,
          notification_schedule: preferences.notification_schedule,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { 
        data: {
          ...data,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
          in_app_notifications: data.in_app_notifications,
          notification_schedule: data.notification_schedule,
        } as NotificationPreferences, 
        error 
      };
    });
  }

  // Data Privacy Settings
  async getDataPrivacySettings(tenantId: string): Promise<DataPrivacySettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('data_privacy_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!data) return { data: null, error };

      return { 
        data: {
          ...data,
          data_retention_policy: data.data_retention_policy,
          anonymization_settings: data.anonymization_settings,
          gdpr_settings: data.gdpr_settings,
          backup_settings: data.backup_settings,
          encryption_settings: data.encryption_settings,
          third_party_sharing: data.third_party_sharing,
        } as DataPrivacySettings, 
        error 
      };
    });
  }

  async upsertDataPrivacySettings(tenantId: string, settings: Partial<DataPrivacySettings>): Promise<DataPrivacySettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('data_privacy_settings')
        .upsert({
          tenant_id: tenantId,
          data_retention_policy: settings.data_retention_policy,
          anonymization_settings: settings.anonymization_settings,
          gdpr_settings: settings.gdpr_settings,
          backup_settings: settings.backup_settings,
          encryption_settings: settings.encryption_settings,
          third_party_sharing: settings.third_party_sharing,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { 
        data: {
          ...data,
          data_retention_policy: data.data_retention_policy,
          anonymization_settings: data.anonymization_settings,
          gdpr_settings: data.gdpr_settings,
          backup_settings: data.backup_settings,
          encryption_settings: data.encryption_settings,
          third_party_sharing: data.third_party_sharing,
        } as DataPrivacySettings, 
        error 
      };
    });
  }

  // Localization Settings
  async getLocalizationSettings(tenantId: string): Promise<LocalizationSettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('localization_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!data) return { data: null, error };

      return { 
        data: {
          ...data,
          supported_languages: data.supported_languages,
          number_format: data.number_format,
          regional_settings: data.regional_settings,
          custom_translations: data.custom_translations,
        } as LocalizationSettings, 
        error 
      };
    });
  }

  async upsertLocalizationSettings(tenantId: string, settings: Partial<LocalizationSettings>): Promise<LocalizationSettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('localization_settings')
        .upsert({
          tenant_id: tenantId,
          default_language: settings.default_language,
          supported_languages: settings.supported_languages,
          timezone: settings.timezone,
          date_format: settings.date_format,
          time_format: settings.time_format,
          currency: settings.currency,
          number_format: settings.number_format,
          regional_settings: settings.regional_settings,
          custom_translations: settings.custom_translations,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { 
        data: {
          ...data,
          supported_languages: data.supported_languages,
          number_format: data.number_format,
          regional_settings: data.regional_settings,
          custom_translations: data.custom_translations,
        } as LocalizationSettings, 
        error 
      };
    });
  }

  // Subscription Settings
  async getSubscriptionSettings(tenantId: string): Promise<SubscriptionSettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('subscription_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!data) return { data: null, error };

      return { 
        data: {
          ...data,
          billing_contact: data.billing_contact,
          payment_methods: data.payment_methods,
          billing_history: data.billing_history,
          usage_quotas: data.usage_quotas,
          feature_limits: data.feature_limits,
          billing_alerts: data.billing_alerts,
          cancellation_settings: data.cancellation_settings,
        } as SubscriptionSettings, 
        error 
      };
    });
  }

  async upsertSubscriptionSettings(tenantId: string, settings: Partial<SubscriptionSettings>): Promise<SubscriptionSettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('subscription_settings')
        .upsert({
          tenant_id: tenantId,
          billing_contact: settings.billing_contact as any,
          payment_methods: settings.payment_methods as any,
          billing_history: settings.billing_history as any,
          usage_quotas: settings.usage_quotas as any,
          feature_limits: settings.feature_limits as any,
          auto_billing: settings.auto_billing,
          billing_alerts: settings.billing_alerts as any,
          cancellation_settings: settings.cancellation_settings as any,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { 
        data: {
          ...data,
          billing_contact: data.billing_contact,
          payment_methods: data.payment_methods,
          billing_history: data.billing_history,
          usage_quotas: data.usage_quotas,
          feature_limits: data.feature_limits,
          billing_alerts: data.billing_alerts,
          cancellation_settings: data.cancellation_settings,
        } as SubscriptionSettings, 
        error 
      };
    });
  }

  // API Keys Management (using existing table)
  async getApiKeys(tenantId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      return { data, error };
    });
  }

  async createApiKey(tenantId: string, keyData: {
    key_name: string;
    permissions: string[];
    rate_limit_per_hour?: number;
    expires_at?: string;
  }) {
    // Generate API key
    const apiKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const keyPrefix = apiKey.substring(0, 8);
    
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          tenant_id: tenantId,
          api_key_hash: btoa(apiKey), // In production, use proper hashing
          api_key_prefix: keyPrefix,
          ...keyData,
        })
        .select('*')
        .single();

      return { data: { ...data, api_key: apiKey }, error };
    });
  }

  async revokeApiKey(keyId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .select('*')
        .single();

      return { data, error };
    });
  }

  // User Invitations (using existing table)
  async getTeamInvitations(tenantId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      return { data, error };
    });
  }

  async inviteTeamMember(tenantId: string, inviteData: {
    email: string;
    role: string;
    invited_name?: string;
    metadata?: Record<string, any>;
  }) {
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          tenant_id: tenantId,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          status: 'sent',
          ...inviteData,
        })
        .select('*')
        .single();

      return { data, error };
    });
  }

  async resendInvitation(invitationId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .update({
          status: 'sent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitationId)
        .select('*')
        .single();

      return { data, error };
    });
  }

  async cancelInvitation(invitationId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitationId)
        .select('*')
        .single();

      return { data, error };
    });
  }
}

export const settingsService = new SettingsService();

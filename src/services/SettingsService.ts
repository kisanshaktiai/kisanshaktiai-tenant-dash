
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
        .single();

      return { data, error };
    });
  }

  async upsertOrganizationSettings(tenantId: string, settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('organization_settings')
        .upsert({
          tenant_id: tenantId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { data, error };
    });
  }

  // Security Settings
  async getSecuritySettings(tenantId: string): Promise<SecuritySettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      return { data, error };
    });
  }

  async upsertSecuritySettings(tenantId: string, settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert({
          tenant_id: tenantId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { data, error };
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
        .single();

      return { data, error };
    });
  }

  async upsertNotificationPreferences(userId: string, tenantId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { data, error };
    });
  }

  // Data Privacy Settings
  async getDataPrivacySettings(tenantId: string): Promise<DataPrivacySettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('data_privacy_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      return { data, error };
    });
  }

  async upsertDataPrivacySettings(tenantId: string, settings: Partial<DataPrivacySettings>): Promise<DataPrivacySettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('data_privacy_settings')
        .upsert({
          tenant_id: tenantId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { data, error };
    });
  }

  // Localization Settings
  async getLocalizationSettings(tenantId: string): Promise<LocalizationSettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('localization_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      return { data, error };
    });
  }

  async upsertLocalizationSettings(tenantId: string, settings: Partial<LocalizationSettings>): Promise<LocalizationSettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('localization_settings')
        .upsert({
          tenant_id: tenantId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { data, error };
    });
  }

  // Subscription Settings
  async getSubscriptionSettings(tenantId: string): Promise<SubscriptionSettings | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('subscription_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      return { data, error };
    });
  }

  async upsertSubscriptionSettings(tenantId: string, settings: Partial<SubscriptionSettings>): Promise<SubscriptionSettings> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('subscription_settings')
        .upsert({
          tenant_id: tenantId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      return { data, error };
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

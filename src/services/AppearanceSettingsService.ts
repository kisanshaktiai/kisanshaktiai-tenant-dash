
import { supabase } from '@/integrations/supabase/client';

export interface AppearanceSettings {
  id: string;
  tenant_id: string;
  theme_mode: 'light' | 'dark' | 'system';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_override_url?: string;
  custom_css?: string;
  created_at: string;
  updated_at: string;
}

export interface AppearanceSettingsUpdate {
  theme_mode?: 'light' | 'dark' | 'system';
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  logo_override_url?: string;
  custom_css?: string;
}

class AppearanceSettingsService {
  async getAppearanceSettings(tenantId: string): Promise<AppearanceSettings | null> {
    const { data, error } = await supabase
      .from('appearance_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching appearance settings:', error);
      throw error;
    }

    return data;
  }

  async upsertAppearanceSettings(tenantId: string, settings: AppearanceSettingsUpdate): Promise<AppearanceSettings> {
    const { data, error } = await supabase
      .from('appearance_settings')
      .upsert({
        tenant_id: tenantId,
        ...settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting appearance settings:', error);
      throw error;
    }

    return data;
  }

  async deleteAppearanceSettings(tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('appearance_settings')
      .delete()
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error deleting appearance settings:', error);
      throw error;
    }
  }
}

export const appearanceSettingsService = new AppearanceSettingsService();

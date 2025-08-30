
import { supabase } from '@/integrations/supabase/client';

export interface AppearanceSettings {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
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

    if (!data) {
      // Return default settings if no custom settings found
      return this.getDefaultSettings(tenantId);
    }

    return data as AppearanceSettings;
  }

  async upsertAppearanceSettings(settings: Partial<AppearanceSettings> & { tenant_id: string }): Promise<AppearanceSettings> {
    const { data, error } = await supabase
      .from('appearance_settings')
      .upsert({
        tenant_id: settings.tenant_id,
        theme_mode: settings.theme_mode || 'system',
        primary_color: settings.primary_color || '#10b981',
        secondary_color: settings.secondary_color || '#059669',
        accent_color: settings.accent_color || '#14b8a6',
        background_color: settings.background_color || '#ffffff',
        text_color: settings.text_color || '#1f2937',
        font_family: settings.font_family || 'Inter',
        logo_override_url: settings.logo_override_url,
        custom_css: settings.custom_css,
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

    return data as AppearanceSettings;
  }

  private getDefaultSettings(tenantId: string): AppearanceSettings {
    return {
      tenant_id: tenantId,
      theme_mode: 'system',
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Inter'
    };
  }

  applyThemeColors(settings: AppearanceSettings) {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary', settings.primary_color);
    root.style.setProperty('--secondary', settings.secondary_color);
    root.style.setProperty('--accent', settings.accent_color);
    root.style.setProperty('--background', settings.background_color);
    root.style.setProperty('--foreground', settings.text_color);
    
    // Apply font family
    root.style.setProperty('--font-family', settings.font_family);
    
    // Apply custom CSS if provided
    if (settings.custom_css) {
      let customStyleElement = document.getElementById('tenant-custom-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'tenant-custom-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = settings.custom_css;
    }
  }

  resetThemeColors() {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--font-family');
    
    // Remove custom styles
    const customStyleElement = document.getElementById('tenant-custom-styles');
    if (customStyleElement) {
      customStyleElement.remove();
    }
  }
}

export const appearanceSettingsService = new AppearanceSettingsService();

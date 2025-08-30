
import { supabase } from '@/integrations/supabase/client';
import { hexToHsl, generateSidebarColors } from '@/utils/colorUtils';

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

    // Cast theme_mode to the correct type
    return {
      ...data,
      theme_mode: data.theme_mode as 'light' | 'dark' | 'system'
    };
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

    // Cast theme_mode to the correct type
    return {
      ...data,
      theme_mode: data.theme_mode as 'light' | 'dark' | 'system'
    };
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
    
    console.log('Applying theme colors to DOM:', settings);
    
    // Convert HEX colors to HSL format
    const primaryHsl = hexToHsl(settings.primary_color);
    const secondaryHsl = hexToHsl(settings.secondary_color);
    const accentHsl = hexToHsl(settings.accent_color);
    const backgroundHsl = hexToHsl(settings.background_color);
    const textHsl = hexToHsl(settings.text_color);
    
    // Apply general CSS custom properties (HSL format)
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--background', backgroundHsl);
    root.style.setProperty('--foreground', textHsl);
    
    // Generate and apply sidebar-specific colors
    const sidebarColors = generateSidebarColors(primaryHsl);
    root.style.setProperty('--sidebar-background', sidebarColors.background);
    root.style.setProperty('--sidebar-foreground', sidebarColors.foreground);
    root.style.setProperty('--sidebar-primary', primaryHsl);
    root.style.setProperty('--sidebar-primary-foreground', backgroundHsl);
    root.style.setProperty('--sidebar-accent', sidebarColors.accent);
    root.style.setProperty('--sidebar-accent-foreground', sidebarColors.accentForeground);
    root.style.setProperty('--sidebar-border', sidebarColors.border);
    root.style.setProperty('--sidebar-ring', primaryHsl);
    
    // Apply card colors (ensure proper contrast)
    root.style.setProperty('--card', backgroundHsl);
    root.style.setProperty('--card-foreground', textHsl);
    
    // Apply muted colors (slightly darker/lighter variants)
    const [h, s, l] = backgroundHsl.split(' ').map((v, i) => {
      if (i === 0) return parseInt(v);
      return parseInt(v.replace('%', ''));
    });
    
    const mutedHsl = `${h} ${s}% ${Math.max(l - 5, 5)}%`;
    const mutedForegroundHsl = `${h} ${Math.max(s - 20, 10)}% ${Math.max(l - 40, 25)}%`;
    
    root.style.setProperty('--muted', mutedHsl);
    root.style.setProperty('--muted-foreground', mutedForegroundHsl);
    
    // Apply border and input colors
    root.style.setProperty('--border', mutedHsl);
    root.style.setProperty('--input', mutedHsl);
    root.style.setProperty('--ring', primaryHsl);
    
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
    
    console.log('Theme colors applied successfully:', {
      primary: primaryHsl,
      sidebar: sidebarColors,
      settings
    });
  }

  resetThemeColors() {
    const root = document.documentElement;
    
    console.log('Resetting theme colors');
    
    // Remove general properties
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--font-family');
    
    // Remove sidebar properties
    root.style.removeProperty('--sidebar-background');
    root.style.removeProperty('--sidebar-foreground');
    root.style.removeProperty('--sidebar-primary');
    root.style.removeProperty('--sidebar-primary-foreground');
    root.style.removeProperty('--sidebar-accent');
    root.style.removeProperty('--sidebar-accent-foreground');
    root.style.removeProperty('--sidebar-border');
    root.style.removeProperty('--sidebar-ring');
    
    // Remove other properties
    root.style.removeProperty('--card');
    root.style.removeProperty('--card-foreground');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--muted-foreground');
    root.style.removeProperty('--border');
    root.style.removeProperty('--input');
    root.style.removeProperty('--ring');
    
    // Remove custom styles
    const customStyleElement = document.getElementById('tenant-custom-styles');
    if (customStyleElement) {
      customStyleElement.remove();
    }
    
    // Clear sessionStorage
    sessionStorage.removeItem('current-theme-settings');
  }
}

export const appearanceSettingsService = new AppearanceSettingsService();

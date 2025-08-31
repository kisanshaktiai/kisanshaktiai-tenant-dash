
import { supabase } from '@/integrations/supabase/client';
import { 
  hexToHsl, 
  generateSemanticColors, 
  generateColorVariants,
  generateDarkModeColors,
  generateSidebarColors,
  ensureContrast
} from '@/utils/colorUtils';

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
  // Extended color properties
  success_color?: string;
  warning_color?: string;
  info_color?: string;
  destructive_color?: string;
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
      return this.getDefaultSettings(tenantId);
    }

    return {
      ...data,
      theme_mode: data.theme_mode as 'light' | 'dark' | 'system'
    };
  }

  async upsertAppearanceSettings(settings: Partial<AppearanceSettings> & { tenant_id: string }): Promise<AppearanceSettings> {
    // Generate semantic colors if not provided
    const semanticColors = settings.primary_color 
      ? generateSemanticColors(hexToHsl(settings.primary_color))
      : generateSemanticColors('142 76% 36%');

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
        success_color: settings.success_color || semanticColors.success,
        warning_color: settings.warning_color || semanticColors.warning,
        info_color: settings.info_color || semanticColors.info,
        destructive_color: settings.destructive_color || semanticColors.destructive,
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

    return {
      ...data,
      theme_mode: data.theme_mode as 'light' | 'dark' | 'system'
    };
  }

  private getDefaultSettings(tenantId: string): AppearanceSettings {
    const semanticColors = generateSemanticColors('142 76% 36%');
    
    return {
      tenant_id: tenantId,
      theme_mode: 'system',
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Inter',
      success_color: semanticColors.success,
      warning_color: semanticColors.warning,
      info_color: semanticColors.info,
      destructive_color: semanticColors.destructive,
    };
  }

  applyThemeColors(settings: AppearanceSettings) {
    const root = document.documentElement;
    
    console.log('Applying comprehensive theme colors:', settings);
    
    // Convert HEX colors to HSL format
    const primaryHsl = hexToHsl(settings.primary_color);
    const secondaryHsl = hexToHsl(settings.secondary_color);
    const accentHsl = hexToHsl(settings.accent_color);
    const backgroundHsl = hexToHsl(settings.background_color);
    const textHsl = hexToHsl(settings.text_color);
    
    // Generate semantic colors
    const semanticColors = generateSemanticColors(primaryHsl);
    const successHsl = settings.success_color ? hexToHsl(settings.success_color) : semanticColors.success;
    const warningHsl = settings.warning_color ? hexToHsl(settings.warning_color) : semanticColors.warning;
    const infoHsl = settings.info_color ? hexToHsl(settings.info_color) : semanticColors.info;
    const destructiveHsl = settings.destructive_color ? hexToHsl(settings.destructive_color) : semanticColors.destructive;
    
    // Apply core colors
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--background', backgroundHsl);
    root.style.setProperty('--foreground', ensureContrast(textHsl, backgroundHsl));
    
    // Apply semantic colors
    root.style.setProperty('--success', successHsl);
    root.style.setProperty('--warning', warningHsl);
    root.style.setProperty('--info', infoHsl);
    root.style.setProperty('--destructive', destructiveHsl);
    
    // Ensure proper foreground colors for semantic colors
    root.style.setProperty('--success-foreground', ensureContrast(backgroundHsl, successHsl));
    root.style.setProperty('--warning-foreground', ensureContrast(textHsl, warningHsl));
    root.style.setProperty('--info-foreground', ensureContrast(backgroundHsl, infoHsl));
    root.style.setProperty('--destructive-foreground', ensureContrast(backgroundHsl, destructiveHsl));
    
    // Generate and apply sidebar colors (always light)
    const sidebarColors = generateSidebarColors(primaryHsl);
    root.style.setProperty('--sidebar-background', sidebarColors.background);
    root.style.setProperty('--sidebar-foreground', sidebarColors.foreground);
    root.style.setProperty('--sidebar-primary', primaryHsl);
    root.style.setProperty('--sidebar-primary-foreground', backgroundHsl);
    root.style.setProperty('--sidebar-accent', sidebarColors.accent);
    root.style.setProperty('--sidebar-accent-foreground', sidebarColors.accentForeground);
    root.style.setProperty('--sidebar-border', sidebarColors.border);
    root.style.setProperty('--sidebar-ring', primaryHsl);
    
    // Apply card colors
    root.style.setProperty('--card', backgroundHsl);
    root.style.setProperty('--card-foreground', textHsl);
    
    // Generate muted colors
    const [h, s, l] = backgroundHsl.split(' ').map((v, i) => {
      if (i === 0) return parseInt(v);
      return parseInt(v.replace('%', ''));
    });
    
    const mutedHsl = `${h} ${Math.max(s - 5, 5)}% ${Math.max(l - 4, 5)}%`;
    const mutedForegroundHsl = `215 16% 47%`;
    
    root.style.setProperty('--muted', mutedHsl);
    root.style.setProperty('--muted-foreground', mutedForegroundHsl);
    
    // Apply border and input colors
    root.style.setProperty('--border', `214 32% 91%`);
    root.style.setProperty('--input', `214 32% 91%`);
    root.style.setProperty('--ring', primaryHsl);
    
    // Apply font family
    if (settings.font_family) {
      root.style.setProperty('--font-family', settings.font_family);
      document.body.style.fontFamily = settings.font_family;
    }
    
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
    
    console.log('Comprehensive theme colors applied successfully');
  }

  resetThemeColors() {
    const root = document.documentElement;
    
    console.log('Resetting all theme colors');
    
    // Remove all custom properties
    const propertiesToRemove = [
      '--primary', '--secondary', '--accent', '--background', '--foreground',
      '--success', '--warning', '--info', '--destructive',
      '--success-foreground', '--warning-foreground', '--info-foreground', '--destructive-foreground',
      '--sidebar-background', '--sidebar-foreground', '--sidebar-primary', '--sidebar-primary-foreground',
      '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring',
      '--card', '--card-foreground', '--muted', '--muted-foreground',
      '--border', '--input', '--ring', '--font-family'
    ];
    
    propertiesToRemove.forEach(prop => {
      root.style.removeProperty(prop);
    });
    
    // Reset font family
    document.body.style.removeProperty('font-family');
    
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


import { supabase } from '@/integrations/supabase/client';
import { 
  hexToHsl, 
  sanitizeHsl,
  generateSemanticColors, 
  generateDarkModeColors,
  generateButtonStates,
  generateStatusColors,
  generateChartColors,
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
  // Extended semantic colors
  success_color?: string;
  warning_color?: string;
  info_color?: string;
  destructive_color?: string;
  border_color?: string;
  muted_color?: string;
  sidebar_background_color?: string;
  created_at?: string;
  updated_at?: string;
}

class AppearanceSettingsService {
  async getAppearanceSettings(tenantId: string): Promise<AppearanceSettings | null> {
    try {
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
    } catch (error) {
      console.error('Failed to fetch appearance settings:', error);
      return this.getDefaultSettings(tenantId);
    }
  }

  async upsertAppearanceSettings(settings: Partial<AppearanceSettings> & { tenant_id: string }): Promise<AppearanceSettings> {
    try {
      // Generate semantic colors if not provided
      const primaryHsl = settings.primary_color ? hexToHsl(settings.primary_color) : '142 76% 36%';
      const semanticColors = generateSemanticColors(primaryHsl);

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
          border_color: settings.border_color || semanticColors.border,
          muted_color: settings.muted_color || semanticColors.muted,
          sidebar_background_color: settings.sidebar_background_color || '#ffffff',
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
    } catch (error) {
      console.error('Failed to upsert appearance settings:', error);
      throw error;
    }
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
      border_color: semanticColors.border,
      muted_color: semanticColors.muted,
      sidebar_background_color: '#ffffff',
    };
  }

  applyThemeColors(settings: AppearanceSettings) {
    const root = document.documentElement;
    
    console.log('Applying mobile-optimized theme colors:', settings);
    
    try {
      // Convert and sanitize HEX colors to HSL format
      const primaryHsl = sanitizeHsl(hexToHsl(settings.primary_color));
      const secondaryHsl = sanitizeHsl(hexToHsl(settings.secondary_color));
      const accentHsl = sanitizeHsl(hexToHsl(settings.accent_color));
      const backgroundHsl = sanitizeHsl(hexToHsl(settings.background_color));
      const textHsl = sanitizeHsl(hexToHsl(settings.text_color));
      
      // Generate semantic colors
      const semanticColors = generateSemanticColors(primaryHsl);
      const successHsl = settings.success_color ? sanitizeHsl(hexToHsl(settings.success_color)) : semanticColors.success;
      const warningHsl = settings.warning_color ? sanitizeHsl(hexToHsl(settings.warning_color)) : semanticColors.warning;
      const infoHsl = settings.info_color ? sanitizeHsl(hexToHsl(settings.info_color)) : semanticColors.info;
      const destructiveHsl = settings.destructive_color ? sanitizeHsl(hexToHsl(settings.destructive_color)) : semanticColors.destructive;
      const borderHsl = settings.border_color ? sanitizeHsl(hexToHsl(settings.border_color)) : semanticColors.border;
      const mutedHsl = settings.muted_color ? sanitizeHsl(hexToHsl(settings.muted_color)) : semanticColors.muted;
      
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
      root.style.setProperty('--border', borderHsl);
      root.style.setProperty('--muted', mutedHsl);
      root.style.setProperty('--input', borderHsl);
      root.style.setProperty('--ring', primaryHsl);
      
      // Ensure proper foreground colors for semantic colors
      root.style.setProperty('--success-foreground', ensureContrast(backgroundHsl, successHsl));
      root.style.setProperty('--warning-foreground', ensureContrast(textHsl, warningHsl));
      root.style.setProperty('--info-foreground', ensureContrast(backgroundHsl, infoHsl));
      root.style.setProperty('--destructive-foreground', ensureContrast(backgroundHsl, destructiveHsl));
      root.style.setProperty('--muted-foreground', ensureContrast(textHsl, mutedHsl));
      
      // Generate and apply sidebar colors (always light for better UX)
      const sidebarBgHsl = settings.sidebar_background_color ? sanitizeHsl(hexToHsl(settings.sidebar_background_color)) : '0 0% 100%';
      
      root.style.setProperty('--sidebar-background', sidebarBgHsl);
      root.style.setProperty('--sidebar-foreground', '222 84% 5%');
      root.style.setProperty('--sidebar-primary', primaryHsl);
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 98%');
      root.style.setProperty('--sidebar-accent', '210 40% 96%');
      root.style.setProperty('--sidebar-accent-foreground', '222 84% 5%');
      root.style.setProperty('--sidebar-border', '214 32% 91%');
      root.style.setProperty('--sidebar-ring', primaryHsl);
      
      // Apply card colors
      root.style.setProperty('--card', backgroundHsl);
      root.style.setProperty('--card-foreground', textHsl);
      root.style.setProperty('--popover', backgroundHsl);
      root.style.setProperty('--popover-foreground', textHsl);
      
      // Generate and apply button states
      const primaryButtonStates = generateButtonStates(primaryHsl);
      const secondaryButtonStates = generateButtonStates(secondaryHsl);
      
      root.style.setProperty('--button-primary', primaryButtonStates.base);
      root.style.setProperty('--button-primary-hover', primaryButtonStates.hover);
      root.style.setProperty('--button-primary-active', primaryButtonStates.active);
      root.style.setProperty('--button-secondary', secondaryButtonStates.base);
      root.style.setProperty('--button-secondary-hover', secondaryButtonStates.hover);
      root.style.setProperty('--button-secondary-active', secondaryButtonStates.active);
      
      // Generate and apply status colors
      const isDark = document.documentElement.classList.contains('dark');
      const statusColors = generateStatusColors(isDark);
      
      root.style.setProperty('--status-active', statusColors.active);
      root.style.setProperty('--status-inactive', statusColors.inactive);
      root.style.setProperty('--status-pending', statusColors.pending);
      root.style.setProperty('--status-error', statusColors.error);
      
      // Generate and apply chart colors
      const chartColors = generateChartColors(primaryHsl, isDark);
      chartColors.forEach((color, index) => {
        root.style.setProperty(`--chart-${index + 1}`, color);
      });
      
      // Apply mobile-optimized state variant colors
      if (isDark) {
        root.style.setProperty('--background-hover', `215 28% 20%`);
        root.style.setProperty('--background-active', `215 28% 25%`);
        root.style.setProperty('--background-disabled', `215 28% 15%`);
        root.style.setProperty('--text-subtle', `217 11% 65%`);
        root.style.setProperty('--text-disabled', `217 11% 45%`);
        root.style.setProperty('--text-muted', `217 11% 55%`);
      } else {
        root.style.setProperty('--background-hover', `210 40% 98%`);
        root.style.setProperty('--background-active', `210 40% 95%`);
        root.style.setProperty('--background-disabled', `210 40% 93%`);
        root.style.setProperty('--text-subtle', `215 16% 47%`);
        root.style.setProperty('--text-disabled', `215 16% 65%`);
        root.style.setProperty('--text-muted', `215 16% 57%`);
      }
      
      // Apply font family
      if (settings.font_family) {
        root.style.setProperty('--font-family', settings.font_family);
        document.body.style.fontFamily = settings.font_family;
      }
      
      // Apply custom CSS if provided
      if (settings.custom_css) {
        this.applyCustomCSS(settings.custom_css);
      }
      
      console.log('Mobile-optimized theme colors applied successfully');
    } catch (error) {
      console.error('Error applying theme colors:', error);
      // Apply fallback colors
      this.applyFallbackColors();
    }
  }

  private applyCustomCSS(customCSS: string) {
    let customStyleElement = document.getElementById('tenant-custom-styles');
    if (!customStyleElement) {
      customStyleElement = document.createElement('style');
      customStyleElement.id = 'tenant-custom-styles';
      document.head.appendChild(customStyleElement);
    }
    customStyleElement.textContent = customCSS;
  }

  private applyFallbackColors() {
    const root = document.documentElement;
    
    // Apply safe fallback colors
    root.style.setProperty('--primary', '142 76% 36%');
    root.style.setProperty('--secondary', '210 40% 96%');
    root.style.setProperty('--background', '0 0% 100%');
    root.style.setProperty('--foreground', '222 84% 5%');
  }

  resetThemeColors() {
    const root = document.documentElement;
    
    console.log('Resetting all theme colors');
    
    // Remove all custom properties
    const propertiesToRemove = [
      '--primary', '--secondary', '--accent', '--background', '--foreground',
      '--success', '--warning', '--info', '--destructive', '--border', '--muted', '--input', '--ring',
      '--success-foreground', '--warning-foreground', '--info-foreground', '--destructive-foreground', '--muted-foreground',
      '--sidebar-background', '--sidebar-foreground', '--sidebar-primary', '--sidebar-primary-foreground',
      '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring',
      '--card', '--card-foreground', '--popover', '--popover-foreground',
      '--button-primary', '--button-primary-hover', '--button-primary-active',
      '--button-secondary', '--button-secondary-hover', '--button-secondary-active',
      '--status-active', '--status-inactive', '--status-pending', '--status-error',
      '--background-hover', '--background-active', '--background-disabled',
      '--text-subtle', '--text-disabled', '--text-muted', '--font-family'
    ];
    
    // Remove chart colors
    for (let i = 1; i <= 5; i++) {
      propertiesToRemove.push(`--chart-${i}`);
    }
    
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

import { supabase } from '@/integrations/supabase/client';
import * as colorUtils from '@/utils/colorUtils';

export interface WhiteLabelConfig {
  id?: string;
  tenant_id: string;
  
  // Brand Identity for Mobile App
  app_name?: string;
  app_logo_url?: string;
  app_icon_url?: string;
  app_splash_screen_url?: string;
  
  // Color Theme (shared with web app appearance settings)
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  info_color: string;
  
  // Mobile App Specific Settings
  bundle_identifier?: string;
  android_package_name?: string;
  ios_app_id?: string;
  
  // Configuration Objects
  app_store_config?: Record<string, any>;
  play_store_config?: Record<string, any>;
  pwa_config?: Record<string, any>;
  mobile_features?: Record<string, boolean>;
  notification_config?: Record<string, any>;
  deep_link_config?: Record<string, any>;
  mobile_ui_config?: {
    navigation_style?: string;
    animations_enabled?: boolean;
    button_style?: string;
    input_style?: string;
    card_style?: string;
  };
  
  // Metadata
  is_active?: boolean;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

class WhiteLabelService {
  /**
   * Fetch white label config for a tenant
   */
  async getWhiteLabelConfig(tenantId: string): Promise<WhiteLabelConfig | null> {
    try {
      const { data, error } = await supabase
        .from('white_label_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No config found, return defaults
          return this.getDefaultConfig(tenantId);
        }
        throw error;
      }

      return data as any as WhiteLabelConfig;
    } catch (error) {
      console.error('Error fetching white label config:', error);
      return this.getDefaultConfig(tenantId);
    }
  }

  /**
   * Create or update white label config
   */
  async upsertWhiteLabelConfig(config: Partial<WhiteLabelConfig> & { tenant_id: string }): Promise<WhiteLabelConfig> {
    try {
      // Generate semantic colors if primary color is provided
      let processedConfig = { ...config };
      
      if (config.primary_color) {
        const primaryHsl = config.primary_color.startsWith('#') 
          ? colorUtils.hexToHsl(config.primary_color)
          : config.primary_color;
        
        const semanticColors = colorUtils.generateSemanticColors(primaryHsl);
        processedConfig = {
          ...processedConfig,
          success_color: config.success_color || semanticColors.success,
          warning_color: config.warning_color || semanticColors.warning,
          info_color: config.info_color || semanticColors.info,
          error_color: config.error_color || semanticColors.destructive,
        };
      }

      const { data, error } = await supabase
        .from('white_label_configs')
        .upsert({
          ...processedConfig,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'tenant_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data as any as WhiteLabelConfig;
    } catch (error) {
      console.error('Error upserting white label config:', error);
      throw error;
    }
  }


  /**
   * Get default white label config
   */
  private getDefaultConfig(tenantId: string): WhiteLabelConfig {
    return {
      tenant_id: tenantId,
      app_name: 'Farmer App',
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      success_color: '#10b981',
      warning_color: '#f59e0b',
      error_color: '#ef4444',
      info_color: '#3b82f6',
      mobile_ui_config: {
        navigation_style: 'tab_bar',
        animations_enabled: true,
        button_style: 'rounded',
        input_style: 'outlined',
        card_style: 'elevated'
      },
      mobile_features: {},
      is_active: true,
      version: 1
    };
  }

  /**
   * Sync colors from appearance settings to white label config
   * This ensures mobile app uses the same theme as web app
   */
  async syncColorsFromAppearance(tenantId: string, colors: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    success_color?: string;
    warning_color?: string;
    error_color?: string;
    info_color?: string;
  }): Promise<void> {
    try {
      const colorData = {
        primary_color: colors.primary_color,
        secondary_color: colors.secondary_color,
        accent_color: colors.accent_color,
        background_color: colors.background_color,
        text_color: colors.text_color,
        success_color: colors.success_color || colors.primary_color,
        warning_color: colors.warning_color || '#f59e0b',
        error_color: colors.error_color || '#ef4444',
        info_color: colors.info_color || '#3b82f6',
      };
      
      // Simply upsert the color data - the upsert will handle create or update
      await this.upsertWhiteLabelConfig({
        tenant_id: tenantId,
        ...colorData,
      });
      
      console.log('Synced colors to white label config for mobile app:', colorData);
    } catch (error) {
      console.error('Failed to sync colors to white label:', error);
      // Don't throw - this is a best-effort sync
    }
  }

  /**
   * Export white label config as JSON
   */
  exportConfig(config: WhiteLabelConfig): string {
    const exportData = {
      ...config,
      exported_at: new Date().toISOString(),
      export_version: '1.0.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import white label config from JSON
   */
  parseImportedConfig(jsonString: string): Partial<WhiteLabelConfig> {
    try {
      const parsed = JSON.parse(jsonString);
      // Remove metadata fields that shouldn't be imported
      delete parsed.id;
      delete parsed.tenant_id;
      delete parsed.created_at;
      delete parsed.updated_at;
      delete parsed.exported_at;
      delete parsed.export_version;
      
      return parsed;
    } catch (error) {
      console.error('Error parsing imported config:', error);
      throw new Error('Invalid configuration file format');
    }
  }
}

export const whiteLabelService = new WhiteLabelService();
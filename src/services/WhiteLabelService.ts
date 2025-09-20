import { supabase } from '@/integrations/supabase/client';
import * as colorUtils from '@/utils/colorUtils';
import {
  WhiteLabelConfigData as WhiteLabelConfig,
  validateWhiteLabelConfig,
  sanitizeWhiteLabelConfig,
  CURRENT_SCHEMA_VERSION,
  isCompatible
} from '@kisanshakti/whitelabel-types';

// Re-export the type for backward compatibility
export type { WhiteLabelConfig };

class WhiteLabelService {
  /**
   * Fetch white label config for a tenant
   */
  async getWhiteLabelConfig(tenantId: string): Promise<WhiteLabelConfig | null> {
    try {
      // Use the existing edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session available');
        return this.getDefaultConfig(tenantId);
      }

      const response = await fetch(
        `https://qfklkkzxemsbeniyugiz.supabase.co/functions/v1/get-white-label-config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ tenant_id: tenantId }),
        }
      );

      if (!response.ok) {
        console.error('Error fetching white label config from edge function');
        // Fallback to direct database query
        const { data, error } = await supabase
          .from('white_label_configs')
          .select('*')
          .eq('tenant_id', tenantId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return this.getDefaultConfig(tenantId);
          }
          throw error;
        }

        // Check schema compatibility
        if (data && !isCompatible((data as any).schema_version, CURRENT_SCHEMA_VERSION)) {
          console.warn(`White label config schema version ${(data as any).schema_version} may not be compatible with current version ${CURRENT_SCHEMA_VERSION}`);
        }

        return data as any as WhiteLabelConfig;
      }

      const data = await response.json();
      const config = data.config || this.getDefaultConfig(tenantId);
      
      // Check schema compatibility
      if (config && !isCompatible(config.schema_version, CURRENT_SCHEMA_VERSION)) {
        console.warn(`White label config schema version ${config.schema_version} may not be compatible with current version ${CURRENT_SCHEMA_VERSION}`);
      }
      
      return config;
    } catch (error) {
      console.error('Error in getWhiteLabelConfig:', error);
      return this.getDefaultConfig(tenantId);
    }
  }

  /**
   * Create or update white label config
   */
  async upsertWhiteLabelConfig(config: Partial<WhiteLabelConfig> & { tenant_id: string }): Promise<WhiteLabelConfig> {
    try {
      // Get current user for audit metadata
      const { data: { user } } = await supabase.auth.getUser();
      
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

      // Add audit metadata
      const now = new Date().toISOString();
      const configWithAudit = {
        ...processedConfig,
        updated_at: now,
        updated_by: user?.id,
        changed_by: user?.email,
        schema_version: CURRENT_SCHEMA_VERSION,
      };

      // Validate configuration
      const validation = validateWhiteLabelConfig(configWithAudit as WhiteLabelConfig);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors?.join(', ')}`);
      }

      // Sanitize configuration before saving
      const sanitizedConfig = sanitizeWhiteLabelConfig(configWithAudit as WhiteLabelConfig);

      // Check if config exists to set created_by
      const { data: existing } = await supabase
        .from('white_label_configs')
        .select('id')
        .eq('tenant_id', config.tenant_id)
        .single();

      if (!existing) {
        (sanitizedConfig as any).created_by = user?.id;
      }

      const { data, error } = await supabase
        .from('white_label_configs')
        .upsert(sanitizedConfig as any, {
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
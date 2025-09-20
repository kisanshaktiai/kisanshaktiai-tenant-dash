// Type declaration for @kisanshakti/whitelabel-types package
// This will be removed once the actual package is available

declare module '@kisanshakti/whitelabel-types' {
  export interface WhiteLabelConfigData {
    id?: string;
    tenant_id: string;
    schema_version?: string;
    
    // Brand Identity for Mobile App
    app_name?: string;
    app_logo_url?: string;
    app_icon_url?: string;
    app_splash_screen_url?: string;
    
    // Color Theme (shared with web app appearance settings)
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    success_color?: string;
    warning_color?: string;
    error_color?: string;
    info_color?: string;
    
    // Domain Configuration
    custom_domain?: string;
    subdomain?: string;
    
    // Email Configuration
    smtp_host?: string;
    smtp_port?: string;
    smtp_username?: string;
    smtp_password?: string;
    from_email?: string;
    from_name?: string;
    email_templates?: any;
    
    // Mobile App Specific Settings
    bundle_identifier?: string;
    android_package_name?: string;
    ios_app_id?: string;
    
    // Mobile Theme (stored in mobile_theme column)
    mobile_theme?: {
      primary_color?: string;
      secondary_color?: string;
      accent_color?: string;
      background_color?: string;
      surface_color?: string;
      text_color?: string;
      border_color?: string;
      success_color?: string;
      warning_color?: string;
      error_color?: string;
      info_color?: string;
      primary_variant?: string;
      secondary_variant?: string;
      tertiary_color?: string;
      on_surface_color?: string;
    };
    
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
    
    // Audit metadata
    created_by?: string;
    updated_by?: string;
    changed_by?: string;
    
    // Metadata
    is_active?: boolean;
    version?: number;
    created_at?: string;
    updated_at?: string;
  }

  export interface ValidationResult {
    valid: boolean;
    errors?: string[];
  }

  export function validateWhiteLabelConfig(config: Partial<WhiteLabelConfigData>): ValidationResult;
  export function sanitizeWhiteLabelConfig(config: Partial<WhiteLabelConfigData>): WhiteLabelConfigData;
  export function isCompatible(version: string | undefined, currentVersion: string): boolean;
  export const CURRENT_SCHEMA_VERSION: string;
}
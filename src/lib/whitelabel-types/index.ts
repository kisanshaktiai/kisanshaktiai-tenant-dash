// Local implementation of @kisanshakti/whitelabel-types
// This will be replaced once the package is published to the registry

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

export const CURRENT_SCHEMA_VERSION = '1.0.0';

export function validateWhiteLabelConfig(config: Partial<WhiteLabelConfigData>): ValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  if (!config.tenant_id) {
    errors.push('tenant_id is required');
  }
  
  // Validate color format (HSL)
  const colorFields = [
    'primary_color', 'secondary_color', 'accent_color', 
    'background_color', 'text_color', 'success_color',
    'warning_color', 'error_color', 'info_color'
  ];
  
  colorFields.forEach(field => {
    const value = config[field as keyof WhiteLabelConfigData];
    if (value && typeof value === 'string' && !isValidHSLColor(value)) {
      errors.push(`${field} must be a valid HSL color`);
    }
  });
  
  // Validate mobile theme colors
  if (config.mobile_theme) {
    Object.entries(config.mobile_theme).forEach(([key, value]) => {
      if (value && !isValidHSLColor(value)) {
        errors.push(`mobile_theme.${key} must be a valid HSL color`);
      }
    });
  }
  
  // Validate URLs
  const urlFields = ['app_logo_url', 'app_icon_url', 'app_splash_screen_url'];
  urlFields.forEach(field => {
    const value = config[field as keyof WhiteLabelConfigData];
    if (value && typeof value === 'string' && !isValidUrl(value)) {
      errors.push(`${field} must be a valid URL`);
    }
  });
  
  // Validate email
  if (config.from_email && !isValidEmail(config.from_email)) {
    errors.push('from_email must be a valid email address');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

export function sanitizeWhiteLabelConfig(config: Partial<WhiteLabelConfigData>): WhiteLabelConfigData {
  const sanitized = { ...config } as WhiteLabelConfigData;
  
  // Ensure schema version
  if (!sanitized.schema_version) {
    sanitized.schema_version = CURRENT_SCHEMA_VERSION;
  }
  
  // Sanitize strings
  const stringFields = [
    'app_name', 'from_name', 'custom_domain', 'subdomain',
    'bundle_identifier', 'android_package_name', 'ios_app_id'
  ];
  
  stringFields.forEach(field => {
    const value = sanitized[field as keyof WhiteLabelConfigData];
    if (value && typeof value === 'string') {
      (sanitized as any)[field] = value.trim();
    }
  });
  
  // Sanitize URLs
  const urlFields = ['app_logo_url', 'app_icon_url', 'app_splash_screen_url'];
  urlFields.forEach(field => {
    const value = sanitized[field as keyof WhiteLabelConfigData];
    if (value && typeof value === 'string') {
      (sanitized as any)[field] = value.trim();
    }
  });
  
  // Ensure mobile_theme structure
  if (sanitized.mobile_theme) {
    sanitized.mobile_theme = Object.entries(sanitized.mobile_theme).reduce((acc, [key, value]) => {
      if (value && typeof value === 'string') {
        acc[key as keyof typeof acc] = value.trim();
      }
      return acc;
    }, {} as typeof sanitized.mobile_theme);
  }
  
  // Set timestamps
  const now = new Date().toISOString();
  if (!sanitized.created_at) {
    sanitized.created_at = now;
  }
  sanitized.updated_at = now;
  
  // Set active status
  if (sanitized.is_active === undefined) {
    sanitized.is_active = true;
  }
  
  return sanitized;
}

export function isCompatible(version: string | undefined, currentVersion: string): boolean {
  if (!version) return false;
  
  const [major1, minor1] = version.split('.').map(Number);
  const [major2, minor2] = currentVersion.split('.').map(Number);
  
  // Major version must match
  if (major1 !== major2) return false;
  
  // Minor version can be different but warn if older
  return true;
}

// Helper functions
function isValidHSLColor(color: string): boolean {
  // Check for HSL format: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslRegex = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[\d.]+)?\s*\)$/;
  // Also allow CSS variable references
  const varRegex = /^hsl\(var\(--[\w-]+\)\)$/;
  return hslRegex.test(color) || varRegex.test(color);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Allow relative URLs
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Core tenant types that match the database schema exactly
export interface DatabaseTenantBranding {
  id: string;
  tenant_id: string;
  accent_color: string;
  app_icon_url: string | null;
  app_name: string;
  app_tagline: string | null;
  background_color: string;
  company_description: string | null;
  created_at: string;
  custom_css: string | null;
  email_footer_html: string | null;
  email_header_html: string | null;
  favicon_url: string | null;
  font_family: string;
  is_active: boolean;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  social_links: any;
  text_color: string;
  theme_settings: any;
  updated_at: string;
  version: number;
}

export interface DatabaseTenantFeatures {
  id: string;
  tenant_id: string;
  basic_analytics: boolean;
  advanced_analytics: boolean;
  ai_chat: boolean;
  weather_forecast: boolean;
  marketplace: boolean;
  community_forum: boolean;
  soil_testing: boolean;
  satellite_imagery: boolean;
  drone_monitoring: boolean;
  iot_integration: boolean;
  predictive_analytics: boolean;
  custom_reports: boolean;
  api_access: boolean;
  webhook_support: boolean;
}

export interface DatabaseTenantSubscription {
  id: string;
  tenant_id: string;
  plan_id?: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  billing_interval: 'monthly' | 'annually';
  current_period_start: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  plan?: {
    id: string;
    name: string;
    description?: string;
    price_monthly: number;
    price_annually: number;
    max_farmers: number;
    max_dealers: number;
    max_products: number;
    max_storage_gb: number;
    max_api_calls_per_day: number;
    features: Record<string, any>;
    is_active: boolean;
  };
}

// Application types (what we use in the UI)
export interface TenantBranding {
  id: string;
  tenant_id: string;
  accent_color: string;
  app_icon_url: string | null;
  app_name: string;
  app_tagline: string | null;
  background_color: string;
  company_description: string | null;
  created_at: string;
  custom_css: string | null;
  email_footer_html: string | null;
  email_header_html: string | null;
  favicon_url: string | null;
  font_family: string;
  is_active: boolean;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  social_links: any;
  text_color: string;
  theme_settings: any;
  updated_at: string;
  version: number;
}

export interface TenantFeatures {
  id: string;
  tenant_id: string;
  basic_analytics: boolean;
  advanced_analytics: boolean;
  ai_chat: boolean;
  weather_forecast: boolean;
  marketplace: boolean;
  community_forum: boolean;
  soil_testing: boolean;
  satellite_imagery: boolean;
  drone_monitoring: boolean;
  iot_integration: boolean;
  predictive_analytics: boolean;
  custom_reports: boolean;
  api_access: boolean;
  webhook_support: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_annually: number;
  max_farmers: number;
  max_dealers: number;
  max_products: number;
  max_storage_gb: number;
  max_api_calls_per_day: number;
  features: Record<string, any>;
  is_active: boolean;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id?: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  billing_interval: 'monthly' | 'annually';
  current_period_start: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  plan?: SubscriptionPlan;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative' | 'dealer' | 'sugar_factory' | 'insurance';
  status: 'active' | 'trial' | 'suspended' | 'cancelled' | 'archived' | 'pending_approval';
  subscription_plan: 'Kisan_Basic' | 'Shakti_Growth' | 'AI_Enterprise' | 'custom';
  owner_name?: string;
  owner_email?: string;
  branding?: TenantBranding;
  features?: TenantFeatures;
  subscription?: TenantSubscription;
  trial_ends_at?: string;
  max_farmers?: number;
  max_dealers?: number;
  max_products?: number;
  max_storage_gb?: number;
  max_api_calls_per_day?: number;
}

export interface UserTenant {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'admin' | 'manager' | 'viewer' | 'dealer' | 'super_admin' | 'tenant_owner' | 'tenant_admin' | 'tenant_manager' | 'agent' | 'farmer';
  is_active: boolean;
  is_primary: boolean;
  department?: string;
  designation?: string;
  tenant?: Tenant;
}

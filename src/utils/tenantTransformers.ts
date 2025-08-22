
import { DatabaseTenantBranding, DatabaseTenantFeatures, DatabaseTenantSubscription, TenantBranding, TenantFeatures, TenantSubscription, Tenant, UserTenant } from '@/types/tenant';

export const mapTenantStatus = (status: string): 'active' | 'trial' | 'suspended' | 'cancelled' | 'archived' | 'pending_approval' => {
  switch (status) {
    case 'pending_approval': return 'pending_approval';
    case 'active': return 'active';
    case 'suspended': return 'suspended';
    case 'cancelled':
    case 'canceled': return 'cancelled';
    case 'trial': return 'trial';
    case 'archived': return 'archived';
    default: return 'pending_approval';
  }
};

export const mapSubscriptionStatus = (status: string): 'trial' | 'active' | 'canceled' | 'past_due' => {
  switch (status) {
    case 'trial': return 'trial';
    case 'active': return 'active';
    case 'canceled':
    case 'cancelled': return 'canceled';
    case 'past_due': return 'past_due';
    default: return 'trial';
  }
};

export const mapSubscriptionPlan = (plan: string): 'Kisan_Basic' | 'Shakti_Growth' | 'AI_Enterprise' | 'custom' => {
  switch (plan) {
    case 'Kisan_Basic': return 'Kisan_Basic';
    case 'Shakti_Growth': return 'Shakti_Growth';
    case 'AI_Enterprise': return 'AI_Enterprise';
    case 'custom': return 'custom';
    default: return 'Kisan_Basic';
  }
};

export const transformBranding = (branding: any): TenantBranding | undefined => {
  if (!branding) return undefined;
  
  // Handle both array and object formats from the database
  const brandingData = Array.isArray(branding) ? branding[0] : branding;
  if (!brandingData) return undefined;

  return {
    id: brandingData.id,
    tenant_id: brandingData.tenant_id,
    accent_color: brandingData.accent_color || '#000000',
    app_icon_url: brandingData.app_icon_url,
    app_name: brandingData.app_name || 'Tenant App',
    app_tagline: brandingData.app_tagline,
    background_color: brandingData.background_color || '#ffffff',
    company_description: brandingData.company_description,
    created_at: brandingData.created_at,
    custom_css: brandingData.custom_css,
    email_footer_html: brandingData.email_footer_html,
    email_header_html: brandingData.email_header_html,
    favicon_url: brandingData.favicon_url,
    font_family: brandingData.font_family || 'Inter',
    is_active: brandingData.is_active ?? true,
    logo_url: brandingData.logo_url,
    primary_color: brandingData.primary_color || '#0066cc',
    secondary_color: brandingData.secondary_color || '#6b7280',
    social_links: brandingData.social_links || {},
    text_color: brandingData.text_color || '#000000',
    theme_settings: brandingData.theme_settings || {},
    updated_at: brandingData.updated_at,
    version: brandingData.version || 1,
  };
};

export const transformFeatures = (features: any): TenantFeatures | undefined => {
  if (!features) return undefined;
  
  const featuresData = Array.isArray(features) ? features[0] : features;
  if (!featuresData) return undefined;

  return {
    id: featuresData.id,
    tenant_id: featuresData.tenant_id,
    basic_analytics: featuresData.basic_analytics ?? true,
    advanced_analytics: featuresData.advanced_analytics ?? false,
    ai_chat: featuresData.ai_chat ?? false,
    weather_forecast: featuresData.weather_forecast ?? true,
    marketplace: featuresData.marketplace ?? false,
    community_forum: featuresData.community_forum ?? false,
    soil_testing: featuresData.soil_testing ?? false,
    satellite_imagery: featuresData.satellite_imagery ?? false,
    drone_monitoring: featuresData.drone_monitoring ?? false,
    iot_integration: featuresData.iot_integration ?? false,
    predictive_analytics: featuresData.predictive_analytics ?? false,
    custom_reports: featuresData.custom_reports ?? false,
    api_access: featuresData.api_access ?? false,
    webhook_support: featuresData.webhook_support ?? false,
  };
};

export const transformSubscription = (subscription: any): TenantSubscription | undefined => {
  if (!subscription) return undefined;
  
  const subData = Array.isArray(subscription) ? subscription[0] : subscription;
  if (!subData) return undefined;

  return {
    id: subData.id,
    tenant_id: subData.tenant_id,
    plan_id: subData.plan_id,
    status: mapSubscriptionStatus(subData.status),
    billing_interval: subData.billing_interval || 'monthly',
    current_period_start: subData.current_period_start,
    current_period_end: subData.current_period_end,
    trial_end: subData.trial_end,
    canceled_at: subData.canceled_at,
    plan: subData.plan ? {
      id: subData.plan.id,
      name: subData.plan.name,
      description: subData.plan.description,
      price_monthly: subData.plan.price_monthly || 0,
      price_annually: subData.plan.price_annually || 0,
      max_farmers: subData.plan.max_farmers || 0,
      max_dealers: subData.plan.max_dealers || 0,
      max_products: subData.plan.max_products || 0,
      max_storage_gb: subData.plan.max_storage_gb || 0,
      max_api_calls_per_day: subData.plan.max_api_calls_per_day || 0,
      features: subData.plan.features || {},
      is_active: subData.plan.is_active ?? true,
    } : undefined,
  };
};

export const transformTenant = (tenantData: any): Tenant => {
  return {
    id: tenantData.id,
    name: tenantData.name,
    slug: tenantData.slug,
    type: tenantData.type || 'agri_company',
    status: mapTenantStatus(tenantData.status),
    subscription_plan: mapSubscriptionPlan(tenantData.subscription_plan),
    owner_name: tenantData.owner_name,
    owner_email: tenantData.owner_email,
    branding: transformBranding(tenantData.branding),
    features: transformFeatures(tenantData.features),
    subscription: transformSubscription(tenantData.subscription),
    trial_ends_at: tenantData.trial_ends_at,
    max_farmers: tenantData.max_farmers,
    max_dealers: tenantData.max_dealers,
    max_products: tenantData.max_products,
    max_storage_gb: tenantData.max_storage_gb,
    max_api_calls_per_day: tenantData.max_api_calls_per_day,
  };
};

export const transformUserTenant = (userTenantData: any): UserTenant => {
  return {
    id: userTenantData.id,
    user_id: userTenantData.user_id,
    tenant_id: userTenantData.tenant_id,
    role: userTenantData.role,
    is_active: userTenantData.is_active,
    is_primary: userTenantData.is_primary,
    department: userTenantData.department,
    designation: userTenantData.designation,
    tenant: userTenantData.tenant ? transformTenant(userTenantData.tenant) : undefined,
  };
};

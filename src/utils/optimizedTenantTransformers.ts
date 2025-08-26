
import { useMemo } from 'react';
import type { UserTenant } from '@/types/tenant';

// Memoized tenant transformation to avoid repeated computations
export const useMemoizedTenantTransformer = () => {
  return useMemo(() => {
    const transformCache = new Map<string, any>();
    
    return (userTenant: any): UserTenant | null => {
      if (!userTenant?.tenant) return null;
      
      const cacheKey = `${userTenant.user_id}_${userTenant.tenant_id}_${userTenant.updated_at}`;
      
      // Return cached transformation if available
      if (transformCache.has(cacheKey)) {
        return transformCache.get(cacheKey);
      }
      
      try {
        const tenant = userTenant.tenant;
        
        const transformed: UserTenant = {
          id: userTenant.id,
          user_id: userTenant.user_id,
          tenant_id: userTenant.tenant_id,
          role: userTenant.role,
          is_active: userTenant.is_active,
          is_primary: userTenant.is_primary || false,
          department: userTenant.department,
          designation: userTenant.designation,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            type: tenant.type,
            status: tenant.status,
            subscription_plan: tenant.subscription_plan,
            owner_name: tenant.owner_name,
            owner_email: tenant.owner_email,
            trial_ends_at: tenant.trial_ends_at,
            max_farmers: tenant.max_farmers,
            max_dealers: tenant.max_dealers,
            max_products: tenant.max_products,
            max_storage_gb: tenant.max_storage_gb,
            max_api_calls_per_day: tenant.max_api_calls_per_day,
            branding: tenant.branding ? {
              id: tenant.branding.id,
              tenant_id: tenant.branding.tenant_id,
              accent_color: tenant.branding.accent_color || '#000000',
              app_icon_url: tenant.branding.app_icon_url,
              app_name: tenant.branding.app_name || 'Tenant App',
              app_tagline: tenant.branding.app_tagline,
              background_color: tenant.branding.background_color || '#ffffff',
              company_description: tenant.branding.company_description,
              created_at: tenant.branding.created_at,
              custom_css: tenant.branding.custom_css,
              email_footer_html: tenant.branding.email_footer_html,
              email_header_html: tenant.branding.email_header_html,
              favicon_url: tenant.branding.favicon_url,
              font_family: tenant.branding.font_family || 'Inter',
              is_active: tenant.branding.is_active ?? true,
              logo_url: tenant.branding.logo_url,
              primary_color: tenant.branding.primary_color || '#0066cc',
              secondary_color: tenant.branding.secondary_color || '#6b7280',
              social_links: tenant.branding.social_links || {},
              text_color: tenant.branding.text_color || '#000000',
              theme_settings: tenant.branding.theme_settings || {},
              updated_at: tenant.branding.updated_at,
              version: tenant.branding.version || 1,
            } : undefined,
            features: tenant.features ? {
              id: tenant.features.id,
              tenant_id: tenant.features.tenant_id,
              basic_analytics: tenant.features.basic_analytics ?? true,
              advanced_analytics: tenant.features.advanced_analytics ?? false,
              ai_chat: tenant.features.ai_chat ?? false,
              weather_forecast: tenant.features.weather_forecast ?? true,
              marketplace: tenant.features.marketplace ?? false,
              community_forum: tenant.features.community_forum ?? false,
              soil_testing: tenant.features.soil_testing ?? false,
              satellite_imagery: tenant.features.satellite_imagery ?? false,
              drone_monitoring: tenant.features.drone_monitoring ?? false,
              iot_integration: tenant.features.iot_integration ?? false,
              predictive_analytics: tenant.features.predictive_analytics ?? false,
              custom_reports: tenant.features.custom_reports ?? false,
              api_access: tenant.features.api_access ?? false,
              webhook_support: tenant.features.webhook_support ?? false,
            } : undefined,
            subscription: tenant.subscription ? {
              id: tenant.subscription.id,
              tenant_id: tenant.subscription.tenant_id,
              plan_id: tenant.subscription.plan_id,
              status: tenant.subscription.status,
              billing_interval: tenant.subscription.billing_interval || 'monthly',
              current_period_start: tenant.subscription.current_period_start,
              current_period_end: tenant.subscription.current_period_end,
              trial_end: tenant.subscription.trial_end,
              canceled_at: tenant.subscription.canceled_at,
              plan: tenant.subscription.plan || undefined
            } : undefined
          }
        };
        
        // Cache the transformed result
        transformCache.set(cacheKey, transformed);
        
        // Limit cache size
        if (transformCache.size > 100) {
          const firstKey = transformCache.keys().next().value;
          transformCache.delete(firstKey);
        }
        
        return transformed;
      } catch (error) {
        console.error('Error transforming user tenant:', error);
        return null;
      }
    };
  }, []);
};

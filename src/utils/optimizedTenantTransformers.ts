
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
          joined_at: userTenant.joined_at,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            type: tenant.type,
            status: tenant.status,
            owner_email: tenant.owner_email,
            owner_name: tenant.owner_name,
            owner_phone: tenant.owner_phone,
            business_registration: tenant.business_registration,
            business_address: tenant.business_address,
            established_date: tenant.established_date,
            subscription_plan: tenant.subscription_plan,
            subscription_status: tenant.subscription_status,
            subscription_start_date: tenant.subscription_start_date,
            subscription_end_date: tenant.subscription_end_date,
            trial_ends_at: tenant.trial_ends_at,
            max_farmers: tenant.max_farmers,
            max_dealers: tenant.max_dealers,
            max_products: tenant.max_products,
            max_storage_gb: tenant.max_storage_gb,
            max_api_calls_per_day: tenant.max_api_calls_per_day,
            subdomain: tenant.subdomain,
            custom_domain: tenant.custom_domain,
            is_active: tenant.is_active,
            metadata: tenant.metadata || {},
            created_at: tenant.created_at,
            updated_at: tenant.updated_at,
            branding: tenant.branding ? {
              id: tenant.branding.id,
              tenant_id: tenant.branding.tenant_id,
              logo_url: tenant.branding.logo_url,
              primary_color: tenant.branding.primary_color,
              secondary_color: tenant.branding.secondary_color,
              accent_color: tenant.branding.accent_color,
              font_family: tenant.branding.font_family,
              custom_css: tenant.branding.custom_css,
              favicon_url: tenant.branding.favicon_url,
              version: tenant.branding.version || 1,
              created_at: tenant.branding.created_at,
              updated_at: tenant.branding.updated_at
            } : null,
            features: tenant.features ? {
              id: tenant.features.id,
              tenant_id: tenant.features.tenant_id,
              farmer_management: tenant.features.farmer_management || false,
              dealer_network: tenant.features.dealer_network || false,
              product_catalog: tenant.features.product_catalog || false,
              campaign_management: tenant.features.campaign_management || false,
              analytics_reporting: tenant.features.analytics_reporting || false,
              api_integrations: tenant.features.api_integrations || false,
              white_labeling: tenant.features.white_labeling || false,
              multi_language: tenant.features.multi_language || false,
              sms_notifications: tenant.features.sms_notifications || false,
              email_campaigns: tenant.features.email_campaigns || false,
              mobile_app: tenant.features.mobile_app || false,
              advanced_analytics: tenant.features.advanced_analytics || false,
              custom_fields: tenant.features.custom_fields || false,
              bulk_operations: tenant.features.bulk_operations || false,
              data_export: tenant.features.data_export || false,
              created_at: tenant.features.created_at,
              updated_at: tenant.features.updated_at
            } : null,
            subscription: tenant.subscription ? {
              id: tenant.subscription.id,
              tenant_id: tenant.subscription.tenant_id,
              plan_id: tenant.subscription.plan_id,
              status: tenant.subscription.status,
              start_date: tenant.subscription.start_date,
              end_date: tenant.subscription.end_date,
              trial_ends_at: tenant.subscription.trial_ends_at,
              billing_cycle: tenant.subscription.billing_cycle,
              auto_renew: tenant.subscription.auto_renew || false,
              created_at: tenant.subscription.created_at,
              updated_at: tenant.subscription.updated_at,
              plan: tenant.subscription.plan || null
            } : null
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

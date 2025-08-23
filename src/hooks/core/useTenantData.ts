
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTenant, setUserTenants, setSubscriptionPlans, setLoading, setError } from '@/store/slices/tenantSlice';
import { tenantDataService } from '@/services/TenantDataService';
import { onboardingValidationService } from '@/services/OnboardingValidationService';
import { transformUserTenant } from '@/utils/tenantTransformers';

export const useTenantData = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, subscriptionPlans, loading } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!user) {
      dispatch(setCurrentTenant(null));
      dispatch(setUserTenants([]));
      return;
    }

    const fetchUserTenants = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        
        console.log('useTenantData: Fetching tenant data for user:', user.id);
        
        const { data: userTenantsData, error: userTenantsError } = await supabase
          .from('user_tenants')
          .select(`
            *,
            tenant:tenants!user_tenants_tenant_id_fkey(
              *,
              branding:tenant_branding!tenant_branding_tenant_id_fkey(*),
              features:tenant_features!tenant_features_tenant_id_fkey(*),
              subscription:tenant_subscriptions!tenant_subscriptions_tenant_id_fkey(
                *,
                plan:subscription_plans(*)
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (userTenantsError) {
          console.error('useTenantData: Error fetching user tenants:', userTenantsError);
          
          // If no tenants found, this is normal for new users
          if (userTenantsError.code === 'PGRST116') {
            console.log('useTenantData: No tenants found for user - this is normal for new users');
            dispatch(setUserTenants([]));
            return;
          }
          
          throw userTenantsError;
        }

        console.log('useTenantData: Fetched user tenants:', userTenantsData);

        // Transform and filter valid user tenants
        const transformedUserTenants = (userTenantsData || [])
          .filter(userTenant => userTenant.tenant && typeof userTenant.tenant === 'object' && !('error' in userTenant.tenant))
          .map(userTenant => {
            if (!userTenant.tenant || typeof userTenant.tenant !== 'object' || 'error' in userTenant.tenant) {
              return null;
            }
            
            // Transform branding array to single object with proper properties
            let branding = undefined;
            if (userTenant.tenant.branding) {
              const brandingData = Array.isArray(userTenant.tenant.branding) 
                ? userTenant.tenant.branding[0] 
                : userTenant.tenant.branding;
              
              if (brandingData) {
                branding = {
                  id: brandingData.id || '',
                  tenant_id: brandingData.tenant_id || userTenant.tenant.id,
                  accent_color: brandingData.accent_color || '#10B981',
                  app_icon_url: brandingData.app_icon_url || null,
                  app_name: brandingData.app_name || 'Tenant App',
                  app_tagline: brandingData.app_tagline || null,
                  background_color: brandingData.background_color || '#ffffff',
                  company_description: brandingData.company_description || null,
                  created_at: brandingData.created_at || new Date().toISOString(),
                  custom_css: brandingData.custom_css || null,
                  email_footer_html: brandingData.email_footer_html || null,
                  email_header_html: brandingData.email_header_html || null,
                  favicon_url: brandingData.favicon_url || null,
                  font_family: brandingData.font_family || 'Inter',
                  is_active: brandingData.is_active ?? true,
                  logo_url: brandingData.logo_url || null,
                  primary_color: brandingData.primary_color || '#0066cc',
                  secondary_color: brandingData.secondary_color || '#6b7280',
                  social_links: brandingData.social_links || {},
                  text_color: brandingData.text_color || '#000000',
                  theme_settings: brandingData.theme_settings || {},
                  updated_at: brandingData.updated_at || new Date().toISOString(),
                  version: brandingData.version || 1,
                };
              }
            }

            // Transform features array to single object
            let features = undefined;
            if (userTenant.tenant.features) {
              const featuresData = Array.isArray(userTenant.tenant.features) 
                ? userTenant.tenant.features[0] 
                : userTenant.tenant.features;
              
              if (featuresData) {
                features = {
                  id: featuresData.id || '',
                  tenant_id: featuresData.tenant_id || userTenant.tenant.id,
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
              }
            }

            // Transform subscription array to single object
            let subscription = undefined;
            if (userTenant.tenant.subscription) {
              const subData = Array.isArray(userTenant.tenant.subscription) 
                ? userTenant.tenant.subscription[0] 
                : userTenant.tenant.subscription;
              subscription = subData || undefined;
            }
            
            // Transform the tenant data to match expected types
            const tenant = {
              ...userTenant.tenant,
              type: userTenant.tenant.type as any,
              status: userTenant.tenant.status as any,
              subscription_plan: userTenant.tenant.subscription_plan as any,
              branding,
              features,
              subscription
            };
            
            return {
              ...userTenant,
              role: userTenant.role as any,
              tenant
            };
          })
          .filter(Boolean);

        dispatch(setUserTenants(transformedUserTenants as any));

        if (!currentTenant && transformedUserTenants && transformedUserTenants.length > 0) {
          const primaryTenant = transformedUserTenants.find(ut => ut?.role === 'tenant_owner') || transformedUserTenants[0];
          if (primaryTenant?.tenant) {
            console.log('useTenantData: Setting current tenant:', primaryTenant.tenant);
            dispatch(setCurrentTenant(primaryTenant.tenant));
            
            try {
              await onboardingValidationService.validateAndRepairOnboarding(primaryTenant.tenant.id);
            } catch (validationError) {
              console.warn('useTenantData: Onboarding validation warning:', validationError);
            }
          }
        }
      } catch (error) {
        console.error('useTenantData: Error fetching tenant data:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Failed to load tenant data'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    const fetchSubscriptionPlans = async () => {
      try {
        if (currentTenant?.id) {
          const plansData = await tenantDataService.getSubscriptionPlans(currentTenant.id);
          
          const mappedPlans = (plansData || []).map(plan => {
            const limits = typeof plan.limits === 'object' && plan.limits !== null ? plan.limits as Record<string, any> : {};
            
            return {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price_monthly: plan.price_monthly || 0,
              price_annually: plan.price_annually || 0,
              max_farmers: limits.max_farmers || 0,
              max_dealers: limits.max_dealers || 0,
              max_products: limits.max_products || 0,
              max_storage_gb: limits.storage_gb || 0,
              max_api_calls_per_day: limits.api_calls_per_day || 0,
              features: typeof plan.features === 'object' && plan.features !== null ? plan.features as Record<string, any> : {},
              is_active: plan.is_active,
            };
          });

          dispatch(setSubscriptionPlans(mappedPlans));
        } else {
          const { data: plansData, error: plansError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });

          if (plansError) {
            console.error('Error fetching subscription plans:', plansError);
            throw plansError;
          }

          const mappedPlans = (plansData || []).map(plan => {
            const limits = typeof plan.limits === 'object' && plan.limits !== null ? plan.limits as Record<string, any> : {};
            
            return {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price_monthly: plan.price_monthly || 0,
              price_annually: plan.price_annually || 0,
              max_farmers: limits.max_farmers || 0,
              max_dealers: limits.max_dealers || 0,
              max_products: limits.max_products || 0,
              max_storage_gb: limits.storage_gb || 0,
              max_api_calls_per_day: limits.api_calls_per_day || 0,
              features: typeof plan.features === 'object' && plan.features !== null ? plan.features as Record<string, any> : {},
              is_active: plan.is_active,
            };
          });

          dispatch(setSubscriptionPlans(mappedPlans));
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      }
    };

    const channel = supabase
      .channel(`tenant_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tenants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('Real-time tenant data change detected');
          fetchUserTenants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_features',
        },
        () => {
          fetchUserTenants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_branding',
        },
        () => {
          fetchUserTenants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_subscriptions',
        },
        () => {
          fetchUserTenants();
        }
      )
      .subscribe();

    if (userTenants.length === 0 || !loading) {
      fetchUserTenants();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, dispatch, currentTenant?.id, userTenants.length, loading]);

  return {
    currentTenant,
    userTenants,
    subscriptionPlans,
    isMultiTenant: userTenants.length > 1,
    loading,
  };
};

// Export the fetchUserTenants function
export const useTenantDataFetch = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const fetchUserTenants = async (userId: string) => {
    // This is a simplified version - in practice you'd want the full implementation
    // For now, just call the main hook's logic
    return [];
  };

  return { fetchUserTenants };
};

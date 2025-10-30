
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { supabase } from '@/integrations/supabase/client';

interface TenantOnboardingStatus {
  isComplete: boolean;
  workflow?: any;
  steps?: any[];
  progress?: number;
  lastActivity?: string;
  tenantDetails?: {
    id: string;
    name: string;
    status: string;
    subscription_plan: string;
    created_at: string;
  };
}

export const useTenantOnboardingStatus = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useQuery({
    queryKey: ['tenant-onboarding-status', currentTenant?.id],
    queryFn: async (): Promise<TenantOnboardingStatus> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('useTenantOnboardingStatus: Fetching comprehensive status for tenant:', currentTenant.id);

      // Get onboarding completion status
      const isComplete = await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
      
      // Get detailed onboarding data
      const onboardingData = await enhancedOnboardingService.getOnboardingData(currentTenant.id);
      
      // Calculate progress if we have steps
      let progress = 0;
      if (onboardingData?.steps && onboardingData.steps.length > 0) {
        const completedSteps = onboardingData.steps.filter(
          (step: any) => step.step_status === 'completed'
        ).length;
        progress = Math.round((completedSteps / onboardingData.steps.length) * 100);
      }

      // Get tenant details with relationships
      const { data: tenantDetails, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          id,
          name,
          status,
          subscription_plan,
          created_at,
          updated_at,
          branding:tenant_branding!tenant_branding_tenant_id_fkey(
            app_name,
            primary_color,
            logo_url
          ),
          features:tenant_features!tenant_features_tenant_id_fkey(
            feature_flags,
            enabled_modules
          ),
          subscription:tenant_subscriptions!tenant_subscriptions_tenant_id_fkey(
            status,
            current_period_start,
            current_period_end
          )
        `)
        .eq('id', currentTenant.id)
        .single();

      if (tenantError) {
        console.error('useTenantOnboardingStatus: Error fetching tenant details:', tenantError);
      }

      // Get last activity timestamp
      let lastActivity = null;
      if (onboardingData?.steps) {
        const timestamps = onboardingData.steps
          .map((step: any) => step.updated_at || step.created_at)
          .filter(Boolean)
          .sort()
          .reverse();
        
        lastActivity = timestamps[0] || null;
      }

      const result: TenantOnboardingStatus = {
        isComplete,
        workflow: onboardingData?.workflow,
        steps: onboardingData?.steps,
        progress,
        lastActivity,
        tenantDetails: tenantDetails ? {
          id: tenantDetails.id,
          name: tenantDetails.name,
          status: tenantDetails.status,
          subscription_plan: tenantDetails.subscription_plan,
          created_at: tenantDetails.created_at,
        } : undefined
      };

      console.log('useTenantOnboardingStatus: Comprehensive status result:', {
        tenantId: currentTenant.id,
        isComplete,
        progress,
        hasWorkflow: !!result.workflow,
        stepCount: result.steps?.length || 0
      });

      return result;
    },
    enabled: !!currentTenant?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('No current tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};


import { TenantRepository } from '@/repositories/TenantRepository';
import type { Tenant, UserTenant, SubscriptionPlan } from '@/types/tenant';
import { transformUserTenant } from '@/utils/tenantTransformers';

export class TenantBusinessLogic {
  constructor(private tenantRepository: TenantRepository) {}

  async validateTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      const userTenants = await this.tenantRepository.findUserTenants(userId);
      return userTenants.some(ut => 
        ut.tenant_id === tenantId && 
        ut.is_active && 
        ['tenant_owner', 'tenant_admin', 'tenant_member'].includes(ut.role)
      );
    } catch (error) {
      console.error('Error validating tenant access:', error);
      return false;
    }
  }

  async getUserTenants(userId: string): Promise<UserTenant[]> {
    const userTenantsData = await this.tenantRepository.findUserTenants(userId);
    
    return userTenantsData
      .filter(ut => ut.tenant)
      .map(transformUserTenant);
  }

  async selectPrimaryTenant(userTenants: UserTenant[]): Promise<Tenant | null> {
    if (!userTenants.length) return null;
    
    // Priority: tenant_owner > tenant_admin > tenant_member > first available
    const priorityOrder = ['tenant_owner', 'tenant_admin', 'tenant_member'];
    
    for (const role of priorityOrder) {
      const tenant = userTenants.find(ut => ut.role === role);
      if (tenant?.tenant) return tenant.tenant;
    }
    
    return userTenants[0]?.tenant || null;
  }

  validateSubscriptionLimits(tenant: Tenant, resourceType: string, currentCount: number): boolean {
    const subscription = tenant.subscription;
    if (!subscription) return true; // No limits if no subscription
    
    const limits = subscription.limits || {};
    
    switch (resourceType) {
      case 'farmers':
        return currentCount < (limits.max_farmers || Infinity);
      case 'dealers':
        return currentCount < (limits.max_dealers || Infinity);
      case 'products':
        return currentCount < (limits.max_products || Infinity);
      default:
        return true;
    }
  }

  canAccessFeature(tenant: Tenant, featureName: string): boolean {
    const features = tenant.features || {};
    return features[featureName] === true;
  }

  calculateTenantHealth(tenant: Tenant): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check onboarding completion
    if (tenant.status === 'pending_approval') {
      issues.push('Onboarding not completed');
      recommendations.push('Complete the onboarding process');
      score -= 30;
    }

    // Check branding setup
    if (!tenant.branding?.app_name) {
      issues.push('App branding not configured');
      recommendations.push('Set up your app branding');
      score -= 15;
    }

    // Check subscription status
    if (!tenant.subscription_plan || tenant.subscription_plan === 'trial') {
      issues.push('No active subscription');
      recommendations.push('Upgrade to a paid plan');
      score -= 20;
    }

    return { score: Math.max(0, score), issues, recommendations };
  }
}

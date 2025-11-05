import { supabase } from '@/integrations/supabase/client';

export interface CreateSubscriptionParams {
  tenantId?: string;
  farmerId?: string;
  planId: string;
  billingInterval: 'monthly' | 'quarterly' | 'annually';
  autoRenew?: boolean;
  paidByTenant?: boolean;
}

export interface UpgradePlanParams {
  subscriptionId: string;
  newPlanId: string;
  prorated?: boolean;
}

export class SubscriptionService {
  // ===== TENANT SUBSCRIPTIONS =====
  
  static async getTenantSubscription(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createTenantSubscription(params: CreateSubscriptionParams) {
    const { tenantId, planId, billingInterval, autoRenew = true } = params;
    
    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) throw new Error('Plan not found');

    // Calculate period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (billingInterval === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (billingInterval === 'quarterly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const planData = plan as any;
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .insert({
        tenant_id: tenantId,
        plan_id: planId,
        status: 'active',
        billing_interval: billingInterval as any,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        auto_renew: autoRenew,
        max_farmers: planData.max_farmers,
        max_dealers: planData.max_dealers,
        max_storage_gb: planData.max_storage_gb,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async upgradeTenantPlan(params: UpgradePlanParams) {
    const { subscriptionId, newPlanId } = params;

    // Get new plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single();

    if (!plan) throw new Error('Plan not found');

    const planData = plan as any;
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .update({
        plan_id: newPlanId,
        max_farmers: planData.max_farmers,
        max_dealers: planData.max_dealers,
        max_storage_gb: planData.max_storage_gb,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async cancelTenantSubscription(subscriptionId: string, reason?: string) {
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        auto_renew: false,
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== FARMER SUBSCRIPTIONS =====

  static async getFarmerSubscription(farmerId: string) {
    const { data, error } = await supabase
      .from('farmer_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('farmer_id', farmerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createFarmerSubscription(params: CreateSubscriptionParams) {
    const { farmerId, planId, billingInterval, paidByTenant = false } = params;
    
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) throw new Error('Plan not found');

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (billingInterval === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (billingInterval === 'quarterly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('farmer_subscriptions')
      .insert({
        plan_id: planId,
        status: 'active',
        billing_cycle: billingInterval as any,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        paid_by_tenant: paidByTenant,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async upgradeFarmerPlan(params: UpgradePlanParams) {
    const { subscriptionId, newPlanId } = params;

    const { data, error } = await supabase
      .from('farmer_subscriptions')
      .update({
        plan_id: newPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== PLAN MANAGEMENT =====

  static async getAvailablePlans(category: 'tenant' | 'farmer', tenantId?: string) {
    let query = supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('plan_category', category);

    // If tenant ID provided, also get custom plans
    if (tenantId) {
      query = query.or(`created_by_tenant_id.is.null,created_by_tenant_id.eq.${tenantId}`);
    } else {
      query = query.is('created_by_tenant_id', null);
    }

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('plan_category', category);

    if (error) throw error;
    return data || [];
  }

  static async createCustomFarmerPlan(
    tenantId: string,
    basePlanId: string,
    customization: {
      name: string;
      description?: string;
      priceMonthly?: number;
      priceQuarterly?: number;
      priceAnnually?: number;
      features?: any;
      limits?: any;
    }
  ) {
    // Get base plan
    const { data: basePlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', basePlanId)
      .single();

    if (!basePlan) throw new Error('Base plan not found');

    // Create custom plan
    const basePlanData = basePlan as any;
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        plan_category: 'farmer',
        is_custom_plan: true,
        created_by_tenant_id: tenantId,
        parent_plan_id: basePlanId,
        price_monthly: customization.priceMonthly || basePlanData.price_monthly,
        price_quarterly: customization.priceQuarterly || (basePlanData.price_monthly * 3 * 0.9),
        price_annually: customization.priceAnnually || (basePlanData.price_monthly * 12 * 0.8),
        features: customization.features || basePlanData.features,
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTenantCustomPricing(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_farmer_pricing')
      .select(`
        *,
        base_plan:subscription_plans(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }
}

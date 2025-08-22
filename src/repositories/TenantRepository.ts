
import { BaseRepository } from './BaseRepository';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TenantsTable = Database['public']['Tables']['tenants']['Row'];
type UserTenantsTable = Database['public']['Tables']['user_tenants']['Row'];

export interface TenantWithRelations extends TenantsTable {
  branding?: Database['public']['Tables']['tenant_branding']['Row'][];
  features?: Database['public']['Tables']['tenant_features']['Row'][];
  subscription?: (Database['public']['Tables']['tenant_subscriptions']['Row'] & {
    plan?: Database['public']['Tables']['subscription_plans']['Row'];
  })[];
}

export interface UserTenantWithRelations extends UserTenantsTable {
  tenant: TenantWithRelations;
}

export class TenantRepository extends BaseRepository<TenantsTable> {
  constructor() {
    super('tenants');
  }

  async findUserTenants(userId: string): Promise<UserTenantWithRelations[]> {
    return this.executeQuery(async () =>
      await supabase
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
        .eq('user_id', userId)
        .eq('is_active', true)
    );
  }

  async findBySlug(slug: string): Promise<TenantsTable> {
    return this.executeQuery(async () =>
      await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single()
    );
  }

  async updateBranding(tenantId: string, brandingData: any): Promise<void> {
    await this.executeQuery(async () =>
      await supabase
        .from('tenant_branding')
        .upsert({ tenant_id: tenantId, ...brandingData })
    );
  }

  async updateFeatures(tenantId: string, featuresData: any): Promise<void> {
    await this.executeQuery(async () =>
      await supabase
        .from('tenant_features')
        .upsert({ tenant_id: tenantId, ...featuresData })
    );
  }
}

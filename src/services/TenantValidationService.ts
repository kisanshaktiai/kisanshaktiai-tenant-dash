
import { supabase } from '@/integrations/supabase/client';

interface TenantOwnershipResult {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  owner_email: string;
  is_owner: boolean;
  onboarding_complete: boolean;
}

class TenantValidationService {
  async validateTenantOwnership(email: string): Promise<TenantOwnershipResult | null> {
    try {
      console.log('TenantValidationService: Validating tenant ownership for:', email);
      
      const { data, error } = await supabase.rpc('validate_tenant_ownership', {
        p_email: email
      });

      if (error) {
        console.error('TenantValidationService: Error validating tenant ownership:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('TenantValidationService: No tenant found for email:', email);
        return null;
      }

      const result = data[0] as TenantOwnershipResult;
      console.log('TenantValidationService: Tenant ownership validation result:', result);
      
      return result;
    } catch (error) {
      console.error('TenantValidationService: Exception validating tenant ownership:', error);
      throw error;
    }
  }

  async checkUserCanLogin(email: string): Promise<{ canLogin: boolean; reason?: string; tenantData?: TenantOwnershipResult }> {
    try {
      const tenantData = await this.validateTenantOwnership(email);
      
      if (!tenantData) {
        return {
          canLogin: false,
          reason: 'No tenant found for this email address. Only existing tenant owners can log in.'
        };
      }

      if (!tenantData.is_owner) {
        return {
          canLogin: false,
          reason: 'You are not authorized to access this tenant.'
        };
      }

      return {
        canLogin: true,
        tenantData
      };
    } catch (error) {
      console.error('TenantValidationService: Error checking login eligibility:', error);
      return {
        canLogin: false,
        reason: 'Unable to validate login credentials. Please try again.'
      };
    }
  }
}

export const tenantValidationService = new TenantValidationService();

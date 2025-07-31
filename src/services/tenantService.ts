
import { supabase } from '@/integrations/supabase/client';

export interface TenantRegistrationData {
  organizationName: string;
  organizationType: 'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative';
  slug: string;
  email: string;
  phone?: string;
  ownerName?: string;
}

export interface TenantCreationResponse {
  success: boolean;
  error?: string;
  data?: any;
}

class TenantService {
  async createTenant(data: TenantRegistrationData): Promise<TenantCreationResponse> {
    const { data: result, error } = await supabase.rpc('create_tenant_with_validation', {
      p_name: data.organizationName,
      p_slug: data.slug,
      p_type: data.organizationType,
      p_owner_email: data.email,
      p_owner_phone: data.phone || null,
      p_owner_name: data.ownerName || null,
    });

    if (error) {
      console.error('Error creating tenant:', error);
      throw new Error('Failed to create organization. Please try again.');
    }

    const response = result as unknown as TenantCreationResponse;
    
    if (response && !response.success) {
      throw new Error(response.error || 'Failed to create organization');
    }

    return response;
  }

  async checkSlugAvailability(slug: string) {
    const { data, error } = await supabase.rpc('check_slug_availability', { p_slug: slug });
    
    if (error) {
      console.error('Error checking slug availability:', error);
      throw new Error('Failed to validate slug');
    }

    return data as unknown as { available: boolean; error?: string; code?: string };
  }

  async generateSlugSuggestions(organizationName: string) {
    const { data, error } = await supabase.rpc('generate_slug_suggestions', { 
      p_organization_name: organizationName 
    });

    if (error) {
      console.error('Error generating suggestions:', error);
      throw new Error('Failed to generate suggestions');
    }

    return data as unknown as { suggestions: Array<{ slug: string; available: boolean; error?: string }> };
  }
}

export const tenantService = new TenantService();

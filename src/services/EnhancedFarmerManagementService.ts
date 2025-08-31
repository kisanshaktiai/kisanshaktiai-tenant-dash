
import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface ComprehensiveFarmerData {
  // Personal Information
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  
  // Address Information
  village: string;
  taluka?: string;
  district: string;
  state: string;
  pincode: string;
  
  // Farming Information
  farmingExperience: string;
  totalLandSize: string;
  irrigationSource?: string;
  hasStorage: boolean;
  hasTractor: boolean;
  primaryCrops: string[];
  
  // Authentication
  pin: string;
  
  // Additional Information
  notes?: string;
}

export interface CreatedFarmerResult {
  success: boolean;
  farmer: any;
  farmerId: string;
  farmerCode: string;
  mobileNumber: string;
  error?: string;
}

class EnhancedFarmerManagementService extends BaseApiService {
  protected basePath = '/enhanced-farmer-management';

  private async hashPin(pin: string): Promise<string> {
    // Simple hash for demo - in production, use proper bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private formatMobileNumber(mobile: string): string {
    const cleanMobile = mobile.replace(/[^0-9+]/g, '');
    
    if (cleanMobile.startsWith('+91') && cleanMobile.length === 13) {
      return cleanMobile;
    } else if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      return '+' + cleanMobile;
    } else if (cleanMobile.length === 10 && /^[6-9]/.test(cleanMobile)) {
      return '+91' + cleanMobile;
    }
    
    return cleanMobile;
  }

  private async generateFarmerCode(tenantId: string): Promise<string> {
    // Get tenant info for prefix
    const { data: tenant } = await supabase
      .from('tenants')
      .select('slug')
      .eq('id', tenantId)
      .single();

    // Get farmer count for this tenant
    const { count } = await supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const farmerNumber = (count || 0) + 1;
    const tenantPrefix = tenant?.slug?.substring(0, 3).toUpperCase() || 'FAR';
    return `${tenantPrefix}${farmerNumber.toString().padStart(6, '0')}`;
  }

  async createComprehensiveFarmer(tenantId: string, farmerData: ComprehensiveFarmerData): Promise<CreatedFarmerResult> {
    try {
      console.log('Creating comprehensive farmer for tenant:', tenantId);
      
      // Format mobile number
      const formattedMobile = this.formatMobileNumber(farmerData.phone);
      
      // Check if mobile number already exists for this tenant
      const { data: existingFarmer } = await supabase
        .from('farmers')
        .select('id')
        .eq('phone', formattedMobile)
        .eq('tenant_id', tenantId)
        .single();

      if (existingFarmer) {
        throw new Error('A farmer with this mobile number already exists');
      }

      // Generate farmer code
      const farmerCode = await this.generateFarmerCode(tenantId);
      
      // Hash PIN
      const pinHash = await this.hashPin(farmerData.pin);

      // Create farmer record with all the new fields
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .insert({
          tenant_id: tenantId,
          farmer_code: farmerCode,
          name: farmerData.fullName,
          phone: formattedMobile,
          email: farmerData.email || null,
          city: farmerData.village,
          state: farmerData.state,
          farming_experience_years: parseInt(farmerData.farmingExperience) || 0,
          total_land_acres: parseFloat(farmerData.totalLandSize) || 0,
          primary_crops: farmerData.primaryCrops,
          farm_type: 'mixed',
          has_irrigation: !!farmerData.irrigationSource,
          has_storage: farmerData.hasStorage,
          has_tractor: farmerData.hasTractor,
          is_verified: false,
          total_app_opens: 0,
          total_queries: 0,
          // Store additional data in metadata for now
          metadata: {
            dateOfBirth: farmerData.dateOfBirth,
            gender: farmerData.gender,
            district: farmerData.district,
            taluka: farmerData.taluka,
            pincode: farmerData.pincode,
            irrigationSource: farmerData.irrigationSource,
            pinHash: pinHash,
            notes: farmerData.notes,
          }
        })
        .select()
        .single();

      if (farmerError) {
        throw farmerError;
      }

      // Try to create additional records if tables exist
      try {
        // Create farmer contacts if table exists
        await supabase
          .from('farmer_contacts')
          .insert({
            farmer_id: farmer.id,
            tenant_id: tenantId,
            contact_type: 'mobile',
            contact_value: formattedMobile,
            is_primary: true,
            is_verified: false,
          });
      } catch (error) {
        console.warn('Could not create farmer contacts:', error);
      }

      try {
        // Create farmer engagement record if table exists
        await supabase
          .from('farmer_engagement')
          .insert({
            farmer_id: farmer.id,
            tenant_id: tenantId,
            app_opens_count: 0,
            features_used: [],
            communication_responses: 0,
            activity_score: 0,
            churn_risk_score: 0,
            engagement_level: 'medium',
          });
      } catch (error) {
        console.warn('Could not create farmer engagement:', error);
      }

      return {
        success: true,
        farmer,
        farmerId: farmer.id,
        farmerCode: farmer.farmer_code,
        mobileNumber: formattedMobile,
      };

    } catch (error) {
      console.error('Comprehensive farmer creation failed:', error);
      return {
        success: false,
        farmer: null,
        farmerId: '',
        farmerCode: '',
        mobileNumber: '',
        error: error instanceof Error ? error.message : 'Failed to create farmer',
      };
    }
  }

  async getFarmerWithAllDetails(farmerId: string, tenantId: string) {
    try {
      const { data: farmer, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      
      // Try to fetch additional details from related tables
      let additionalData = {};
      
      try {
        const { data: contacts } = await supabase
          .from('farmer_contacts')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('tenant_id', tenantId);
        
        additionalData = { ...additionalData, contacts };
      } catch (error) {
        console.warn('Could not fetch farmer contacts:', error);
      }

      try {
        const { data: engagement } = await supabase
          .from('farmer_engagement')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('tenant_id', tenantId)
          .single();
        
        additionalData = { ...additionalData, engagement };
      } catch (error) {
        console.warn('Could not fetch farmer engagement:', error);
      }

      return { ...farmer, ...additionalData };
    } catch (error) {
      throw new Error(`Failed to fetch farmer details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateFarmerLogin(mobileNumber: string, pin: string, tenantId: string) {
    try {
      const formattedMobile = this.formatMobileNumber(mobileNumber);
      const pinHash = await this.hashPin(pin);

      // Look for farmer with matching mobile and PIN hash in metadata
      const { data: farmer, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('phone', formattedMobile)
        .eq('tenant_id', tenantId)
        .single();

      if (error || !farmer) {
        return { success: false, error: 'Invalid mobile number or PIN' };
      }

      // Check PIN hash from metadata
      const storedPinHash = farmer.metadata?.pinHash;
      if (!storedPinHash || storedPinHash !== pinHash) {
        return { success: false, error: 'Invalid mobile number or PIN' };
      }

      // Update last login in metadata
      await supabase
        .from('farmers')
        .update({ 
          metadata: {
            ...farmer.metadata,
            lastLogin: new Date().toISOString(),
          }
        })
        .eq('id', farmer.id);

      return {
        success: true,
        farmer,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }
}

export const enhancedFarmerManagementService = new EnhancedFarmerManagementService();

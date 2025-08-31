
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
      const { data: existingAuth } = await supabase
        .from('farmer_authentication')
        .select('id')
        .eq('mobile_number', formattedMobile)
        .eq('tenant_id', tenantId)
        .single();

      if (existingAuth) {
        throw new Error('A farmer with this mobile number already exists');
      }

      // Generate farmer code
      const farmerCode = await this.generateFarmerCode(tenantId);
      
      // Hash PIN
      const pinHash = await this.hashPin(farmerData.pin);

      // Start transaction by creating farmer record
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .insert({
          tenant_id: tenantId,
          farmer_code: farmerCode,
          full_name: farmerData.fullName,
          email: farmerData.email || null,
          date_of_birth: farmerData.dateOfBirth,
          gender: farmerData.gender,
          village: farmerData.village,
          taluka: farmerData.taluka || null,
          district: farmerData.district,
          state: farmerData.state,
          pincode: farmerData.pincode,
          mobile_number: formattedMobile,
          country_code: '+91',
          pin_hash: pinHash,
          farming_experience_years: parseInt(farmerData.farmingExperience) || 0,
          total_land_acres: parseFloat(farmerData.totalLandSize) || 0,
          primary_crops: farmerData.primaryCrops,
          farm_type: 'mixed',
          has_irrigation: !!farmerData.irrigationSource,
          has_storage: farmerData.hasStorage,
          has_tractor: farmerData.hasTractor,
          irrigation_type: farmerData.irrigationSource || null,
          notes: farmerData.notes || null,
          is_verified: false,
          total_app_opens: 0,
          total_queries: 0,
        })
        .select()
        .single();

      if (farmerError) {
        throw farmerError;
      }

      // Create farmer address record
      const { error: addressError } = await supabase
        .from('farmer_addresses')
        .insert({
          farmer_id: farmer.id,
          tenant_id: tenantId,
          address_type: 'primary',
          village: farmerData.village,
          taluka: farmerData.taluka || null,
          district: farmerData.district,
          state: farmerData.state,
          pincode: farmerData.pincode,
          is_primary: true,
        });

      if (addressError) {
        console.error('Address creation failed:', addressError);
        // Continue even if address fails as it's supplementary
      }

      // Create farmer contacts
      const contacts = [
        {
          farmer_id: farmer.id,
          tenant_id: tenantId,
          contact_type: 'mobile',
          contact_value: formattedMobile,
          is_primary: true,
          is_verified: false,
        },
      ];

      if (farmerData.email) {
        contacts.push({
          farmer_id: farmer.id,
          tenant_id: tenantId,
          contact_type: 'email',
          contact_value: farmerData.email,
          is_primary: false,
          is_verified: false,
        });
      }

      const { error: contactsError } = await supabase
        .from('farmer_contacts')
        .insert(contacts);

      if (contactsError) {
        console.error('Contacts creation failed:', contactsError);
        // Continue even if contacts fail
      }

      // Create farmer authentication record
      const { error: authError } = await supabase
        .from('farmer_authentication')
        .insert({
          farmer_id: farmer.id,
          tenant_id: tenantId,
          mobile_number: formattedMobile,
          country_code: '+91',
          pin_hash: pinHash,
          is_active: true,
          failed_attempts: 0,
        });

      if (authError) {
        console.error('Authentication creation failed:', authError);
        // Continue even if auth record fails
      }

      // Create initial engagement record
      const { error: engagementError } = await supabase
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

      if (engagementError) {
        console.error('Engagement creation failed:', engagementError);
        // Continue even if engagement record fails
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
        .select(`
          *,
          farmer_addresses(*),
          farmer_contacts(*),
          farmer_authentication(*),
          farmer_engagement(*),
          farmer_tags(*),
          farmer_notes(*),
          lands(*)
        `)
        .eq('id', farmerId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      return farmer;
    } catch (error) {
      throw new Error(`Failed to fetch farmer details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateFarmerLogin(mobileNumber: string, pin: string, tenantId: string) {
    try {
      const formattedMobile = this.formatMobileNumber(mobileNumber);
      const pinHash = await this.hashPin(pin);

      const { data: authRecord, error } = await supabase
        .from('farmer_authentication')
        .select(`
          *,
          farmers(*)
        `)
        .eq('mobile_number', formattedMobile)
        .eq('pin_hash', pinHash)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error || !authRecord) {
        return { success: false, error: 'Invalid mobile number or PIN' };
      }

      // Check if account is locked
      if (authRecord.locked_until && new Date(authRecord.locked_until) > new Date()) {
        return { 
          success: false, 
          error: 'Account is temporarily locked. Please try again later.' 
        };
      }

      // Update last login
      await supabase
        .from('farmer_authentication')
        .update({ 
          last_login: new Date().toISOString(),
          failed_attempts: 0,
          locked_until: null,
        })
        .eq('id', authRecord.id);

      return {
        success: true,
        farmer: authRecord.farmers,
        authRecord,
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

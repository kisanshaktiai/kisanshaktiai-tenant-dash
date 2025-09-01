
import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface ComprehensiveFarmerData {
  // Personal Information
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  
  // Address Information
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  
  // Farming Information
  farmingExperience?: string;
  totalLandSize?: string;
  irrigationSource?: string;
  hasStorage?: boolean;
  hasTractor?: boolean;
  primaryCrops?: string[];
  
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
    try {
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
    } catch (error) {
      console.error('Error generating farmer code:', error);
      return `FAR${Date.now().toString().slice(-6)}`;
    }
  }

  async createComprehensiveFarmer(tenantId: string, farmerData: ComprehensiveFarmerData): Promise<CreatedFarmerResult> {
    try {
      console.log('Creating comprehensive farmer for tenant:', tenantId);
      console.log('Farmer data received:', farmerData);
      
      // Format mobile number
      const formattedMobile = this.formatMobileNumber(farmerData.phone);
      
      // Generate farmer code
      const farmerCode = await this.generateFarmerCode(tenantId);
      
      // Hash PIN for storage
      const pinHash = await this.hashPin(farmerData.pin);

      // Prepare metadata with comprehensive farmer information
      const metadata = {
        personal_info: {
          full_name: farmerData.fullName,
          email: farmerData.email || null,
          date_of_birth: farmerData.dateOfBirth || null,
          gender: farmerData.gender || null,
        },
        address_info: {
          village: farmerData.village || null,
          taluka: farmerData.taluka || null,
          district: farmerData.district || null,
          state: farmerData.state || null,
          pincode: farmerData.pincode || null,
        },
        farming_info: {
          farming_experience: farmerData.farmingExperience || null,
          total_land_size: farmerData.totalLandSize || null,
          irrigation_source: farmerData.irrigationSource || null,
          has_storage: farmerData.hasStorage || false,
          has_tractor: farmerData.hasTractor || false,
        },
        additional_info: {
          notes: farmerData.notes || null,
        }
      };

      // Create farmer record with correct schema fields
      const farmerInsertData = {
        tenant_id: tenantId,
        farmer_code: farmerCode,
        mobile_number: formattedMobile,
        pin_hash: pinHash,
        farming_experience_years: parseInt(farmerData.farmingExperience || '0') || 0,
        total_land_acres: parseFloat(farmerData.totalLandSize || '0') || 0,
        primary_crops: farmerData.primaryCrops || [],
        farm_type: 'mixed',
        has_irrigation: !!farmerData.irrigationSource,
        has_storage: farmerData.hasStorage || false,
        has_tractor: farmerData.hasTractor || false,
        irrigation_type: farmerData.irrigationSource || null,
        is_verified: false,
        total_app_opens: 0,
        total_queries: 0,
        language_preference: 'english',
        preferred_contact_method: 'mobile',
        notes: farmerData.notes || null,
        metadata: metadata
      };

      console.log('Farmer insert data:', farmerInsertData);

      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .insert(farmerInsertData)
        .select()
        .single();

      if (farmerError) {
        console.error('Database insert error:', farmerError);
        throw farmerError;
      }

      console.log('Farmer created successfully:', farmer);

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
      
      return farmer;
    } catch (error) {
      throw new Error(`Failed to fetch farmer details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateFarmerLogin(mobileNumber: string, pin: string, tenantId: string) {
    try {
      const formattedMobile = this.formatMobileNumber(mobileNumber);
      const pinHash = await this.hashPin(pin);

      // Look for farmer by mobile number and PIN hash
      const { data: farmer, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('mobile_number', formattedMobile)
        .eq('pin_hash', pinHash)
        .single();

      if (error || !farmer) {
        return { success: false, error: 'Invalid mobile number or PIN' };
      }

      console.log('Login successful for farmer:', farmer.farmer_code);

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

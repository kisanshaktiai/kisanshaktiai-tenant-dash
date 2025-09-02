
import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface ComprehensiveFarmerData {
  // Personal Information
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  languagePreference?: string;
  
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
    const cleanMobile = mobile.replace(/[^0-9]/g, ''); // Remove all non-digits including +
    
    // Remove country code if present and return only 10 digits
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      return cleanMobile.substring(2); // Remove '91' prefix
    } else if (cleanMobile.length === 10 && /^[6-9]/.test(cleanMobile)) {
      return cleanMobile; // Already in correct format
    }
    
    // Return cleaned mobile as-is if it doesn't match expected patterns
    return cleanMobile;
  }

  private async generateFarmerCodeWithFunction(tenantId: string): Promise<string> {
    try {
      console.log('Generating farmer code using database function for tenant:', tenantId);
      
      const { data, error } = await supabase.rpc('generate_farmer_code', {
        p_tenant_id: tenantId
      });

      if (error) {
        console.error('Error calling generate_farmer_code function:', error);
        throw error;
      }

      console.log('Generated farmer code:', data);
      return data;
    } catch (error) {
      console.error('Error generating farmer code:', error);
      // Fallback to simple generation if function fails
      return `KIS${Date.now().toString().slice(-6)}`;
    }
  }

  async createComprehensiveFarmer(tenantId: string, farmerData: ComprehensiveFarmerData): Promise<CreatedFarmerResult> {
    try {
      console.log('Creating comprehensive farmer for tenant:', tenantId);
      console.log('Farmer data received:', farmerData);
      
      // Verify user has access to this tenant
      const { data: userTenant, error: accessError } = await supabase
        .from('user_tenants')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (accessError || !userTenant) {
        console.error('User does not have access to tenant:', tenantId, accessError);
        return {
          success: false,
          farmer: null,
          farmerId: '',
          farmerCode: '',
          mobileNumber: '',
          error: 'You do not have permission to create farmers for this tenant',
        };
      }

      // Format mobile number to 10 digits only
      const formattedMobile = this.formatMobileNumber(farmerData.phone);
      console.log('Original mobile:', farmerData.phone, 'Formatted mobile:', formattedMobile);
      
      // Generate farmer code using database function
      const farmerCode = await this.generateFarmerCodeWithFunction(tenantId);
      
      // Hash PIN for storage
      const pinHash = await this.hashPin(farmerData.pin);

      // Prepare metadata with comprehensive farmer information
      const metadata = {
        personal_info: {
          full_name: farmerData.fullName,
          email: farmerData.email || null,
          date_of_birth: farmerData.dateOfBirth || null,
          gender: farmerData.gender || null,
          language_preference: farmerData.languagePreference || 'en',
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
        language_preference: farmerData.languagePreference || 'en',
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
        
        // Provide more specific error messages based on the error
        let errorMessage = 'Failed to create farmer';
        if (farmerError.code === '42501') {
          errorMessage = 'Permission denied. Please ensure you have access to this tenant.';
        } else if (farmerError.code === '23505') {
          errorMessage = 'A farmer with this mobile number already exists.';
        } else if (farmerError.message?.includes('mobile_number_check')) {
          errorMessage = 'Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.';
        } else if (farmerError.message) {
          errorMessage = farmerError.message;
        }
        
        return {
          success: false,
          farmer: null,
          farmerId: '',
          farmerCode: '',
          mobileNumber: '',
          error: errorMessage,
        };
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
      
      let errorMessage = 'Failed to create farmer';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        farmer: null,
        farmerId: '',
        farmerCode: '',
        mobileNumber: '',
        error: errorMessage,
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


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
        .eq('phone_number', formattedMobile)
        .eq('tenant_id', tenantId)
        .single();

      if (existingFarmer) {
        throw new Error('A farmer with this mobile number already exists');
      }

      // Generate farmer code
      const farmerCode = await this.generateFarmerCode(tenantId);
      
      // Hash PIN
      const pinHash = await this.hashPin(farmerData.pin);

      // Prepare address string
      const addressParts = [
        farmerData.village,
        farmerData.taluka,
        farmerData.district,
        farmerData.state,
        farmerData.pincode
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ');

      // Create comprehensive metadata object
      const comprehensiveMetadata = {
        pinHash: pinHash,
        personalInfo: {
          dateOfBirth: farmerData.dateOfBirth,
          gender: farmerData.gender,
          email: farmerData.email
        },
        addressDetails: {
          village: farmerData.village,
          taluka: farmerData.taluka,
          district: farmerData.district,
          state: farmerData.state,
          pincode: farmerData.pincode
        },
        farmingDetails: {
          irrigationSource: farmerData.irrigationSource,
          hasStorage: farmerData.hasStorage,
          hasTractor: farmerData.hasTractor
        },
        additionalNotes: farmerData.notes || '',
        createdVia: 'comprehensive_form',
        createdAt: new Date().toISOString()
      };

      // Create farmer record with available fields
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .insert({
          tenant_id: tenantId,
          farmer_code: farmerCode,
          farmer_name: farmerData.fullName,
          phone_number: formattedMobile,
          email: farmerData.email || null,
          address_line_1: fullAddress,
          farming_experience_years: parseInt(farmerData.farmingExperience) || 0,
          total_land_acres: parseFloat(farmerData.totalLandSize) || 0,
          primary_crops: farmerData.primaryCrops,
          farm_type: 'mixed',
          has_irrigation: !!farmerData.irrigationSource,
          storage_facility: farmerData.hasStorage,
          equipment_owned: farmerData.hasTractor ? ['tractor'] : [],
          is_verified: false,
          total_app_opens: 0,
          total_queries: 0,
          language_preference: 'english',
          preferred_contact_method: 'mobile',
          // Store comprehensive metadata in the user_metadata field
          user_metadata: comprehensiveMetadata
        })
        .select()
        .single();

      if (farmerError) {
        throw farmerError;
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
      
      // Parse user_metadata to get additional comprehensive data
      let additionalData = {};
      if (farmer.user_metadata) {
        try {
          additionalData = typeof farmer.user_metadata === 'string' 
            ? JSON.parse(farmer.user_metadata) 
            : farmer.user_metadata;
        } catch (e) {
          console.warn('Could not parse farmer user_metadata:', e);
        }
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

      // Look for farmer with matching mobile number
      const { data: farmer, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('phone_number', formattedMobile)
        .eq('tenant_id', tenantId)
        .single();

      if (error || !farmer) {
        return { success: false, error: 'Invalid mobile number or PIN' };
      }

      // Check PIN hash from user_metadata
      let storedPinHash = null;
      if (farmer.user_metadata) {
        try {
          const metadata = typeof farmer.user_metadata === 'string' 
            ? JSON.parse(farmer.user_metadata) 
            : farmer.user_metadata;
          storedPinHash = metadata.pinHash;
        } catch (e) {
          console.warn('Could not parse farmer user_metadata for PIN validation:', e);
        }
      }

      if (!storedPinHash || storedPinHash !== pinHash) {
        return { success: false, error: 'Invalid mobile number or PIN' };
      }

      // Update last login in user_metadata
      const currentMetadata = farmer.user_metadata 
        ? (typeof farmer.user_metadata === 'string' 
           ? JSON.parse(farmer.user_metadata) 
           : farmer.user_metadata)
        : {};
      
      const updatedMetadata = {
        ...currentMetadata,
        lastLogin: new Date().toISOString(),
      };

      await supabase
        .from('farmers')
        .update({ 
          user_metadata: updatedMetadata
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

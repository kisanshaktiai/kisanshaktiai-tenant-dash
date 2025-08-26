
import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

// Types based on existing database structure
export interface FarmerEngagementMetrics {
  id: string;
  farmer_id: string;
  tenant_id: string;
  app_opens_count: number;
  last_app_open: string | null;
  features_used: string[];
  communication_responses: number;
  activity_score: number;
  churn_risk_score: number;
  engagement_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface FarmerTag {
  id: string;
  farmer_id: string;
  tenant_id: string;
  tag_name: string;
  tag_color: string;
  created_at: string;
}

export interface FarmerNote {
  id: string;
  farmer_id: string;
  tenant_id: string;
  note_content: string;
  created_by: string;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerCommunication {
  id: string;
  farmer_id: string;
  tenant_id: string;
  communication_type: 'sms' | 'whatsapp' | 'email' | 'call';
  message_content: string;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  response_at: string | null;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata: Record<string, any>;
}

export interface FarmerSegment {
  id: string;
  tenant_id: string;
  segment_name: string;
  segment_criteria: Record<string, any>;
  description: string;
  color: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BulkOperationRequest {
  operation_type: 'message' | 'tag' | 'segment' | 'export';
  farmer_ids: string[];
  operation_data: Record<string, any>;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface SearchParams {
  query?: string;
  engagement_level?: 'low' | 'medium' | 'high';
  churn_risk?: 'low' | 'medium' | 'high';
  tags?: string[];
  segments?: string[];
  last_active_days?: number;
}

class FarmerManagementService extends BaseApiService {
  protected basePath = '/farmer-management';

  // Mock engagement metrics for now since the exact table structure varies
  async getEngagementMetrics(tenantId: string, farmerId?: string): Promise<FarmerEngagementMetrics[]> {
    try {
      console.log('Getting engagement metrics for tenant:', tenantId, 'farmer:', farmerId);
      
      // Get farmers and create mock engagement data
      let query = supabase
        .from('farmers')
        .select('id, tenant_id, created_at')
        .eq('tenant_id', tenantId);
      
      if (farmerId) {
        query = query.eq('id', farmerId);
      }
      
      const { data: farmers, error } = await query;
      if (error) throw error;
      
      return (farmers || []).map(farmer => ({
        id: `${farmer.id}_metrics`,
        farmer_id: farmer.id,
        tenant_id: farmer.tenant_id,
        app_opens_count: Math.floor(Math.random() * 50),
        last_app_open: new Date().toISOString(),
        features_used: ['dashboard', 'weather'],
        communication_responses: Math.floor(Math.random() * 10),
        activity_score: Math.floor(Math.random() * 100),
        churn_risk_score: Math.floor(Math.random() * 100),
        engagement_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        created_at: farmer.created_at,
        updated_at: farmer.created_at
      }));
    } catch (error) {
      throw new Error(`Failed to get engagement metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Mock farmer tags using existing structure
  async getFarmerTags(tenantId: string, farmerId?: string): Promise<FarmerTag[]> {
    try {
      console.log('Getting farmer tags for tenant:', tenantId, 'farmer:', farmerId);
      
      // Return mock data for now since farmer_tags table might not exist
      return [
        {
          id: 'tag1',
          farmer_id: farmerId || 'default',
          tenant_id: tenantId,
          tag_name: 'Premium Farmer',
          tag_color: '#10B981',
          created_at: new Date().toISOString()
        },
        {
          id: 'tag2',
          farmer_id: farmerId || 'default',
          tenant_id: tenantId,
          tag_name: 'High Yield',
          tag_color: '#F59E0B',
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new Error(`Failed to get farmer tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFarmerNotes(farmerId: string, tenantId: string): Promise<FarmerNote[]> {
    try {
      // Return mock data for now
      return [
        {
          id: 'note1',
          farmer_id: farmerId,
          tenant_id: tenantId,
          note_content: 'Farmer is very interested in organic farming methods.',
          created_by: 'admin',
          is_important: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new Error(`Failed to get farmer notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCommunicationHistory(farmerId: string, tenantId: string): Promise<FarmerCommunication[]> {
    try {
      // Return mock data for now
      return [
        {
          id: 'comm1',
          farmer_id: farmerId,
          tenant_id: tenantId,
          communication_type: 'sms',
          message_content: 'Welcome to our platform!',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          read_at: null,
          response_at: null,
          status: 'delivered',
          metadata: {}
        }
      ];
    } catch (error) {
      throw new Error(`Failed to get communication history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFarmerSegments(tenantId: string): Promise<FarmerSegment[]> {
    try {
      // Return mock data for now
      return [
        {
          id: 'segment1',
          tenant_id: tenantId,
          segment_name: 'High Value Farmers',
          segment_criteria: { min_land_size: 5, crops: ['wheat', 'rice'] },
          description: 'Farmers with large land holdings and key crops',
          color: '#3B82F6',
          created_by: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new Error(`Failed to get farmer segments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchFarmers(tenantId: string, params: SearchParams) {
    try {
      let query = supabase
        .from('farmers')
        .select(`
          *,
          lands(*)
        `)
        .eq('tenant_id', tenantId);

      if (params.query) {
        query = query.or(`farmer_code.ilike.%${params.query}%,primary_crops.cs.{${params.query}}`);
      }

      const { data: farmers, error } = await query;
      if (error) throw error;

      return {
        farmers: farmers || [],
        count: farmers?.length || 0
      };
    } catch (error) {
      throw new Error(`Failed to search farmers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Mock implementations for other methods
  async addFarmerTag(farmerId: string, tenantId: string, tagData: Partial<FarmerTag>): Promise<FarmerTag> {
    // Mock implementation
    return {
      id: `tag_${Date.now()}`,
      farmer_id: farmerId,
      tenant_id: tenantId,
      tag_name: tagData.tag_name || 'New Tag',
      tag_color: tagData.tag_color || '#3B82F6',
      created_at: new Date().toISOString()
    };
  }

  async addFarmerNote(farmerId: string, tenantId: string, noteData: Partial<FarmerNote>): Promise<FarmerNote> {
    // Mock implementation
    return {
      id: `note_${Date.now()}`,
      farmer_id: farmerId,
      tenant_id: tenantId,
      note_content: noteData.note_content || '',
      created_by: 'current_user',
      is_important: noteData.is_important || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async createFarmerSegment(tenantId: string, segmentData: Omit<FarmerSegment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FarmerSegment> {
    // Mock implementation
    return {
      id: `segment_${Date.now()}`,
      tenant_id: tenantId,
      ...segmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async performBulkOperation(tenantId: string, operation: BulkOperationRequest): Promise<BulkOperationResult> {
    try {
      // Mock implementation
      console.log('Performing bulk operation:', operation.operation_type, 'for', operation.farmer_ids.length, 'farmers');
      
      // Simulate some failures
      const failedCount = Math.floor(operation.farmer_ids.length * 0.1);
      const successCount = operation.farmer_ids.length - failedCount;
      
      return {
        success: successCount,
        failed: failedCount,
        errors: failedCount > 0 ? [`${failedCount} operations failed`] : []
      };
    } catch (error) {
      throw new Error(`Failed to perform bulk operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const farmerManagementService = new FarmerManagementService();

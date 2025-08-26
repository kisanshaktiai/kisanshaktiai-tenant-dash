
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

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
  message_content: string | null;
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
  description: string | null;
  color: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerLead {
  id: string;
  tenant_id: string;
  lead_name: string;
  phone: string | null;
  email: string | null;
  location: Record<string, any> | null;
  lead_source: string;
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assigned_to: string | null;
  notes: string | null;
  follow_up_date: string | null;
  converted_farmer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerImportJob {
  id: string;
  tenant_id: string;
  file_name: string;
  file_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  success_records: number;
  failed_records: number;
  validation_errors: any[];
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface BulkOperationRequest {
  farmer_ids: string[];
  operation_type: 'message' | 'tag' | 'segment' | 'export' | 'update';
  operation_data: Record<string, any>;
}

class FarmerManagementService extends BaseApiService {
  protected basePath = '/farmer-management';

  // Farmer Engagement Tracking
  async getEngagementMetrics(tenantId: string, farmerId?: string): Promise<FarmerEngagementMetrics[]> {
    try {
      let query = supabase
        .from('farmer_engagement_metrics')
        .select('*')
        .eq('tenant_id', tenantId);

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch engagement metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateEngagementMetrics(farmerId: string, tenantId: string, metrics: Partial<FarmerEngagementMetrics>): Promise<FarmerEngagementMetrics> {
    try {
      const { data, error } = await supabase
        .from('farmer_engagement_metrics')
        .upsert({
          farmer_id: farmerId,
          tenant_id: tenantId,
          ...metrics,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'farmer_id,tenant_id'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to update engagement metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Farmer Tags Management
  async getFarmerTags(tenantId: string, farmerId?: string): Promise<FarmerTag[]> {
    try {
      let query = supabase
        .from('farmer_tags')
        .select('*')
        .eq('tenant_id', tenantId);

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch farmer tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addFarmerTag(farmerId: string, tenantId: string, tagData: Omit<FarmerTag, 'id' | 'farmer_id' | 'tenant_id' | 'created_at'>): Promise<FarmerTag> {
    try {
      const { data, error } = await supabase
        .from('farmer_tags')
        .insert({
          farmer_id: farmerId,
          tenant_id: tenantId,
          ...tagData
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to add farmer tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeFarmerTag(tagId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('farmer_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw new Error(error.message);
    } catch (error) {
      throw new Error(`Failed to remove farmer tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Farmer Notes Management
  async getFarmerNotes(farmerId: string, tenantId: string): Promise<FarmerNote[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_notes')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch farmer notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addFarmerNote(farmerId: string, tenantId: string, noteData: Omit<FarmerNote, 'id' | 'farmer_id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FarmerNote> {
    try {
      const { data, error } = await supabase
        .from('farmer_notes')
        .insert({
          farmer_id: farmerId,
          tenant_id: tenantId,
          ...noteData
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to add farmer note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Communication History
  async getCommunicationHistory(farmerId: string, tenantId: string): Promise<FarmerCommunication[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_communications')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', tenantId)
        .order('sent_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch communication history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async recordCommunication(farmerId: string, tenantId: string, communicationData: Omit<FarmerCommunication, 'id' | 'farmer_id' | 'tenant_id' | 'sent_at'>): Promise<FarmerCommunication> {
    try {
      const { data, error } = await supabase
        .from('farmer_communications')
        .insert({
          farmer_id: farmerId,
          tenant_id: tenantId,
          ...communicationData,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to record communication: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Farmer Segments
  async getFarmerSegments(tenantId: string): Promise<FarmerSegment[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_segments')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch farmer segments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createFarmerSegment(tenantId: string, segmentData: Omit<FarmerSegment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FarmerSegment> {
    try {
      const { data, error } = await supabase
        .from('farmer_segments')
        .insert({
          tenant_id: tenantId,
          ...segmentData
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to create farmer segment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addFarmersToSegment(segmentId: string, farmerIds: string[]): Promise<void> {
    try {
      const segmentMembers = farmerIds.map(farmerId => ({
        segment_id: segmentId,
        farmer_id: farmerId
      }));

      const { error } = await supabase
        .from('farmer_segment_members')
        .insert(segmentMembers);

      if (error) throw new Error(error.message);
    } catch (error) {
      throw new Error(`Failed to add farmers to segment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Lead Management
  async getFarmerLeads(tenantId: string): Promise<FarmerLead[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch farmer leads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createFarmerLead(tenantId: string, leadData: Omit<FarmerLead, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FarmerLead> {
    try {
      const { data, error } = await supabase
        .from('farmer_leads')
        .insert({
          tenant_id: tenantId,
          ...leadData
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to create farmer lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateLeadStatus(leadId: string, status: FarmerLead['status'], notes?: string): Promise<FarmerLead> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('farmer_leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to update lead status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Bulk Operations
  async performBulkOperation(tenantId: string, operation: BulkOperationRequest): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };

    try {
      switch (operation.operation_type) {
        case 'tag':
          for (const farmerId of operation.farmer_ids) {
            try {
              await this.addFarmerTag(farmerId, tenantId, operation.operation_data);
              result.success++;
            } catch (error) {
              result.failed++;
              result.errors.push(`Failed to tag farmer ${farmerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          break;

        case 'segment':
          try {
            await this.addFarmersToSegment(operation.operation_data.segment_id, operation.farmer_ids);
            result.success = operation.farmer_ids.length;
          } catch (error) {
            result.failed = operation.farmer_ids.length;
            result.errors.push(`Failed to add farmers to segment: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'message':
          for (const farmerId of operation.farmer_ids) {
            try {
              await this.recordCommunication(farmerId, tenantId, {
                communication_type: operation.operation_data.type,
                message_content: operation.operation_data.message,
                status: 'sent',
                metadata: operation.operation_data.metadata || {}
              });
              result.success++;
            } catch (error) {
              result.failed++;
              result.errors.push(`Failed to send message to farmer ${farmerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          break;

        default:
          throw new Error(`Unsupported bulk operation: ${operation.operation_type}`);
      }

      return result;
    } catch (error) {
      throw new Error(`Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Import Management
  async getImportJobs(tenantId: string): Promise<FarmerImportJob[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_import_jobs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch import jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createImportJob(tenantId: string, jobData: Omit<FarmerImportJob, 'id' | 'tenant_id' | 'created_at'>): Promise<FarmerImportJob> {
    try {
      const { data, error } = await supabase
        .from('farmer_import_jobs')
        .insert({
          tenant_id: tenantId,
          ...jobData
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to create import job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Advanced Search
  async searchFarmers(tenantId: string, searchParams: {
    query?: string;
    tags?: string[];
    segments?: string[];
    engagement_level?: string;
    churn_risk?: 'low' | 'medium' | 'high';
    location?: Record<string, any>;
    last_active_days?: number;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('farmers')
        .select(`
          *,
          farmer_engagement_metrics(*),
          farmer_tags(*),
          farmer_notes(*)
        `)
        .eq('tenant_id', tenantId);

      if (searchParams.query) {
        query = query.or(`farmer_code.ilike.%${searchParams.query}%,primary_crops.cs.{${searchParams.query}}`);
      }

      if (searchParams.limit) {
        query = query.limit(searchParams.limit);
      }

      if (searchParams.offset) {
        query = query.range(searchParams.offset, searchParams.offset + (searchParams.limit || 50) - 1);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return {
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      throw new Error(`Failed to search farmers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const farmerManagementService = new FarmerManagementService();

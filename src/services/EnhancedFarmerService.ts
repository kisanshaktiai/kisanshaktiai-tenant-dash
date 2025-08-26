
import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface FarmerTag {
  id: string;
  tenant_id: string;
  farmer_id: string;
  tag_name: string;
  tag_color: string;
  created_at: string;
  created_by?: string;
}

export interface FarmerSegment {
  id: string;
  tenant_id: string;
  segment_name: string;
  segment_criteria: Record<string, any>;
  description?: string;
  color: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerNote {
  id: string;
  tenant_id: string;
  farmer_id: string;
  note_content: string;
  created_by?: string;
  is_important: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerCommunication {
  id: string;
  tenant_id: string;
  farmer_id: string;
  communication_type: 'sms' | 'whatsapp' | 'email' | 'call' | 'app_notification';
  message_content?: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  response_at?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  metadata: Record<string, any>;
  created_by?: string;
}

export interface FarmerEngagement {
  id: string;
  tenant_id: string;
  farmer_id: string;
  app_opens_count: number;
  last_app_open?: string;
  features_used: string[];
  communication_responses: number;
  activity_score: number;
  churn_risk_score: number;
  engagement_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface FarmerLead {
  id: string;
  tenant_id: string;
  lead_source: string;
  contact_name: string;
  phone?: string;
  email?: string;
  location?: Record<string, any>;
  land_size?: number;
  crops_interested?: string[];
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  assigned_to?: string;
  assigned_at?: string;
  converted_farmer_id?: string;
  converted_at?: string;
  next_follow_up?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BulkOperation {
  id: string;
  tenant_id: string;
  operation_type: string;
  target_farmer_ids: string[];
  operation_data: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_count: number;
  success_count: number;
  failed_count: number;
  created_by?: string;
  created_at: string;
  completed_at?: string;
  error_log: any[];
}

export interface AdvancedSearchFilters {
  search?: string;
  tags?: string[];
  segments?: string[];
  engagement_level?: 'low' | 'medium' | 'high';
  churn_risk?: 'low' | 'medium' | 'high';
  location?: {
    state?: string;
    district?: string;
    village?: string;
  };
  land_size?: {
    min?: number;
    max?: number;
  };
  crops?: string[];
  last_active_days?: number;
  has_irrigation?: boolean;
  farm_type?: string;
  created_date_range?: {
    start?: string;
    end?: string;
  };
}

class EnhancedFarmerService extends BaseApiService {
  protected basePath = '/enhanced-farmers';

  // Farmer Tags
  async getFarmerTags(tenantId: string, farmerId?: string): Promise<FarmerTag[]> {
    let query = supabase
      .from('farmer_tags')
      .select('*')
      .eq('tenant_id', tenantId);

    if (farmerId) {
      query = query.eq('farmer_id', farmerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addFarmerTag(tenantId: string, farmerId: string, tagData: Partial<FarmerTag>): Promise<FarmerTag> {
    const { data, error } = await supabase
      .from('farmer_tags')
      .insert({
        tenant_id: tenantId,
        farmer_id: farmerId,
        ...tagData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFarmerTag(tagId: string): Promise<void> {
    const { error } = await supabase
      .from('farmer_tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
  }

  // Farmer Segments
  async getFarmerSegments(tenantId: string): Promise<FarmerSegment[]> {
    const { data, error } = await supabase
      .from('farmer_segments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createFarmerSegment(tenantId: string, segmentData: Omit<FarmerSegment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FarmerSegment> {
    const { data, error } = await supabase
      .from('farmer_segments')
      .insert({
        tenant_id: tenantId,
        ...segmentData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Farmer Notes
  async getFarmerNotes(tenantId: string, farmerId: string): Promise<FarmerNote[]> {
    const { data, error } = await supabase
      .from('farmer_notes')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addFarmerNote(tenantId: string, farmerId: string, noteData: Partial<FarmerNote>): Promise<FarmerNote> {
    const { data, error } = await supabase
      .from('farmer_notes')
      .insert({
        tenant_id: tenantId,
        farmer_id: farmerId,
        ...noteData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Communication History
  async getCommunicationHistory(tenantId: string, farmerId?: string): Promise<FarmerCommunication[]> {
    let query = supabase
      .from('farmer_communications')
      .select('*')
      .eq('tenant_id', tenantId);

    if (farmerId) {
      query = query.eq('farmer_id', farmerId);
    }

    const { data, error } = await query.order('sent_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async logCommunication(tenantId: string, communicationData: Partial<FarmerCommunication>): Promise<FarmerCommunication> {
    const { data, error } = await supabase
      .from('farmer_communications')
      .insert({
        tenant_id: tenantId,
        ...communicationData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Farmer Engagement
  async getFarmerEngagement(tenantId: string, farmerId?: string): Promise<FarmerEngagement[]> {
    let query = supabase
      .from('farmer_engagement')
      .select('*')
      .eq('tenant_id', tenantId);

    if (farmerId) {
      query = query.eq('farmer_id', farmerId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async updateFarmerEngagement(tenantId: string, farmerId: string, engagementData: Partial<FarmerEngagement>): Promise<FarmerEngagement> {
    const { data, error } = await supabase
      .from('farmer_engagement')
      .upsert({
        tenant_id: tenantId,
        farmer_id: farmerId,
        ...engagementData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Lead Management
  async getFarmerLeads(tenantId: string, filters?: { status?: string; assigned_to?: string }): Promise<FarmerLead[]> {
    let query = supabase
      .from('farmer_leads')
      .select('*')
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createFarmerLead(tenantId: string, leadData: Partial<FarmerLead>): Promise<FarmerLead> {
    const { data, error } = await supabase
      .from('farmer_leads')
      .insert({
        tenant_id: tenantId,
        ...leadData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLeadStatus(leadId: string, status: string, metadata?: Record<string, any>): Promise<FarmerLead> {
    const { data, error } = await supabase
      .from('farmer_leads')
      .update({
        status,
        ...(metadata && { metadata }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Advanced Search
  async searchFarmersAdvanced(tenantId: string, filters: AdvancedSearchFilters): Promise<any[]> {
    let query = supabase
      .from('farmers')
      .select(`
        *,
        farmer_tags(tag_name, tag_color),
        farmer_engagement(engagement_level, activity_score, churn_risk_score),
        lands(*)
      `)
      .eq('tenant_id', tenantId);

    if (filters.search) {
      query = query.or(`farmer_code.ilike.%${filters.search}%,primary_crops.cs.{${filters.search}}`);
    }

    if (filters.has_irrigation !== undefined) {
      query = query.eq('has_irrigation', filters.has_irrigation);
    }

    if (filters.farm_type) {
      query = query.eq('farm_type', filters.farm_type);
    }

    if (filters.land_size?.min) {
      query = query.gte('total_land_acres', filters.land_size.min);
    }

    if (filters.land_size?.max) {
      query = query.lte('total_land_acres', filters.land_size.max);
    }

    if (filters.crops?.length) {
      query = query.overlaps('primary_crops', filters.crops);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  }

  // Bulk Operations
  async createBulkOperation(tenantId: string, operationData: Partial<BulkOperation>): Promise<BulkOperation> {
    const { data, error } = await supabase
      .from('bulk_operations')
      .insert({
        tenant_id: tenantId,
        ...operationData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBulkOperations(tenantId: string, limit = 50): Promise<BulkOperation[]> {
    const { data, error } = await supabase
      .from('bulk_operations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async updateBulkOperationStatus(operationId: string, status: string, progress?: any): Promise<BulkOperation> {
    const { data, error } = await supabase
      .from('bulk_operations')
      .update({
        status,
        ...(progress && progress),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', operationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Export Functions
  async exportFarmers(tenantId: string, farmerIds?: string[], format = 'csv'): Promise<Blob> {
    let query = supabase
      .from('farmers')
      .select(`
        *,
        farmer_tags(tag_name),
        farmer_engagement(engagement_level, activity_score),
        lands(*)
      `)
      .eq('tenant_id', tenantId);

    if (farmerIds?.length) {
      query = query.in('id', farmerIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Convert to CSV format
    if (format === 'csv') {
      const headers = ['Farmer Code', 'Experience (Years)', 'Land Size (Acres)', 'Primary Crops', 'Has Irrigation', 'Engagement Level', 'Tags'];
      const csvContent = [
        headers.join(','),
        ...data.map(farmer => [
          farmer.farmer_code,
          farmer.farming_experience_years,
          farmer.total_land_acres,
          farmer.primary_crops.join(';'),
          farmer.has_irrigation,
          farmer.farmer_engagement?.[0]?.engagement_level || 'N/A',
          farmer.farmer_tags?.map((tag: any) => tag.tag_name).join(';') || ''
        ].join(','))
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv' });
    }

    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }
}

export const enhancedFarmerService = new EnhancedFarmerService();

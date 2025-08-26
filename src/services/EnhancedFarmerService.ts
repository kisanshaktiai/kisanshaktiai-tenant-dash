
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

  async addFarmerTag(tenantId: string, farmerId: string, tagData: { tag_name: string; tag_color?: string; created_by?: string }): Promise<FarmerTag> {
    const { data, error } = await supabase
      .from('farmer_tags')
      .insert({
        tenant_id: tenantId,
        farmer_id: farmerId,
        tag_name: tagData.tag_name,
        tag_color: tagData.tag_color || '#3B82F6',
        created_by: tagData.created_by,
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
    
    return (data || []).map(segment => ({
      ...segment,
      segment_criteria: typeof segment.segment_criteria === 'object' ? 
        segment.segment_criteria as Record<string, any> : {}
    }));
  }

  async createFarmerSegment(tenantId: string, segmentData: Omit<FarmerSegment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FarmerSegment> {
    const { data, error } = await supabase
      .from('farmer_segments')
      .insert({
        tenant_id: tenantId,
        segment_name: segmentData.segment_name,
        segment_criteria: segmentData.segment_criteria,
        description: segmentData.description,
        color: segmentData.color || '#10B981',
        created_by: segmentData.created_by,
        is_active: segmentData.is_active,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      segment_criteria: typeof data.segment_criteria === 'object' ? 
        data.segment_criteria as Record<string, any> : {}
    };
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

  async addFarmerNote(tenantId: string, farmerId: string, noteData: { note_content: string; created_by?: string; is_important?: boolean; is_private?: boolean }): Promise<FarmerNote> {
    const { data, error } = await supabase
      .from('farmer_notes')
      .insert({
        tenant_id: tenantId,
        farmer_id: farmerId,
        note_content: noteData.note_content,
        created_by: noteData.created_by,
        is_important: noteData.is_important || false,
        is_private: noteData.is_private || false,
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
    
    return (data || []).map(comm => ({
      ...comm,
      communication_type: comm.communication_type as FarmerCommunication['communication_type'],
      status: comm.status as FarmerCommunication['status'],
      metadata: typeof comm.metadata === 'object' ? 
        comm.metadata as Record<string, any> : {}
    }));
  }

  async logCommunication(tenantId: string, communicationData: Omit<FarmerCommunication, 'id' | 'tenant_id' | 'sent_at'>): Promise<FarmerCommunication> {
    const { data, error } = await supabase
      .from('farmer_communications')
      .insert({
        tenant_id: tenantId,
        farmer_id: communicationData.farmer_id,
        communication_type: communicationData.communication_type,
        message_content: communicationData.message_content,
        delivered_at: communicationData.delivered_at,
        read_at: communicationData.read_at,
        response_at: communicationData.response_at,
        status: communicationData.status,
        metadata: communicationData.metadata || {},
        created_by: communicationData.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      communication_type: data.communication_type as FarmerCommunication['communication_type'],
      status: data.status as FarmerCommunication['status'],
      metadata: typeof data.metadata === 'object' ? 
        data.metadata as Record<string, any> : {}
    };
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
    
    return (data || []).map(engagement => ({
      ...engagement,
      engagement_level: engagement.engagement_level as FarmerEngagement['engagement_level']
    }));
  }

  async updateFarmerEngagement(tenantId: string, farmerId: string, engagementData: Partial<FarmerEngagement>): Promise<FarmerEngagement> {
    const { data, error } = await supabase
      .from('farmer_engagement')
      .upsert({
        tenant_id: tenantId,
        farmer_id: farmerId,
        app_opens_count: engagementData.app_opens_count,
        last_app_open: engagementData.last_app_open,
        features_used: engagementData.features_used,
        communication_responses: engagementData.communication_responses,
        activity_score: engagementData.activity_score,
        churn_risk_score: engagementData.churn_risk_score,
        engagement_level: engagementData.engagement_level,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      engagement_level: data.engagement_level as FarmerEngagement['engagement_level']
    };
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
    
    return (data || []).map(lead => ({
      ...lead,
      status: lead.status as FarmerLead['status'],
      location: typeof lead.location === 'object' ? 
        lead.location as Record<string, any> : {},
      metadata: typeof lead.metadata === 'object' ? 
        lead.metadata as Record<string, any> : {}
    }));
  }

  async createFarmerLead(tenantId: string, leadData: { lead_source: string; contact_name: string; phone?: string; email?: string; location?: Record<string, any>; land_size?: number; crops_interested?: string[]; lead_score?: number; status?: string; assigned_to?: string; assigned_at?: string; converted_farmer_id?: string; converted_at?: string; next_follow_up?: string; notes?: string; metadata?: Record<string, any> }): Promise<FarmerLead> {
    const { data, error } = await supabase
      .from('farmer_leads')
      .insert({
        tenant_id: tenantId,
        lead_source: leadData.lead_source,
        contact_name: leadData.contact_name,
        phone: leadData.phone,
        email: leadData.email,
        location: leadData.location || {},
        land_size: leadData.land_size,
        crops_interested: leadData.crops_interested,
        lead_score: leadData.lead_score || 0,
        status: leadData.status || 'new',
        assigned_to: leadData.assigned_to,
        assigned_at: leadData.assigned_at,
        converted_farmer_id: leadData.converted_farmer_id,
        converted_at: leadData.converted_at,
        next_follow_up: leadData.next_follow_up,
        notes: leadData.notes,
        metadata: leadData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as FarmerLead['status'],
      location: typeof data.location === 'object' ? 
        data.location as Record<string, any> : {},
      metadata: typeof data.metadata === 'object' ? 
        data.metadata as Record<string, any> : {}
    };
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
    return {
      ...data,
      status: data.status as FarmerLead['status'],
      location: typeof data.location === 'object' ? 
        data.location as Record<string, any> : {},
      metadata: typeof data.metadata === 'object' ? 
        data.metadata as Record<string, any> : {}
    };
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
  async createBulkOperation(tenantId: string, operationData: Omit<BulkOperation, 'id' | 'tenant_id' | 'created_at'>): Promise<BulkOperation> {
    const { data, error } = await supabase
      .from('bulk_operations')
      .insert({
        tenant_id: tenantId,
        operation_type: operationData.operation_type,
        target_farmer_ids: operationData.target_farmer_ids,
        operation_data: operationData.operation_data,
        status: operationData.status || 'pending',
        processed_count: operationData.processed_count || 0,
        success_count: operationData.success_count || 0,
        failed_count: operationData.failed_count || 0,
        created_by: operationData.created_by,
        completed_at: operationData.completed_at,
        error_log: operationData.error_log || [],
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as BulkOperation['status'],
      operation_data: typeof data.operation_data === 'object' ? 
        data.operation_data as Record<string, any> : {},
      error_log: Array.isArray(data.error_log) ? data.error_log : []
    };
  }

  async getBulkOperations(tenantId: string, limit = 50): Promise<BulkOperation[]> {
    const { data, error } = await supabase
      .from('bulk_operations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return (data || []).map(op => ({
      ...op,
      status: op.status as BulkOperation['status'],
      operation_data: typeof op.operation_data === 'object' ? 
        op.operation_data as Record<string, any> : {},
      error_log: Array.isArray(op.error_log) ? op.error_log : []
    }));
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
    return {
      ...data,
      status: data.status as BulkOperation['status'],
      operation_data: typeof data.operation_data === 'object' ? 
        data.operation_data as Record<string, any> : {},
      error_log: Array.isArray(data.error_log) ? data.error_log : []
    };
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

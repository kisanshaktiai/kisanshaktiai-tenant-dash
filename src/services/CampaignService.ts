
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  campaign_type: 'promotional' | 'educational' | 'seasonal' | 'government_scheme';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  timezone: string;
  total_budget?: number;
  spent_budget: number;
  target_audience_size: number;
  channels: string[];
  content_config: any;
  personalization_config: any;
  is_automated: boolean;
  automation_config: any;
  trigger_config: any;
  ab_testing_config: any;
  tags: string[];
  metadata: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignSegment {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  segment_type: string;
  criteria: any;
  logic_operator: 'AND' | 'OR';
  geographic_filters: any;
  behavioral_filters: any;
  crop_filters: any;
  exclusion_rules: any;
  estimated_size: number;
  last_calculated_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplate {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  template_type: string;
  category?: string;
  content: any;
  layout_config: any;
  style_config: any;
  language_versions: any;
  default_language: string;
  usage_count: number;
  performance_score?: number;
  is_public: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignExecution {
  id: string;
  campaign_id: string;
  tenant_id: string;
  farmer_id?: string;
  channel: string;
  message_content?: any;
  personalized_content?: any;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'clicked' | 'converted' | 'failed' | 'bounced';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  clicked_at?: string;
  converted_at?: string;
  engagement_score?: number;
  conversion_value?: number;
  error_message?: string;
  retry_count: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  tenant_id: string;
  date_period: string;
  hour_period?: number;
  channel: string;
  messages_sent: number;
  messages_delivered: number;
  messages_failed: number;
  bounce_rate: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  unsubscribe_rate: number;
  cost_per_message?: number;
  total_cost?: number;
  revenue_generated?: number;
  roi?: number;
  engagement_score?: number;
  viral_coefficient?: number;
  customer_lifetime_value?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignAutomation {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  automation_type: 'trigger_based' | 'drip_sequence' | 'event_based' | 'seasonal' | 'follow_up' | 'response_based';
  trigger_conditions: any;
  workflow_steps: any[];
  timing_config: any;
  is_active: boolean;
  total_executions: number;
  success_rate?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

class CampaignService {
  private getTenantId(): string {
    const { getTenantId } = useTenantIsolation();
    return getTenantId();
  }

  // Campaign CRUD operations
  async getCampaigns(): Promise<Campaign[]> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(campaign => ({
      ...campaign,
      channels: Array.isArray(campaign.channels) ? campaign.channels : [],
      content_config: campaign.content_config || {},
      personalization_config: campaign.personalization_config || {},
      automation_config: campaign.automation_config || {},
      trigger_config: campaign.trigger_config || {},
      ab_testing_config: campaign.ab_testing_config || {},
      tags: Array.isArray(campaign.tags) ? campaign.tags : [],
      metadata: campaign.metadata || {}
    })) as Campaign[];
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    if (!data) return null;
    
    return {
      ...data,
      channels: Array.isArray(data.channels) ? data.channels : [],
      content_config: data.content_config || {},
      personalization_config: data.personalization_config || {},
      automation_config: data.automation_config || {},
      trigger_config: data.trigger_config || {},
      ab_testing_config: data.ab_testing_config || {},
      tags: Array.isArray(data.tags) ? data.tags : [],
      metadata: data.metadata || {}
    } as Campaign;
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const tenantId = this.getTenantId();
    
    // Ensure required fields are present
    if (!campaignData.name || !campaignData.campaign_type) {
      throw new Error('Campaign name and type are required');
    }

    const insertData = {
      name: campaignData.name,
      description: campaignData.description,
      campaign_type: campaignData.campaign_type,
      status: campaignData.status || 'draft',
      start_date: campaignData.start_date,
      end_date: campaignData.end_date,
      timezone: campaignData.timezone || 'UTC',
      total_budget: campaignData.total_budget,
      spent_budget: campaignData.spent_budget || 0,
      target_audience_size: campaignData.target_audience_size || 0,
      channels: campaignData.channels || [],
      content_config: campaignData.content_config || {},
      personalization_config: campaignData.personalization_config || {},
      is_automated: campaignData.is_automated || false,
      automation_config: campaignData.automation_config || {},
      trigger_config: campaignData.trigger_config || {},
      ab_testing_config: campaignData.ab_testing_config || {},
      tags: campaignData.tags || [],
      metadata: campaignData.metadata || {},
      created_by: campaignData.created_by
    };

    const { data, error } = await supabase
      .from('campaigns')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.transformCampaignData(data);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        name: updates.name,
        description: updates.description,
        campaign_type: updates.campaign_type,
        status: updates.status,
        start_date: updates.start_date,
        end_date: updates.end_date,
        timezone: updates.timezone,
        total_budget: updates.total_budget,
        spent_budget: updates.spent_budget,
        target_audience_size: updates.target_audience_size,
        channels: updates.channels,
        content_config: updates.content_config,
        personalization_config: updates.personalization_config,
        is_automated: updates.is_automated,
        automation_config: updates.automation_config,
        trigger_config: updates.trigger_config,
        ab_testing_config: updates.ab_testing_config,
        tags: updates.tags,
        metadata: updates.metadata
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return this.transformCampaignData(data);
  }

  async deleteCampaign(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  // Segment management
  async getSegments(): Promise<CampaignSegment[]> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaign_segments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(segment => ({
      ...segment,
      criteria: segment.criteria || {},
      geographic_filters: segment.geographic_filters || {},
      behavioral_filters: segment.behavioral_filters || {},
      crop_filters: segment.crop_filters || {},
      exclusion_rules: segment.exclusion_rules || {}
    })) as CampaignSegment[];
  }

  async createSegment(segmentData: Partial<CampaignSegment>): Promise<CampaignSegment> {
    const tenantId = this.getTenantId();
    
    if (!segmentData.name) {
      throw new Error('Segment name is required');
    }

    const insertData = {
      name: segmentData.name,
      description: segmentData.description,
      segment_type: segmentData.segment_type || 'custom',
      criteria: segmentData.criteria || {},
      logic_operator: segmentData.logic_operator || 'AND',
      geographic_filters: segmentData.geographic_filters || {},
      behavioral_filters: segmentData.behavioral_filters || {},
      crop_filters: segmentData.crop_filters || {},
      exclusion_rules: segmentData.exclusion_rules || {},
      estimated_size: segmentData.estimated_size || 0,
      is_active: segmentData.is_active !== false,
      created_by: segmentData.created_by
    };

    const { data, error } = await supabase
      .from('campaign_segments')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.transformSegmentData(data);
  }

  async calculateSegmentSize(criteria: Record<string, any>): Promise<number> {
    // This would implement the logic to calculate segment size based on criteria
    // For now, returning a mock value
    return Math.floor(Math.random() * 5000) + 100;
  }

  // Template management
  async getTemplates(templateType?: string): Promise<CampaignTemplate[]> {
    const tenantId = this.getTenantId();
    let query = supabase
      .from('campaign_templates')
      .select('*')
      .or(`tenant_id.eq.${tenantId},is_public.eq.true`)
      .eq('is_active', true);

    if (templateType) {
      query = query.eq('template_type', templateType);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });

    if (error) throw error;
    return (data || []).map(template => ({
      ...template,
      content: template.content || {},
      layout_config: template.layout_config || {},
      style_config: template.style_config || {},
      language_versions: template.language_versions || {}
    })) as CampaignTemplate[];
  }

  async createTemplate(templateData: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    const tenantId = this.getTenantId();
    
    if (!templateData.name || !templateData.template_type) {
      throw new Error('Template name and type are required');
    }

    const insertData = {
      name: templateData.name,
      description: templateData.description,
      template_type: templateData.template_type,
      category: templateData.category,
      content: templateData.content || {},
      layout_config: templateData.layout_config || {},
      style_config: templateData.style_config || {},
      language_versions: templateData.language_versions || {},
      default_language: templateData.default_language || 'en',
      usage_count: templateData.usage_count || 0,
      performance_score: templateData.performance_score,
      is_public: templateData.is_public || false,
      is_active: templateData.is_active !== false,
      created_by: templateData.created_by
    };

    const { data, error } = await supabase
      .from('campaign_templates')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.transformTemplateData(data);
  }

  // Campaign execution
  async getCampaignExecutions(campaignId: string): Promise<CampaignExecution[]> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaign_executions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(execution => ({
      ...execution,
      message_content: execution.message_content || {},
      personalized_content: execution.personalized_content || {},
      metadata: execution.metadata || {}
    })) as CampaignExecution[];
  }

  async executeCampaign(campaignId: string): Promise<void> {
    // This would implement the campaign execution logic
    // Including audience targeting, content personalization, and delivery
    console.log(`Executing campaign ${campaignId}`);
  }

  // Analytics
  async getCampaignAnalytics(campaignId: string, dateRange?: { start: string; end: string }): Promise<CampaignAnalytics[]> {
    const tenantId = this.getTenantId();
    let query = supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('tenant_id', tenantId);

    if (dateRange) {
      query = query
        .gte('date_period', dateRange.start)
        .lte('date_period', dateRange.end);
    }

    const { data, error } = await query.order('date_period', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaignMetrics(campaignId: string) {
    const analytics = await this.getCampaignAnalytics(campaignId);
    
    const totalSent = analytics.reduce((sum, a) => sum + a.messages_sent, 0);
    const totalDelivered = analytics.reduce((sum, a) => sum + a.messages_delivered, 0);
    const totalCost = analytics.reduce((sum, a) => sum + (a.total_cost || 0), 0);
    const totalRevenue = analytics.reduce((sum, a) => sum + (a.revenue_generated || 0), 0);
    
    const avgOpenRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.open_rate, 0) / analytics.length 
      : 0;
    
    const avgClickRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.click_rate, 0) / analytics.length 
      : 0;
    
    const avgConversionRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.conversion_rate, 0) / analytics.length 
      : 0;

    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    return {
      totalSent,
      totalDelivered,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      avgOpenRate,
      avgClickRate,
      avgConversionRate,
      totalCost,
      totalRevenue,
      roi,
      channelBreakdown: this.getChannelBreakdown(analytics),
    };
  }

  private getChannelBreakdown(analytics: CampaignAnalytics[]) {
    const channels: any = {};
    analytics.forEach(a => {
      if (!channels[a.channel]) {
        channels[a.channel] = {
          sent: 0,
          delivered: 0,
          cost: 0,
          revenue: 0,
        };
      }
      channels[a.channel].sent += a.messages_sent;
      channels[a.channel].delivered += a.messages_delivered;
      channels[a.channel].cost += a.total_cost || 0;
      channels[a.channel].revenue += a.revenue_generated || 0;
    });
    return channels;
  }

  // Automation management
  async getAutomations(): Promise<CampaignAutomation[]> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaign_automations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(automation => ({
      ...automation,
      trigger_conditions: automation.trigger_conditions || {},
      workflow_steps: Array.isArray(automation.workflow_steps) ? automation.workflow_steps : [],
      timing_config: automation.timing_config || {}
    })) as CampaignAutomation[];
  }

  async createAutomation(automationData: Partial<CampaignAutomation>): Promise<CampaignAutomation> {
    const tenantId = this.getTenantId();
    
    if (!automationData.name || !automationData.automation_type) {
      throw new Error('Automation name and type are required');
    }

    const insertData = {
      name: automationData.name,
      description: automationData.description,
      automation_type: automationData.automation_type,
      trigger_conditions: automationData.trigger_conditions || {},
      workflow_steps: automationData.workflow_steps || [],
      timing_config: automationData.timing_config || {},
      is_active: automationData.is_active !== false,
      total_executions: automationData.total_executions || 0,
      success_rate: automationData.success_rate,
      created_by: automationData.created_by
    };

    const { data, error } = await supabase
      .from('campaign_automations')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.transformAutomationData(data);
  }

  async toggleAutomation(id: string, isActive: boolean): Promise<void> {
    const tenantId = this.getTenantId();
    const { error } = await supabase
      .from('campaign_automations')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  // Helper methods to transform data
  private transformCampaignData(data: any): Campaign {
    return {
      ...data,
      channels: Array.isArray(data.channels) ? data.channels : [],
      content_config: data.content_config || {},
      personalization_config: data.personalization_config || {},
      automation_config: data.automation_config || {},
      trigger_config: data.trigger_config || {},
      ab_testing_config: data.ab_testing_config || {},
      tags: Array.isArray(data.tags) ? data.tags : [],
      metadata: data.metadata || {}
    };
  }

  private transformSegmentData(data: any): CampaignSegment {
    return {
      ...data,
      criteria: data.criteria || {},
      geographic_filters: data.geographic_filters || {},
      behavioral_filters: data.behavioral_filters || {},
      crop_filters: data.crop_filters || {},
      exclusion_rules: data.exclusion_rules || {}
    };
  }

  private transformTemplateData(data: any): CampaignTemplate {
    return {
      ...data,
      content: data.content || {},
      layout_config: data.layout_config || {},
      style_config: data.style_config || {},
      language_versions: data.language_versions || {}
    };
  }

  private transformAutomationData(data: any): CampaignAutomation {
    return {
      ...data,
      trigger_conditions: data.trigger_conditions || {},
      workflow_steps: Array.isArray(data.workflow_steps) ? data.workflow_steps : [],
      timing_config: data.timing_config || {}
    };
  }
}

export const campaignService = new CampaignService();

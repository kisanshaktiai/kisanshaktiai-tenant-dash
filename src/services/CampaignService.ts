
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
  content_config: Record<string, any>;
  personalization_config: Record<string, any>;
  is_automated: boolean;
  automation_config: Record<string, any>;
  trigger_config: Record<string, any>;
  ab_testing_config: Record<string, any>;
  tags: string[];
  metadata: Record<string, any>;
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
  criteria: Record<string, any>;
  logic_operator: 'AND' | 'OR';
  geographic_filters: Record<string, any>;
  behavioral_filters: Record<string, any>;
  crop_filters: Record<string, any>;
  exclusion_rules: Record<string, any>;
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
  content: Record<string, any>;
  layout_config: Record<string, any>;
  style_config: Record<string, any>;
  language_versions: Record<string, any>;
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
  message_content?: Record<string, any>;
  personalized_content?: Record<string, any>;
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
  metadata: Record<string, any>;
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
  trigger_conditions: Record<string, any>;
  workflow_steps: any[];
  timing_config: Record<string, any>;
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
    return data || [];
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
    return data;
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        ...campaignData,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    return data || [];
  }

  async createSegment(segmentData: Partial<CampaignSegment>): Promise<CampaignSegment> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaign_segments')
      .insert({
        ...segmentData,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
    return data || [];
  }

  async createTemplate(templateData: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaign_templates')
      .insert({
        ...templateData,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
    return data || [];
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
    const channels = {};
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
    return data || [];
  }

  async createAutomation(automationData: Partial<CampaignAutomation>): Promise<CampaignAutomation> {
    const tenantId = this.getTenantId();
    const { data, error } = await supabase
      .from('campaign_automations')
      .insert({
        ...automationData,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
}

export const campaignService = new CampaignService();

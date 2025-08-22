
import { supabase } from '@/integrations/supabase/client';
import { Campaign, CampaignTemplate, CampaignMessage, CampaignStats } from '@/types/campaign';

export class CampaignService {
  async getCampaigns(tenantId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCampaignTemplates(): Promise<CampaignTemplate[]> {
    const { data, error } = await supabase
      .from('campaign_templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaignMessages(campaignId: string): Promise<CampaignMessage[]> {
    const { data, error } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return data || [];
  }

  async getCampaignStats(tenantId: string): Promise<CampaignStats> {
    // Get total campaigns
    const { count: totalCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get active campaigns
    const { count: activeCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['running', 'scheduled']);

    return {
      total_campaigns: totalCampaigns || 0,
      active_campaigns: activeCampaigns || 0,
      total_reach: 0, // Will be calculated from deliveries
      total_engagement: 0,
      average_open_rate: 0,
      average_click_rate: 0,
      budget_utilization: 0
    };
  }

  async duplicateCampaign(id: string): Promise<Campaign> {
    const original = await this.getCampaign(id);
    if (!original) throw new Error('Campaign not found');

    const duplicate = {
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      status: 'draft' as const,
      actual_start: undefined,
      actual_end: undefined,
      budget_consumed: 0,
      created_at: undefined,
      updated_at: undefined
    };

    return this.createCampaign(duplicate);
  }

  async pauseCampaign(id: string): Promise<Campaign> {
    return this.updateCampaign(id, { 
      status: 'paused',
      actual_end: new Date().toISOString()
    });
  }

  async resumeCampaign(id: string): Promise<Campaign> {
    return this.updateCampaign(id, { 
      status: 'running',
      actual_start: new Date().toISOString()
    });
  }
}

export const campaignService = new CampaignService();

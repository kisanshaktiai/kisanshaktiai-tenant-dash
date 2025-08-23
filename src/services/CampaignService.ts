
import { Campaign, CampaignTemplate, CampaignMessage, CampaignStats } from '@/types/campaign';

export class CampaignService {
  async getCampaigns(tenantId: string): Promise<Campaign[]> {
    // Mock implementation since campaigns table doesn't exist
    return [
      {
        id: 'mock-campaign-1',
        tenant_id: tenantId,
        name: 'Summer Crop Advisory',
        description: 'Educational campaign for summer crop management',
        campaign_type: 'educational',
        status: 'running',
        target_audience_config: {},
        content_config: {},
        channels: ['sms', 'app_notification'],
        budget_allocated: 50000,
        budget_consumed: 15000,
        automation_config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    // Mock implementation
    return {
      id,
      tenant_id: 'mock-tenant',
      name: 'Mock Campaign',
      campaign_type: 'promotional',
      status: 'draft',
      target_audience_config: {},
      content_config: {},
      channels: ['sms'],
      budget_allocated: 10000,
      budget_consumed: 0,
      automation_config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    return {
      id: crypto.randomUUID(),
      tenant_id: campaign.tenant_id || 'mock-tenant',
      name: campaign.name || 'New Campaign',
      campaign_type: campaign.campaign_type || 'promotional',
      status: 'draft',
      target_audience_config: campaign.target_audience_config || {},
      content_config: campaign.content_config || {},
      channels: campaign.channels || ['sms'],
      budget_allocated: campaign.budget_allocated || 0,
      budget_consumed: 0,
      automation_config: campaign.automation_config || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    return {
      id,
      tenant_id: 'mock-tenant',
      name: updates.name || 'Updated Campaign',
      campaign_type: updates.campaign_type || 'promotional',
      status: updates.status || 'draft',
      target_audience_config: updates.target_audience_config || {},
      content_config: updates.content_config || {},
      channels: updates.channels || ['sms'],
      budget_allocated: updates.budget_allocated || 0,
      budget_consumed: updates.budget_consumed || 0,
      automation_config: updates.automation_config || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async deleteCampaign(id: string): Promise<void> {
    // Mock implementation
    console.log(`Campaign ${id} deleted`);
  }

  async getCampaignTemplates(): Promise<CampaignTemplate[]> {
    return [
      {
        id: 'template-1',
        name: 'Weather Alert Template',
        campaign_type: 'educational',
        template_config: {},
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  async getCampaignMessages(campaignId: string): Promise<CampaignMessage[]> {
    return [
      {
        id: 'message-1',
        campaign_id: campaignId,
        tenant_id: 'mock-tenant',
        message_type: 'sms',
        channel: 'sms',
        content: 'Mock campaign message',
        variables: {},
        language_code: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  async getCampaignStats(tenantId: string): Promise<CampaignStats> {
    return {
      total_campaigns: 5,
      active_campaigns: 2,
      total_reach: 1500,
      total_engagement: 450,
      average_open_rate: 75.5,
      average_click_rate: 12.3,
      budget_utilization: 68.2
    };
  }

  async duplicateCampaign(id: string): Promise<Campaign> {
    const original = await this.getCampaign(id);
    if (!original) throw new Error('Campaign not found');

    return this.createCampaign({
      ...original,
      name: `${original.name} (Copy)`,
      status: 'draft',
      budget_consumed: 0,
    });
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

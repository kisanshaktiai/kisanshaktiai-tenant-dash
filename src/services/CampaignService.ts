
import { supabase } from '@/integrations/supabase/client';

export class CampaignService {
  async getCampaigns(tenantId: string) {
    console.log('CampaignService: Loading campaigns for tenant:', tenantId);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading campaigns:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('CampaignService error:', error);
      throw error;
    }
  }

  async createCampaign(campaignData: any, tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ ...campaignData, tenant_id: tenantId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: string, campaignData: any, tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(campaignData)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string, tenantId: string) {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }
}

export const campaignService = new CampaignService();

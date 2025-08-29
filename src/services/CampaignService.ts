
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

  async getSegments() {
    try {
      // Mock data for now - replace with actual implementation
      return [
        {
          id: '1',
          name: 'High Engagement Farmers',
          description: 'Farmers with high app usage and engagement',
          estimated_size: 1250
        },
        {
          id: '2',
          name: 'New Farmers',
          description: 'Farmers registered in the last 30 days',
          estimated_size: 320
        },
        {
          id: '3',
          name: 'Rice Farmers',
          description: 'Farmers primarily growing rice',
          estimated_size: 890
        },
        {
          id: '4',
          name: 'Large Land Holders',
          description: 'Farmers with land holdings > 5 acres',
          estimated_size: 450
        }
      ];
    } catch (error) {
      console.error('Error loading segments:', error);
      throw error;
    }
  }

  async getTemplates() {
    try {
      // Mock data for now - replace with actual implementation
      return [
        {
          id: '1',
          name: 'Welcome Message',
          description: 'Standard welcome message for new farmers',
          template_type: 'promotional',
          usage_count: 45,
          performance_score: 78,
          content: {
            subject: 'Welcome to our farming community!',
            body: 'Dear {farmer_name}, welcome to our platform. We\'re excited to help you grow better crops.'
          }
        },
        {
          id: '2',
          name: 'Seasonal Advisory',
          description: 'Crop advisory for seasonal changes',
          template_type: 'educational',
          usage_count: 23,
          performance_score: 85,
          content: {
            subject: 'Important seasonal advice for {crop_type}',
            body: 'Hi {farmer_name}, here are some important tips for the upcoming season in {location}.'
          }
        },
        {
          id: '3',
          name: 'Product Launch',
          description: 'New product announcement template',
          template_type: 'promotional',
          usage_count: 67,
          performance_score: 72,
          content: {
            subject: 'New product available in your area!',
            body: 'Hello {farmer_name}, we have a new product that could benefit your {crop_type} farming.'
          }
        }
      ];
    } catch (error) {
      console.error('Error loading templates:', error);
      throw error;
    }
  }

  async calculateSegmentSize(targetAudience: any) {
    try {
      // Mock calculation - replace with actual implementation
      let baseSize = 1000;
      
      if (targetAudience.segments && targetAudience.segments.length > 0) {
        baseSize = targetAudience.segments.length * 300;
      }
      
      if (targetAudience.criteria && targetAudience.criteria.custom) {
        baseSize = Math.max(baseSize * 0.7, 50);
      }
      
      return Math.floor(baseSize);
    } catch (error) {
      console.error('Error calculating segment size:', error);
      return 0;
    }
  }
}

export const campaignService = new CampaignService();

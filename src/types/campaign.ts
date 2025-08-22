
export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  campaign_type: 'promotional' | 'educational' | 'seasonal' | 'government_scheme';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  target_audience_config: Record<string, any>;
  content_config: Record<string, any>;
  channels: string[];
  budget_allocated: number;
  budget_consumed: number;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  automation_config: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplate {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  campaign_type: string;
  template_config: Record<string, any>;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMessage {
  id: string;
  campaign_id: string;
  tenant_id: string;
  message_type: string;
  channel: 'sms' | 'whatsapp' | 'email' | 'app_notification';
  subject?: string;
  content: string;
  variables: Record<string, any>;
  template_id?: string;
  language_code: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignAudience {
  id: string;
  tenant_id: string;
  campaign_id: string;
  farmer_id: string;
  inclusion_reason?: string;
  exclusion_reason?: string;
  is_excluded: boolean;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignDelivery {
  id: string;
  campaign_id: string;
  message_id: string;
  farmer_id: string;
  tenant_id: string;
  channel: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  scheduled_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  delivery_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  tenant_id: string;
  metric_name: string;
  metric_value: number;
  dimensions: Record<string, any>;
  recorded_at: string;
  created_at: string;
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_reach: number;
  total_engagement: number;
  average_open_rate: number;
  average_click_rate: number;
  budget_utilization: number;
}


export interface ExecutiveDashboardMetric {
  id: string;
  tenant_id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'kpi' | 'trend' | 'comparison';
  time_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dimensions: Record<string, any>;
  metadata: Record<string, any>;
  recorded_date: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerAnalytics {
  id: string;
  tenant_id: string;
  farmer_id: string;
  adoption_score: number;
  engagement_score: number;
  lifetime_value: number;
  churn_risk_score: number;
  segment: string;
  last_activity_date: string;
  total_transactions: number;
  total_spent: number;
  app_usage_days: number;
  features_used: string[];
  performance_metrics: Record<string, any>;
  predicted_metrics: Record<string, any>;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProductAnalytics {
  id: string;
  tenant_id: string;
  product_id: string;
  time_period: string;
  period_start: string;
  period_end: string;
  views_count: number;
  inquiries_count: number;
  orders_count: number;
  revenue: number;
  conversion_rate: number;
  average_order_value: number;
  geographic_performance: Record<string, any>;
  seasonal_trends: Record<string, any>;
  competitive_metrics: Record<string, any>;
  inventory_turnover: number;
  profit_margin: number;
  created_at: string;
  updated_at: string;
}

export interface CustomReport {
  id: string;
  tenant_id: string;
  report_name: string;
  report_type: 'dashboard' | 'table' | 'chart';
  description?: string;
  query_config: Record<string, any>;
  visualization_config: Record<string, any>;
  filters: Record<string, any>;
  schedule_config: Record<string, any>;
  is_public: boolean;
  is_scheduled: boolean;
  created_by?: string;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  tenant_id: string;
  execution_status: 'running' | 'completed' | 'failed';
  result_data?: Record<string, any>;
  error_message?: string;
  execution_time_ms?: number;
  row_count: number;
  file_url?: string;
  executed_by?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface PredictiveAnalytics {
  id: string;
  tenant_id: string;
  model_type: 'demand_forecast' | 'churn_prediction' | 'yield_prediction' | 'campaign_outcome';
  target_entity_type: 'farmer' | 'product' | 'campaign';
  target_entity_id?: string;
  prediction_date: string;
  prediction_horizon: number;
  predicted_value?: number;
  confidence_score: number;
  model_version?: string;
  input_features: Record<string, any>;
  prediction_metadata: Record<string, any>;
  actual_value?: number;
  created_at: string;
  updated_at: string;
}

export interface DataExportLog {
  id: string;
  tenant_id: string;
  export_type: 'excel' | 'csv' | 'pdf' | 'api';
  export_format: string;
  data_source: string;
  filters_applied: Record<string, any>;
  row_count: number;
  file_size_bytes: number;
  file_url?: string;
  download_count: number;
  expires_at?: string;
  exported_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  segment?: string;
  region?: string;
  productCategory?: string;
  campaignType?: string;
}

export interface ReportBuilderConfig {
  dataSource: string;
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  orderBy?: string[];
  limit?: number;
}

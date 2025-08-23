
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';
import type { 
  ExecutiveDashboardMetric, 
  FarmerAnalytics, 
  ProductAnalytics, 
  CustomReport, 
  ReportExecution, 
  PredictiveAnalytics, 
  DataExportLog,
  AnalyticsFilters,
  ReportBuilderConfig
} from '@/types/analytics';

export interface EngagementStats {
  activeUsers: number;
  avgSessionTime: string;
  featureAdoption: number;
  responseRate: number;
  churnRate: number;
  npsScore: number;
}

export interface ExecutiveDashboardData {
  totalFarmers: number;
  activeFarmers: number;
  totalRevenue: number;
  revenueGrowth: number;
  engagementRate: number;
  churnRate: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    growth: number;
  }>;
  revenueChart: Array<{
    month: string;
    revenue: number;
  }>;
}

class AnalyticsService extends BaseApiService {
  async getEngagementStats(tenantId: string): Promise<EngagementStats> {
    try {
      // Get all farmers for this tenant
      const { data: farmers, error: farmersError } = await supabase
        .from('farmers')
        .select('*')
        .eq('tenant_id', tenantId);

      if (farmersError) throw farmersError;

      if (farmers && farmers.length > 0) {
        // Calculate active users (used app in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsers = farmers.filter(f => 
          f.last_app_open && new Date(f.last_app_open) > thirtyDaysAgo
        ).length;

        // Calculate average session time (mock for now - would need session tracking)
        const avgAppOpens = farmers.reduce((acc, f) => acc + (f.total_app_opens || 0), 0) / farmers.length;
        const avgSessionTime = `${Math.round(avgAppOpens * 2.5)} min`;

        // Feature adoption (farmers who have used queries)
        const featureAdoption = (farmers.filter(f => (f.total_queries || 0) > 0).length / farmers.length) * 100;

        // Response rate (verified farmers)
        const responseRate = (farmers.filter(f => f.is_verified).length / farmers.length) * 100;

        // Churn rate (inactive for 30+ days)
        const churnRate = (farmers.filter(f => 
          !f.last_app_open || new Date(f.last_app_open) < thirtyDaysAgo
        ).length / farmers.length) * 100;

        // Mock NPS score based on engagement
        const npsScore = Math.max(6, Math.min(10, 6 + (featureAdoption / 20)));

        return {
          activeUsers,
          avgSessionTime,
          featureAdoption: Math.round(featureAdoption * 10) / 10,
          responseRate: Math.round(responseRate * 10) / 10,
          churnRate: Math.round(churnRate * 10) / 10,
          npsScore: Math.round(npsScore * 10) / 10
        };
      }

      return {
        activeUsers: 0,
        avgSessionTime: '0 min',
        featureAdoption: 0,
        responseRate: 0,
        churnRate: 0,
        npsScore: 0
      };
    } catch (error) {
      throw new Error(`Failed to fetch engagement stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExecutiveDashboardData(tenantId: string, filters?: AnalyticsFilters): Promise<ExecutiveDashboardData> {
    try {
      // Get farmers count
      const { data: farmers, error: farmersError } = await supabase
        .from('farmers')
        .select('id, last_app_open, created_at')
        .eq('tenant_id', tenantId);

      if (farmersError) throw farmersError;

      const totalFarmers = farmers?.length || 0;
      const activeFarmers = farmers?.filter(f => {
        if (!f.last_app_open) return false;
        const lastActive = new Date(f.last_app_open);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      }).length || 0;

      // Mock revenue data (in real implementation, this would come from orders/payments)
      const totalRevenue = 2540000; // ₹25.4L
      const revenueGrowth = 15.8;
      const engagementRate = totalFarmers > 0 ? (activeFarmers / totalFarmers) * 100 : 0;
      const churnRate = totalFarmers > 0 ? ((totalFarmers - activeFarmers) / totalFarmers) * 100 : 0;

      // Mock top products
      const topProducts = [
        { name: 'Premium Seeds', revenue: 850000, growth: 12.5 },
        { name: 'Organic Fertilizer', revenue: 720000, growth: 8.3 },
        { name: 'Bio Pesticides', revenue: 580000, growth: 22.1 }
      ];

      // Mock revenue chart data
      const revenueChart = [
        { month: 'Jan', revenue: 180000 },
        { month: 'Feb', revenue: 195000 },
        { month: 'Mar', revenue: 210000 },
        { month: 'Apr', revenue: 225000 },
        { month: 'May', revenue: 240000 },
        { month: 'Jun', revenue: 255000 }
      ];

      return {
        totalFarmers,
        activeFarmers,
        totalRevenue,
        revenueGrowth,
        engagementRate: Math.round(engagementRate * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
        topProducts,
        revenueChart
      };
    } catch (error) {
      throw new Error(`Failed to fetch executive dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFarmerAnalytics(tenantId: string, filters?: AnalyticsFilters): Promise<FarmerAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_analytics')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types
      return (data || []).map(item => ({
        ...item,
        features_used: Array.isArray(item.features_used) ? item.features_used : [],
        performance_metrics: typeof item.performance_metrics === 'object' ? item.performance_metrics : {},
        predicted_metrics: typeof item.predicted_metrics === 'object' ? item.predicted_metrics : {},
      })) as FarmerAnalytics[];
    } catch (error) {
      throw new Error(`Failed to fetch farmer analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProductAnalytics(tenantId: string, filters?: AnalyticsFilters): Promise<ProductAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('product_analytics')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('period_start', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types
      return (data || []).map(item => ({
        ...item,
        geographic_performance: typeof item.geographic_performance === 'object' ? item.geographic_performance : {},
        seasonal_trends: typeof item.seasonal_trends === 'object' ? item.seasonal_trends : {},
        competitive_metrics: typeof item.competitive_metrics === 'object' ? item.competitive_metrics : {},
      })) as ProductAnalytics[];
    } catch (error) {
      throw new Error(`Failed to fetch product analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCustomReports(tenantId: string): Promise<CustomReport[]> {
    try {
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types
      return (data || []).map(item => ({
        ...item,
        report_type: (item.report_type as 'dashboard' | 'table' | 'chart') || 'dashboard',
        query_config: typeof item.query_config === 'object' ? item.query_config : {},
        visualization_config: typeof item.visualization_config === 'object' ? item.visualization_config : {},
        filters: typeof item.filters === 'object' ? item.filters : {},
        schedule_config: typeof item.schedule_config === 'object' ? item.schedule_config : {},
      })) as CustomReport[];
    } catch (error) {
      throw new Error(`Failed to fetch custom reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCustomReport(tenantId: string, reportData: Partial<CustomReport>): Promise<CustomReport> {
    try {
      const { data, error } = await supabase
        .from('custom_reports')
        .insert({
          tenant_id: tenantId,
          report_name: reportData.report_name || 'New Report',
          report_type: reportData.report_type || 'dashboard',
          description: reportData.description,
          query_config: reportData.query_config || {},
          visualization_config: reportData.visualization_config || {},
          filters: reportData.filters || {},
          schedule_config: reportData.schedule_config || {},
          is_public: reportData.is_public || false,
          is_scheduled: reportData.is_scheduled || false,
          created_by: reportData.created_by,
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        report_type: (data.report_type as 'dashboard' | 'table' | 'chart') || 'dashboard',
        query_config: typeof data.query_config === 'object' ? data.query_config : {},
        visualization_config: typeof data.visualization_config === 'object' ? data.visualization_config : {},
        filters: typeof data.filters === 'object' ? data.filters : {},
        schedule_config: typeof data.schedule_config === 'object' ? data.schedule_config : {},
      } as CustomReport;
    } catch (error) {
      throw new Error(`Failed to create custom report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeReport(reportId: string, tenantId: string): Promise<ReportExecution> {
    try {
      const { data, error } = await supabase
        .from('report_executions')
        .insert({
          report_id: reportId,
          tenant_id: tenantId,
          execution_status: 'running'
        })
        .select()
        .single();

      if (error) throw error;

      // Mock report execution (in real implementation, this would trigger actual report generation)
      setTimeout(async () => {
        await supabase
          .from('report_executions')
          .update({
            execution_status: 'completed',
            result_data: { mockData: 'Generated report data' },
            execution_time_ms: 1500,
            row_count: 100,
            completed_at: new Date().toISOString()
          })
          .eq('id', data.id);
      }, 2000);

      return data;
    } catch (error) {
      throw new Error(`Failed to execute report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPredictiveAnalytics(tenantId: string, modelType?: string): Promise<PredictiveAnalytics[]> {
    try {
      let query = supabase
        .from('predictive_analytics')
        .select('*')
        .eq('tenant_id', tenantId);

      if (modelType) {
        query = query.eq('model_type', modelType);
      }

      const { data, error } = await query.order('prediction_date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our types  
      return (data || []).map(item => ({
        ...item,
        input_features: typeof item.input_features === 'object' ? item.input_features : {},
        prediction_metadata: typeof item.prediction_metadata === 'object' ? item.prediction_metadata : {},
      })) as PredictiveAnalytics[];
    } catch (error) {
      throw new Error(`Failed to fetch predictive analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportData(
    tenantId: string, 
    exportConfig: {
      dataSource: string;
      format: 'excel' | 'csv' | 'pdf';
      filters?: AnalyticsFilters;
    }
  ): Promise<DataExportLog> {
    try {
      const { data, error } = await supabase
        .from('data_export_logs')
        .insert({
          tenant_id: tenantId,
          export_type: exportConfig.format,
          export_format: exportConfig.format,
          data_source: exportConfig.dataSource,
          filters_applied: exportConfig.filters || {},
          row_count: 0, // Will be updated after processing
          file_size_bytes: 0,
          download_count: 0,
          exported_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (error) throw error;

      // Mock export processing (in real implementation, this would generate actual files)
      setTimeout(async () => {
        const mockFileUrl = `https://example.com/exports/${data.id}.${exportConfig.format}`;
        await supabase
          .from('data_export_logs')
          .update({
            row_count: 500,
            file_size_bytes: 1024 * 1024, // 1MB
            file_url: mockFileUrl,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .eq('id', data.id);
      }, 3000);

      return data;
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExportLogs(tenantId: string): Promise<DataExportLog[]> {
    try {
      const { data, error } = await supabase
        .from('data_export_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch export logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const analyticsService = new AnalyticsService();

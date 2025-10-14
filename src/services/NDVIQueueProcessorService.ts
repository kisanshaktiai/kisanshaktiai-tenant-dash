import { supabase } from '@/integrations/supabase/client';

export interface ProcessQueueResult {
  success: boolean;
  message?: string;
  total?: number;
  processed?: number;
  failed?: number;
  results?: Array<{
    id: string;
    success: boolean;
    processed?: number;
    duration_ms?: number;
    error?: string;
    retry_count?: number;
  }>;
}

export class NDVIQueueProcessorService {
  /**
   * Trigger the NDVI request processor edge function
   */
  static async processQueue(limit: number = 10): Promise<ProcessQueueResult> {
    try {
      console.log(`🔄 Triggering NDVI queue processor (limit: ${limit})`);

      const { data, error } = await supabase.functions.invoke('ndvi-queue-processor', {
        body: {
          action: 'process_queue',
          limit
        }
      });

      if (error) {
        console.error('❌ Queue processor error:', error);
        throw error;
      }

      console.log('✅ Queue processor response:', data);
      return data as ProcessQueueResult;
    } catch (error) {
      console.error('❌ Failed to process queue:', error);
      throw error;
    }
  }

  /**
   * Get queue status for a tenant
   */
  static async getQueueStatus(tenantId: string) {
    const { data, error } = await supabase
      .from('ndvi_request_queue')
      .select('id, status, created_at, tile_id, land_ids, metadata, retry_count, last_error')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Failed to fetch queue status:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get recent NDVI data for a tenant
   */
  static async getRecentNDVIData(tenantId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('ndvi_data')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Failed to fetch NDVI data:', error);
      throw error;
    }

    return data;
  }

  /**
   * Check processor health
   */
  static async checkHealth() {
    try {
      const { data, error } = await supabase.functions.invoke('ndvi-queue-processor', {
        body: { action: 'health' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { success: false, status: 'unhealthy' };
    }
  }
}

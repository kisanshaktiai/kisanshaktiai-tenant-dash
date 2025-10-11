import { supabase } from '@/integrations/supabase/client';

export interface ProcessQueueResult {
  success: boolean;
  results: {
    processed: number;
    completed: number;
    failed: number;
    still_processing: number;
    errors: Array<{
      queue_id?: string;
      render_request_id?: string;
      land_id?: string;
      error: string;
    }>;
  };
}

export class NDVIQueueProcessorService {
  /**
   * Trigger the NDVI request processor to check queue and fetch completed data
   */
  static async processQueue(tenantId: string, limit: number = 10): Promise<ProcessQueueResult> {
    try {
      console.log(`🔄 Triggering NDVI queue processor for tenant ${tenantId}`);

      const { data, error } = await supabase.functions.invoke('ndvi-request-processor', {
        body: {
          action: 'process_queue',
          tenant_id: tenantId,
          limit
        }
      });

      if (error) {
        console.error('❌ Queue processor error:', error);
        throw error;
      }

      console.log('✅ Queue processor response:', data);
      return data;
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
      .select('id, status, created_at, tile_id, land_ids, metadata')
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
}

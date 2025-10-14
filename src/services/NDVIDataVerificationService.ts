/**
 * Service to verify NDVI data insertion and provide diagnostics
 */

import { supabase } from '@/integrations/supabase/client';

export interface NDVIVerificationResult {
  hasData: boolean;
  ndviDataCount: number;
  microTilesCount: number;
  queueStatus: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
  recentData: {
    ndviRecords: any[];
    microTiles: any[];
  };
  issues: string[];
  recommendations: string[];
}

export class NDVIDataVerificationService {
  /**
   * Comprehensive verification of NDVI data flow
   */
  static async verifyNDVIDataFlow(tenantId: string): Promise<NDVIVerificationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      console.log('🔍 [VERIFICATION] Starting NDVI data flow check...');

      // Check ndvi_data table
      const { data: ndviData, error: ndviError } = await supabase
        .from('ndvi_data')
        .select('id, land_id, date, ndvi_value, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ndviError) {
        issues.push(`Failed to query ndvi_data: ${ndviError.message}`);
      }

      const ndviCount = ndviData?.length || 0;
      console.log(`📊 ndvi_data records: ${ndviCount}`);

      // Check ndvi_micro_tiles table
      const { data: microTiles, error: tilesError } = await supabase
        .from('ndvi_micro_tiles')
        .select('id, land_id, acquisition_date, ndvi_mean, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (tilesError) {
        issues.push(`Failed to query ndvi_micro_tiles: ${tilesError.message}`);
      }

      const tilesCount = microTiles?.length || 0;
      console.log(`🗺️ ndvi_micro_tiles records: ${tilesCount}`);

      // Check queue status
      const { data: queueData, error: queueError } = await supabase
        .from('ndvi_request_queue')
        .select('id, status, retry_count, last_error, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(20);

      const queueStatus = {
        queued: queueData?.filter(q => q.status === 'queued').length || 0,
        processing: queueData?.filter(q => q.status === 'processing').length || 0,
        completed: queueData?.filter(q => q.status === 'completed').length || 0,
        failed: queueData?.filter(q => q.status === 'failed').length || 0,
      };

      console.log('📋 Queue status:', queueStatus);

      // Analyze issues
      if (ndviCount === 0 && tilesCount === 0) {
        issues.push('No NDVI data found in database tables');
        
        if (queueStatus.queued > 0) {
          issues.push(`${queueStatus.queued} requests stuck in "queued" status`);
          recommendations.push('Python worker cron job may not be running on Render');
          recommendations.push('Check Render logs for worker execution');
        }
        
        if (queueStatus.completed > 0 && ndviCount === 0) {
          issues.push('Queue shows completed requests but no data in tables');
          recommendations.push('Worker may not be inserting data correctly');
          recommendations.push('Check Python worker logs for database insertion errors');
        }
      }

      if (queueStatus.failed > 0) {
        const failedItems = queueData?.filter(q => q.status === 'failed') || [];
        failedItems.forEach(item => {
          if (item.last_error) {
            issues.push(`Failed request: ${item.last_error.substring(0, 100)}`);
          }
        });
      }

      // Check for stuck processing items
      const stuckProcessing = queueData?.filter(q => 
        q.status === 'processing' && 
        new Date().getTime() - new Date(q.created_at).getTime() > 10 * 60 * 1000
      ) || [];

      if (stuckProcessing.length > 0) {
        issues.push(`${stuckProcessing.length} requests stuck in "processing" for >10 minutes`);
        recommendations.push('Reset stuck items to "queued" status');
      }

      return {
        hasData: ndviCount > 0 || tilesCount > 0,
        ndviDataCount: ndviCount,
        microTilesCount: tilesCount,
        queueStatus,
        recentData: {
          ndviRecords: ndviData || [],
          microTiles: microTiles || [],
        },
        issues,
        recommendations,
      };

    } catch (error) {
      console.error('❌ [VERIFICATION] Error:', error);
      issues.push(`Verification failed: ${error}`);
      return {
        hasData: false,
        ndviDataCount: 0,
        microTilesCount: 0,
        queueStatus: { queued: 0, processing: 0, completed: 0, failed: 0 },
        recentData: { ndviRecords: [], microTiles: [] },
        issues,
        recommendations: ['Contact support - verification system error'],
      };
    }
  }

  /**
   * Reset stuck queue items back to queued status
   */
  static async resetStuckItems(tenantId: string): Promise<number> {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('ndvi_request_queue')
        .update({
          status: 'queued',
          retry_count: 0,
          last_error: 'Reset from stuck processing state',
        })
        .eq('tenant_id', tenantId)
        .eq('status', 'processing')
        .lt('created_at', tenMinutesAgo)
        .select('id');

      if (error) throw error;

      const resetCount = data?.length || 0;
      console.log(`🔄 Reset ${resetCount} stuck items to queued`);
      return resetCount;

    } catch (error) {
      console.error('❌ Failed to reset stuck items:', error);
      throw error;
    }
  }

  /**
   * Clear failed items older than 24 hours
   */
  static async clearOldFailedItems(tenantId: string): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('ndvi_request_queue')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('status', 'failed')
        .lt('created_at', oneDayAgo)
        .select('id');

      if (error) throw error;

      const deletedCount = data?.length || 0;
      console.log(`🗑️ Cleared ${deletedCount} old failed items`);
      return deletedCount;

    } catch (error) {
      console.error('❌ Failed to clear old items:', error);
      throw error;
    }
  }
}

export const ndviVerificationService = NDVIDataVerificationService;

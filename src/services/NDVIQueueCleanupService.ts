import { supabase } from '@/integrations/supabase/client';

/**
 * Service to clean up old/invalid queue records
 */
export class NDVIQueueCleanupService {
  /**
   * Mark old queue items without render_request_id as failed
   */
  static async markInvalidRecordsAsFailed(): Promise<{
    success: boolean;
    updated: number;
    errors: string[];
  }> {
    try {
      console.log('🔧 Cleaning up invalid queue records...');

      // Find records that are still queued but missing render_request_id
      const { data: invalidRecords, error: fetchError } = await supabase
        .from('ndvi_request_queue')
        .select('id, metadata, status, created_at')
        .eq('status', 'queued')
        .is('metadata->>render_request_id', null);

      if (fetchError) {
        console.error('❌ Failed to fetch invalid records:', fetchError);
        throw fetchError;
      }

      if (!invalidRecords || invalidRecords.length === 0) {
        console.log('✅ No invalid records to clean up');
        return { success: true, updated: 0, errors: [] };
      }

      console.log(`🔧 Found ${invalidRecords.length} invalid records to mark as failed`);

      const errors: string[] = [];
      let updated = 0;

      // Update each invalid record
      for (const record of invalidRecords) {
        const { error: updateError } = await supabase
          .from('ndvi_request_queue')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            error_message: 'Invalid record: Missing render_request_id. This request was created incorrectly and cannot be processed.'
          })
          .eq('id', record.id);

        if (updateError) {
          errors.push(`Failed to update record ${record.id}: ${updateError.message}`);
        } else {
          updated++;
        }
      }

      console.log(`✅ Cleanup complete: ${updated} records updated, ${errors.length} errors`);

      return {
        success: errors.length === 0,
        updated,
        errors
      };

    } catch (error) {
      console.error('❌ Queue cleanup failed:', error);
      return {
        success: false,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Delete old completed/failed records older than N days
   */
  static async deleteOldRecords(daysOld: number = 30): Promise<{
    success: boolean;
    deleted: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('ndvi_request_queue')
        .delete()
        .in('status', ['completed', 'failed'])
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      return { success: true, deleted: 0 }; // Can't get count from delete
    } catch (error) {
      console.error('❌ Failed to delete old records:', error);
      return { success: false, deleted: 0 };
    }
  }
}

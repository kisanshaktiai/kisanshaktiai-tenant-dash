import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RENDER_WORKER_URL = Deno.env.get("RENDER_WORKER_URL") || "https://ndvi-land-api.onrender.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action = 'process_queue', limit = 10 } = await req.json().catch(() => ({}));

    console.log(`🔄 NDVI Queue Processor: ${action}`);

    if (action === 'process_queue') {
      // Step 1: Fetch queued items
      const { data: queuedItems, error: fetchError } = await supabase
        .from('ndvi_request_queue')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch queue: ${fetchError.message}`);
      }

      if (!queuedItems || queuedItems.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No queued items to process',
            processed: 0,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`📋 Found ${queuedItems.length} queued items`);

      const results = [];

      // Step 2: Process each queue item - trigger external Python worker
      for (const item of queuedItems) {
        const startTime = Date.now();
        
        try {
          // Mark as processing
          await supabase
            .from('ndvi_request_queue')
            .update({
              status: 'processing',
              started_at: new Date().toISOString(),
            })
            .eq('id', item.id);

          console.log(`🔄 Processing queue item ${item.id} for ${item.land_ids?.length} lands`);

          // ARCHITECTURE CHANGE: Instead of calling Python API endpoint (which doesn't exist),
          // we rely on the Render cron job to pick up items with status='processing'
          // This edge function just orchestrates the status changes
          
          console.log(`✅ Queue item ${item.id} marked for processing by worker cron job`);
          
          // The Python worker cron job will:
          // 1. Fetch items with status='processing'
          // 2. Download NDVI data from B2
          // 3. Process and insert into ndvi_data, ndvi_micro_tiles
          // 4. Update status to 'completed'
          
          // For now, we just mark it as processing and let cron handle it
          // Worker will pick it up within next cron cycle (every minute)

          // Note: Status is now 'processing' - cron job will complete it
          // We return success immediately to prevent retry loops
          const duration = Date.now() - startTime;
          
          results.push({
            id: item.id,
            success: true,
            processed: item.land_ids?.length || 0,
            duration_ms: duration,
            message: 'Queued for worker processing',
          });

        } catch (error) {
          console.error(`❌ Failed to update ${item.id}:`, error);

          const duration = Date.now() - startTime;

          // Don't increase retry count for status update failures
          // Just keep as queued so cron can pick it up
          await supabase
            .from('ndvi_request_queue')
            .update({
              status: 'queued',
              last_error: error.message,
              processing_duration_ms: duration,
            })
            .eq('id', item.id);

          results.push({
            id: item.id,
            success: false,
            error: error.message,
            retry_count: item.retry_count || 0,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${successCount} items successfully, ${failedCount} failed`,
          total: results.length,
          processed: successCount,
          failed: failedCount,
          results,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Health check
    if (action === 'health') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'healthy',
          service: 'ndvi-queue-processor',
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Queue processor error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

          // Trigger the Python worker to process this specific queue item
          // The worker should fetch this item from the queue, process NDVI, 
          // and insert into ndvi_data and ndvi_micro_tiles
          const workerResponse = await fetch(`${RENDER_WORKER_URL}/api/v1/ndvi/process-queue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              queue_id: item.id,
              tenant_id: item.tenant_id,
              land_ids: item.land_ids,
              tile_id: item.tile_id,
            }),
          });

          if (!workerResponse.ok) {
            const errorText = await workerResponse.text();
            throw new Error(`Worker failed (${workerResponse.status}): ${errorText}`);
          }

          const workerData = await workerResponse.json();
          console.log(`✅ Worker response for ${item.id}:`, workerData);

          // Check if worker actually processed the data
          if (workerData.status !== 'success') {
            throw new Error(`Worker processing failed: ${workerData.error || 'Unknown error'}`);
          }

          // Verify data was inserted by checking ndvi_data table
          const { data: ndviData, error: checkError } = await supabase
            .from('ndvi_data')
            .select('id')
            .in('land_id', item.land_ids)
            .limit(1);

          if (checkError) {
            console.warn(`⚠️ Could not verify NDVI data insertion:`, checkError);
          } else if (!ndviData || ndviData.length === 0) {
            console.warn(`⚠️ No NDVI data found after processing`);
          } else {
            console.log(`✅ Verified NDVI data inserted for queue item ${item.id}`);
          }

          // Update lands to mark as tested
          if (item.land_ids && item.land_ids.length > 0) {
            await supabase
              .from('lands')
              .update({
                ndvi_tested: true,
                last_processed_at: new Date().toISOString(),
              })
              .in('id', item.land_ids);
          }

          // Mark as completed
          const duration = Date.now() - startTime;
          await supabase
            .from('ndvi_request_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              processed_count: workerData.processed_count || item.land_ids?.length || 0,
              processing_duration_ms: duration,
            })
            .eq('id', item.id);

          results.push({
            id: item.id,
            success: true,
            processed: workerData.processed_count || item.land_ids?.length || 0,
            duration_ms: duration,
          });

        } catch (error) {
          console.error(`❌ Failed to process ${item.id}:`, error);

          const duration = Date.now() - startTime;
          const retryCount = (item.retry_count || 0) + 1;
          const maxRetries = 3;

          // Update with error
          await supabase
            .from('ndvi_request_queue')
            .update({
              status: retryCount >= maxRetries ? 'failed' : 'queued',
              retry_count: retryCount,
              last_error: error.message,
              processing_duration_ms: duration,
            })
            .eq('id', item.id);

          results.push({
            id: item.id,
            success: false,
            error: error.message,
            retry_count: retryCount,
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RENDER_API_BASE_URL = 'https://ndvi-land-api.onrender.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { action, tenant_id, limit = 10 } = await req.json()

    console.log(`🔄 Processing NDVI requests - action: ${action}, tenant_id: ${tenant_id}`)

    if (action === 'process_queue') {
      // Step 1: Get queued requests from ndvi_request_queue
      const { data: queuedRequests, error: queueError } = await supabaseClient
        .from('ndvi_request_queue')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(limit)

      if (queueError) {
        console.error('❌ Error fetching queue:', queueError)
        throw queueError
      }

      console.log(`📥 Found ${queuedRequests?.length || 0} queued requests to process`)

      const results = {
        processed: 0,
        completed: 0,
        failed: 0,
        still_processing: 0,
        errors: [] as any[]
      }

      // Step 2: Process each queued request
      for (const queueItem of queuedRequests || []) {
        try {
          // Extract Render API request_id from metadata
          const renderRequestId = queueItem.metadata?.render_request_id
          
          if (!renderRequestId) {
            console.error('❌ Skipping queue item with missing render_request_id:', queueItem)
            results.errors.push({
              queue_item_id: queueItem.id || 'unknown',
              error: 'Missing render_request_id in metadata'
            })
            continue
          }

          console.log(`🔍 Processing queue item ${queueItem.id} with Render request_id: ${renderRequestId}`)

          // Check status from Render API using renderRequestId
          const statusResponse = await fetch(
            `${RENDER_API_BASE_URL}/requests/${renderRequestId}/status`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            }
          )

          if (!statusResponse.ok) {
            console.error(`❌ Failed to fetch status for request ${renderRequestId}`)
            results.errors.push({
              render_request_id: renderRequestId,
              queue_id: queueItem.id,
              error: `Status check failed: ${statusResponse.statusText}`
            })
            continue
          }

          const statusData = await statusResponse.json()
          console.log(`📊 Render request ${renderRequestId} (queue ${queueItem.id}) status:`, statusData.status)

          // Update queue item based on status
          if (statusData.status === 'completed') {
            // Fetch the processed NDVI data
            const dataResponse = await fetch(
              `${RENDER_API_BASE_URL}/requests/${renderRequestId}/data`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }
            )

            if (!dataResponse.ok) {
              console.error(`❌ Failed to fetch data for Render request ${renderRequestId}`)
              results.errors.push({
                render_request_id: renderRequestId,
                queue_id: queueItem.id,
                error: 'Data fetch failed'
              })
              continue
            }

            const ndviData = await dataResponse.json()
            console.log(`✅ Retrieved NDVI data for Render request ${renderRequestId}:`, {
              lands_count: ndviData.lands?.length || 0,
              data_structure: Object.keys(ndviData)
            })

            // Store NDVI data in database
            let insertSuccessCount = 0
            for (const landData of ndviData.lands || []) {
              // Validate required fields
              if (!landData.land_id || landData.ndvi_value === undefined) {
                console.warn(`⚠️ Skipping invalid land data:`, landData)
                continue
              }

              const ndviInsert = {
                land_id: landData.land_id,
                tenant_id: queueItem.tenant_id,
                date: landData.date || new Date().toISOString().split('T')[0],
                ndvi_value: landData.ndvi_value,
                ndvi_min: landData.ndvi_min || null,
                ndvi_max: landData.ndvi_max || null,
                ndvi_mean: landData.ndvi_mean || landData.ndvi_value,
                ndvi_std: landData.ndvi_std || null,
                vegetation_health: landData.vegetation_health || 'unknown',
                vegetation_class: landData.vegetation_class || 'unknown',
                cloud_coverage: landData.cloud_coverage || 0,
                data_quality: landData.data_quality || 'good',
                source: 'sentinel2',
                processing_metadata: {
                  queue_id: queueItem.id,
                  render_request_id: renderRequestId,
                  tile_id: queueItem.tile_id,
                  processed_at: new Date().toISOString()
                }
              }

              const { error: insertError } = await supabaseClient
                .from('ndvi_data')
                .insert(ndviInsert)

              if (insertError) {
                console.error(`❌ Failed to insert NDVI data for land ${landData.land_id}:`, insertError)
                results.errors.push({
                  render_request_id: renderRequestId,
                  queue_id: queueItem.id,
                  land_id: landData.land_id,
                  error: insertError.message
                })
              } else {
                insertSuccessCount++
              }
            }

            console.log(`✅ Inserted ${insertSuccessCount} NDVI records for Render request ${renderRequestId}`)

            // Update queue status to completed
            const { error: updateError } = await supabaseClient
              .from('ndvi_request_queue')
              .update({
                status: 'completed',
                processed_at: new Date().toISOString(),
                result_data: ndviData
              })
              .eq('id', queueItem.id)

            if (updateError) {
              console.error(`❌ Failed to update queue item ${queueItem.id}:`, updateError)
            } else {
              results.completed++
            }

          } else if (statusData.status === 'failed') {
            // Update queue status to failed
            const { error: updateError } = await supabaseClient
              .from('ndvi_request_queue')
              .update({
                status: 'failed',
                processed_at: new Date().toISOString(),
                error_message: statusData.error_message || 'Processing failed'
              })
              .eq('id', queueItem.id)

            if (updateError) {
              console.error(`❌ Failed to update queue item ${queueItem.id}:`, updateError)
            } else {
              results.failed++
            }

          } else if (statusData.status === 'processing') {
            // Update to processing status
            await supabaseClient
              .from('ndvi_request_queue')
              .update({ status: 'processing' })
              .eq('id', queueItem.id)

            results.still_processing++
          }

          results.processed++

        } catch (error) {
          console.error(`❌ Error processing queue item ${queueItem?.id || 'unknown'}:`, error)
          results.errors.push({
            queue_id: queueItem?.id || 'unknown',
            render_request_id: queueItem?.metadata?.render_request_id || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      console.log(`✅ Processing complete:`, results)

      return new Response(
        JSON.stringify({
          success: true,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Manual trigger for specific tenant
    if (action === 'trigger_processing') {
      // This can be called manually or via cron
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Processing triggered'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in ndvi-request-processor:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

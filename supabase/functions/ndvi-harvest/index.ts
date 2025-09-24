import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, tenant_id, tile_ids, params } = await req.json()

    switch (action) {
      case 'trigger_harvest': {
        // Check quota first
        const { data: quotaData, error: quotaError } = await supabaseClient
          .rpc('check_harvest_quota', { p_tenant_id: tenant_id })

        if (quotaError) throw quotaError

        if (!quotaData.can_harvest) {
          return new Response(
            JSON.stringify({
              error: 'Monthly harvest quota exceeded',
              quota: quotaData
            }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Create harvest queue entries
        const queueEntries = tile_ids.map((tile_id: string) => ({
          tenant_id,
          tile_id,
          priority: params?.priority || 5,
          requested_date: params?.requested_date || new Date().toISOString().split('T')[0],
          status: 'queued'
        }))

        const { data: queueData, error: queueError } = await supabaseClient
          .from('harvest_queue')
          .insert(queueEntries)
          .select()

        if (queueError) throw queueError

        // Create system jobs
        const jobs = queueData.map((queue: any) => ({
          job_type: 'tile_harvest',
          status: 'pending',
          tenant_id,
          target_type: 'tile',
          parameters: {
            tile_id: queue.tile_id,
            queue_id: queue.id
          }
        }))

        const { data: jobData, error: jobError } = await supabaseClient
          .from('system_jobs')
          .insert(jobs)
          .select()

        if (jobError) throw jobError

        return new Response(
          JSON.stringify({
            success: true,
            jobs: jobData,
            quota: quotaData
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'get_harvest_status': {
        // Get recent jobs for tenant
        const { data: jobs, error: jobsError } = await supabaseClient
          .from('system_jobs')
          .select('*')
          .eq('tenant_id', tenant_id)
          .eq('job_type', 'tile_harvest')
          .order('created_at', { ascending: false })
          .limit(20)

        if (jobsError) throw jobsError

        // Get tile metadata
        const { data: tiles, error: tilesError } = await supabaseClient
          .from('satellite_tiles')
          .select('*')
          .eq('tenant_id', tenant_id)
          .order('acquisition_date', { ascending: false })
          .limit(20)

        if (tilesError) throw tilesError

        return new Response(
          JSON.stringify({
            jobs,
            tiles,
            summary: {
              total_jobs: jobs.length,
              completed: jobs.filter((j: any) => j.status === 'completed').length,
              failed: jobs.filter((j: any) => j.status === 'failed').length,
              pending: jobs.filter((j: any) => j.status === 'pending').length,
              running: jobs.filter((j: any) => j.status === 'running').length
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'get_tenant_tiles': {
        // Get tiles that cover tenant's lands
        const { data: tilesData, error: tilesError } = await supabaseClient
          .rpc('get_tenant_tiles', { p_tenant_id: tenant_id })

        if (tilesError) throw tilesError

        // Get latest NDVI data for each tile
        const tileIds = tilesData.map((t: any) => t.tile_id)
        
        const { data: latestNdvi, error: ndviError } = await supabaseClient
          .from('satellite_tiles')
          .select('tile_id, acquisition_date, cloud_cover, ndvi_path, status')
          .in('tile_id', tileIds)
          .order('acquisition_date', { ascending: false })

        if (ndviError) throw ndviError

        // Combine data
        const enrichedTiles = tilesData.map((tile: any) => {
          const latestData = latestNdvi.find((n: any) => n.tile_id === tile.tile_id)
          return {
            ...tile,
            latest_ndvi: latestData
          }
        })

        return new Response(
          JSON.stringify({
            tiles: enrichedTiles,
            total_tiles: enrichedTiles.length
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'get_storage_usage': {
        // Calculate storage usage for tenant
        const { data: storageData, error: storageError } = await supabaseClient
          .from('satellite_tiles')
          .select('file_size_mb')
          .eq('tenant_id', tenant_id)

        if (storageError) throw storageError

        const totalSizeMb = storageData.reduce((sum: number, tile: any) => 
          sum + (tile.file_size_mb || 0), 0
        )

        // Get tenant plan limits
        const { data: tenantData, error: tenantError } = await supabaseClient
          .from('tenants')
          .select('subscription_plan')
          .eq('id', tenant_id)
          .single()

        if (tenantError) throw tenantError

        const storageLimit = tenantData.subscription_plan === 'AI_Enterprise' ? 500 :
                           tenantData.subscription_plan === 'Shakti_Growth' ? 200 : 50

        return new Response(
          JSON.stringify({
            used_mb: totalSizeMb,
            limit_mb: storageLimit * 1024,
            percentage_used: (totalSizeMb / (storageLimit * 1024)) * 100,
            files_count: storageData.length
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'retry_failed_job': {
        const { job_id } = params

        // Get the failed job
        const { data: jobData, error: jobError } = await supabaseClient
          .from('system_jobs')
          .select('*')
          .eq('id', job_id)
          .eq('tenant_id', tenant_id)
          .single()

        if (jobError) throw jobError

        // Create a new job with same parameters
        const newJob = {
          job_type: jobData.job_type,
          status: 'pending',
          tenant_id: jobData.tenant_id,
          target_id: jobData.target_id,
          target_type: jobData.target_type,
          parameters: {
            ...jobData.parameters,
            retry_of: job_id
          }
        }

        const { data: newJobData, error: newJobError } = await supabaseClient
          .from('system_jobs')
          .insert(newJob)
          .select()
          .single()

        if (newJobError) throw newJobError

        return new Response(
          JSON.stringify({
            success: true,
            new_job: newJobData
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error in ndvi-harvest function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
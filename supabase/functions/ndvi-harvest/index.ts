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

    const { action, tenant_id, tile_ids, farmer_ids, harvest_all, params } = await req.json()

    switch (action) {
      case 'trigger_harvest': {
        // Validate tenant_id
        if (!tenant_id) {
          return new Response(
            JSON.stringify({
              error: 'tenant_id is required'
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Determine which tiles to harvest
        let tilesToHarvest: string[] = []

        if (tile_ids && Array.isArray(tile_ids) && tile_ids.length > 0) {
          // Use provided tile_ids
          tilesToHarvest = tile_ids
        } else if (farmer_ids && Array.isArray(farmer_ids) && farmer_ids.length > 0) {
          // Get tiles for specific farmers
          const { data: lands, error: landsError } = await supabaseClient
            .from('lands')
            .select('mgrs_tile_id')
            .eq('tenant_id', tenant_id)
            .in('farmer_id', farmer_ids)
            .not('mgrs_tile_id', 'is', null)

          if (landsError) throw landsError

          tilesToHarvest = [...new Set(lands.map((l: any) => l.mgrs_tile_id).filter(Boolean))]
        } else if (harvest_all === true) {
          // Get all tiles for tenant
          const { data: lands, error: landsError } = await supabaseClient
            .from('lands')
            .select('mgrs_tile_id')
            .eq('tenant_id', tenant_id)
            .not('mgrs_tile_id', 'is', null)

          if (landsError) throw landsError

          tilesToHarvest = [...new Set(lands.map((l: any) => l.mgrs_tile_id).filter(Boolean))]
        } else {
          return new Response(
            JSON.stringify({
              error: 'Either tile_ids, farmer_ids, or harvest_all must be provided'
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Validate we have tiles to harvest
        if (tilesToHarvest.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'No valid tiles found to harvest',
              hint: 'Make sure lands have mgrs_tile_id assigned'
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

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
        const queueEntries = tilesToHarvest.map((tile_id: string) => ({
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

        // Get harvest queue entries for this tenant
        const { data: queueEntries, error: queueError } = await supabaseClient
          .from('harvest_queue')
          .select('*')
          .eq('tenant_id', tenant_id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (queueError) throw queueError

        return new Response(
          JSON.stringify({
            jobs,
            queue: queueEntries,
            summary: {
              total_jobs: jobs.length,
              completed: jobs.filter((j: any) => j.status === 'completed').length,
              failed: jobs.filter((j: any) => j.status === 'failed').length,
              pending: jobs.filter((j: any) => j.status === 'pending').length,
              running: jobs.filter((j: any) => j.status === 'running').length
            },
            quota: {
              can_harvest: true,
              current_usage: 0,
              monthly_limit: 100,
              remaining: 100
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'get_tenant_tiles': {
        // Get MGRS tiles for tenant's lands
        const { data: lands, error: landsError } = await supabaseClient
          .from('lands')
          .select('mgrs_tile_id')
          .eq('tenant_id', tenant_id)
          .not('mgrs_tile_id', 'is', null)

        if (landsError) throw landsError

        // Get unique tile IDs
        const uniqueTileIds = [...new Set(lands.map((l: any) => l.mgrs_tile_id))]

        // Get tile metadata from mgrs_tiles
        const { data: tiles, error: tilesError } = await supabaseClient
          .from('mgrs_tiles')
          .select('*')
          .in('tile_id', uniqueTileIds)

        if (tilesError) throw tilesError

        // Count lands per tile
        const tilesWithCounts = tiles.map((tile: any) => ({
          tile_id: tile.tile_id,
          land_count: lands.filter((l: any) => l.mgrs_tile_id === tile.tile_id).length,
          total_area_ha: 0, // Calculate from actual land areas if needed
          latest_ndvi: null
        }))

        return new Response(
          JSON.stringify({
            tiles: tilesWithCounts,
            total_tiles: tilesWithCounts.length
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'get_storage_usage': {
        // Get tenant plan limits
        const { data: tenantData, error: tenantError } = await supabaseClient
          .from('tenants')
          .select('subscription_plan')
          .eq('id', tenant_id)
          .single()

        if (tenantError) throw tenantError

        const storageLimit = tenantData.subscription_plan === 'AI_Enterprise' ? 500 :
                           tenantData.subscription_plan === 'Shakti_Growth' ? 200 : 50

        // For now, return placeholder storage data
        // In production, this would query actual file storage
        return new Response(
          JSON.stringify({
            used_mb: 0,
            limit_mb: storageLimit * 1024,
            percentage_used: 0,
            files_count: 0
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, tenant_id, land_ids, tile_id, date } = await req.json();

    switch (action) {
      case 'create_clipping_jobs': {
        // Create land clipping jobs for harvested tiles
        if (!tenant_id || !tile_id || !date) {
          throw new Error('Missing required parameters');
        }

        // Get satellite tile info
        const { data: tile, error: tileError } = await supabase
          .from('satellite_tiles')
          .select('*')
          .eq('tile_id', tile_id)
          .eq('acquisition_date', date)
          .single();

        if (tileError || !tile) {
          throw new Error('Satellite tile not found');
        }

        // Get lands that intersect with this tile
        const { data: lands, error: landsError } = await supabase
          .from('lands')
          .select('id, name')
          .eq('tenant_id', tenant_id)
          .eq('is_active', true);

        if (landsError) {
          throw new Error(`Failed to fetch lands: ${landsError.message}`);
        }

        // Filter lands if specific IDs provided
        const targetLands = land_ids 
          ? lands.filter(l => land_ids.includes(l.id))
          : lands;

        // Create clipping jobs
        const jobs = targetLands.map(land => ({
          job_type: 'land_clipping',
          status: 'pending',
          tenant_id,
          target_type: 'land',
          target_id: land.id,
          parameters: {
            land_id: land.id,
            land_name: land.name,
            tile_id: tile.tile_id,
            acquisition_date: tile.acquisition_date,
            ndvi_path: tile.ndvi_path,
            scene_id: tile.metadata?.scene_id,
            cloud_cover: tile.cloud_cover
          }
        }));

        const { data: createdJobs, error: jobsError } = await supabase
          .from('system_jobs')
          .insert(jobs)
          .select();

        if (jobsError) {
          throw new Error(`Failed to create jobs: ${jobsError.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            jobs_created: createdJobs.length,
            jobs: createdJobs
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_clipping_status': {
        // Get status of land clipping jobs
        if (!tenant_id) {
          throw new Error('Missing tenant_id');
        }

        const query = supabase
          .from('system_jobs')
          .select('*')
          .eq('tenant_id', tenant_id)
          .eq('job_type', 'land_clipping')
          .order('created_at', { ascending: false })
          .limit(100);

        if (land_ids && land_ids.length > 0) {
          query.in('target_id', land_ids);
        }

        const { data: jobs, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch jobs: ${error.message}`);
        }

        // Calculate summary statistics
        const summary = {
          total: jobs.length,
          pending: jobs.filter(j => j.status === 'pending').length,
          running: jobs.filter(j => j.status === 'running').length,
          completed: jobs.filter(j => j.status === 'completed').length,
          failed: jobs.filter(j => j.status === 'failed').length
        };

        return new Response(
          JSON.stringify({
            success: true,
            summary,
            jobs
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'retry_failed_jobs': {
        // Retry failed clipping jobs
        if (!tenant_id) {
          throw new Error('Missing tenant_id');
        }

        const { data: failedJobs, error: fetchError } = await supabase
          .from('system_jobs')
          .select('*')
          .eq('tenant_id', tenant_id)
          .eq('job_type', 'land_clipping')
          .eq('status', 'failed')
          .limit(50);

        if (fetchError) {
          throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
        }

        // Reset failed jobs to pending
        const jobIds = failedJobs.map(j => j.id);
        
        const { error: updateError } = await supabase
          .from('system_jobs')
          .update({ 
            status: 'pending',
            error_message: null,
            started_at: null,
            completed_at: null
          })
          .in('id', jobIds);

        if (updateError) {
          throw new Error(`Failed to retry jobs: ${updateError.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            jobs_retried: jobIds.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_land_ndvi': {
        // Get NDVI data for specific lands
        if (!tenant_id || !land_ids) {
          throw new Error('Missing required parameters');
        }

        const { data: ndviData, error } = await supabase
          .from('ndvi_data')
          .select('*')
          .eq('tenant_id', tenant_id)
          .in('land_id', land_ids)
          .order('date', { ascending: false })
          .limit(100);

        if (error) {
          throw new Error(`Failed to fetch NDVI data: ${error.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: ndviData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
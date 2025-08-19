
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // This edge function is deprecated - all onboarding operations now use direct database calls
    // and the database functions we created (ensure_onboarding_workflow, etc.)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'This API endpoint is deprecated. Please use direct database operations.',
        message: 'Onboarding operations now use direct Supabase client calls and database functions.'
      }),
      {
        status: 410, // Gone
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error) {
    console.error('Deprecated endpoint accessed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Endpoint deprecated',
        details: error.message
      }),
      {
        status: 410,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});

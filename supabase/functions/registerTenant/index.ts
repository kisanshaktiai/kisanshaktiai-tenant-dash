
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TenantRegistrationRequest {
  organizationName: string;
  organizationType: 'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative';
  email: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { organizationName, organizationType, email, phone }: TenantRegistrationRequest = await req.json();

    console.log('Registering tenant:', { organizationName, organizationType, email });

    // Validate required fields
    if (!organizationName || !organizationType || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate slug from organization name
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Check if slug is unique and generate a unique one if needed
    const generateUniqueSlug = async (baseName: string): Promise<string> => {
      let slug = generateSlug(baseName);
      let counter = 1;
      
      while (true) {
        const { data } = await supabaseClient
          .from('tenants')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (!data) break; // Slug is unique
        
        slug = `${generateSlug(baseName)}-${counter}`;
        counter++;
      }
      
      return slug;
    };

    const slug = await generateUniqueSlug(organizationName);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Step 1: Insert tenant
    const { data: tenantData, error: tenantError } = await supabaseClient
      .from('tenants')
      .insert({
        slug,
        name: organizationName.trim(),
        type: organizationType,
        owner_email: email,
        owner_phone: phone,
        subdomain: slug,
        status: 'pending',
        trial_ends_at: trialEndsAt,
        subscription_plan: 'kisan',
        max_farmers: 1000,
        max_dealers: 50,
        max_products: 100,
        max_storage_gb: 10,
        max_api_calls_per_day: 10000,
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      return new Response(
        JSON.stringify({ error: 'Failed to create tenant', details: tenantError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const tenantId = tenantData.id;
    console.log('Created tenant with ID:', tenantId);

    // Step 2: Auto-provision tenant_features
    const { error: featuresError } = await supabaseClient
      .from('tenant_features')
      .insert({
        tenant_id: tenantId,
        basic_analytics: true,
        advanced_analytics: false,
        ai_chat: true,
        weather_forecast: true,
        marketplace: false,
        community_forum: false,
        soil_testing: false,
        satellite_imagery: false,
        drone_monitoring: false,
        iot_integration: false,
        predictive_analytics: false,
        custom_reports: false,
        api_access: false,
        webhook_support: false,
      });

    if (featuresError) {
      console.error('Error creating tenant features:', featuresError);
    }

    // Step 3: Auto-provision tenant_branding
    const { error: brandingError } = await supabaseClient
      .from('tenant_branding')
      .insert({
        tenant_id: tenantId,
        app_name: 'KisanShakti AI',
        primary_color: '#10b981',
        secondary_color: '#059669',
        accent_color: '#34d399',
        background_color: '#ffffff',
        text_color: '#111827',
        font_family: 'Inter',
      });

    if (brandingError) {
      console.error('Error creating tenant branding:', brandingError);
    }

    // Step 4: Get starter plan and create subscription
    const { data: starterPlan } = await supabaseClient
      .from('subscription_plans')
      .select('id')
      .eq('name', 'Kisan')
      .eq('is_active', true)
      .single();

    const { error: subscriptionError } = await supabaseClient
      .from('tenant_subscriptions')
      .insert({
        tenant_id: tenantId,
        plan_id: starterPlan?.id,
        status: 'trial',
        billing_interval: 'monthly',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndsAt,
        trial_end: trialEndsAt,
      });

    if (subscriptionError) {
      console.error('Error creating tenant subscription:', subscriptionError);
    }

    console.log('Successfully provisioned tenant:', tenantId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tenant registered successfully! You will receive a confirmation email shortly.',
        tenant: {
          id: tenantId,
          slug,
          name: organizationName,
          status: 'pending'
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in registerTenant function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);

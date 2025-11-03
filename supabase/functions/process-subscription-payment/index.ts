import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { intentId, subscriptionData } = await req.json();

    if (!intentId) {
      throw new Error('Payment intent ID is required');
    }

    // Get payment intent
    const { data: intent, error: intentError } = await supabaseClient
      .from('payment_intents')
      .select('*')
      .eq('id', intentId)
      .single();

    if (intentError) throw intentError;
    if (!intent) throw new Error('Payment intent not found');

    // Verify payment succeeded
    if (intent.status !== 'succeeded') {
      throw new Error('Payment not completed');
    }

    // Create or update subscription based on type
    if (intent.subscription_type === 'tenant') {
      // Create/update tenant subscription
      const { data: existingSub } = await supabaseClient
        .from('tenant_subscriptions')
        .select('id')
        .eq('tenant_id', intent.tenant_id)
        .single();

      if (existingSub) {
        // Upgrade existing subscription
        await supabaseClient
          .from('tenant_subscriptions')
          .update({
            plan_id: intent.plan_id,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        // Create new subscription
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabaseClient.from('tenant_subscriptions').insert({
          tenant_id: intent.tenant_id,
          plan_id: intent.plan_id,
          status: 'active',
          billing_interval: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          auto_renew: true,
        });
      }
    } else if (intent.subscription_type === 'farmer') {
      // Create/update farmer subscription
      const { data: existingSub } = await supabaseClient
        .from('farmer_subscriptions')
        .select('id')
        .eq('farmer_id', intent.farmer_id)
        .single();

      if (existingSub) {
        await supabaseClient
          .from('farmer_subscriptions')
          .update({
            plan_id: intent.plan_id,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabaseClient.from('farmer_subscriptions').insert({
          farmer_id: intent.farmer_id,
          plan_id: intent.plan_id,
          status: 'active',
          billing_cycle: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      }
    }

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    await supabaseClient.from('invoices').insert({
      tenant_id: intent.tenant_id,
      farmer_id: intent.farmer_id,
      invoice_number: invoiceNumber,
      amount: intent.amount,
      currency: intent.currency,
      status: 'paid',
      due_date: dueDate.toISOString(),
      paid_date: new Date().toISOString(),
      description: `Subscription payment - ${intent.subscription_type}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription activated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing subscription payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

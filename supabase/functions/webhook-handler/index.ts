import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface WebhookDelivery {
  webhookId: string;
  eventType: string;
  payload: any;
  attemptNumber: number;
}

async function deliverWebhook(delivery: WebhookDelivery): Promise<boolean> {
  const { data: webhook } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', delivery.webhookId)
    .single();

  if (!webhook || !webhook.is_active) {
    console.log(`Webhook ${delivery.webhookId} not found or inactive`);
    return false;
  }

  const startTime = Date.now();
  let success = false;
  let statusCode = 0;
  let responseBody = '';
  let errorMessage = '';

  try {
    // Create HMAC signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhook.secret_key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(JSON.stringify(delivery.payload))
    );

    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `sha256=${signatureHex}`,
      'X-Webhook-Event': delivery.eventType,
      'X-Webhook-Delivery': crypto.randomUUID(),
      'User-Agent': 'TenantDashboard-Webhooks/1.0',
      ...webhook.custom_headers
    };

    // Make the HTTP request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(delivery.payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    statusCode = response.status;
    responseBody = await response.text();
    success = response.ok;

    console.log(`Webhook delivery ${success ? 'succeeded' : 'failed'}: ${statusCode}`);

  } catch (error) {
    console.error('Webhook delivery error:', error);
    errorMessage = error.message;
    success = false;
  }

  // Log the delivery attempt
  await supabase.from('webhook_logs').insert({
    webhook_id: delivery.webhookId,
    event_type: delivery.eventType,
    payload: delivery.payload,
    status_code: statusCode || null,
    response_body: responseBody,
    response_time_ms: Date.now() - startTime,
    attempt_number: delivery.attemptNumber,
    error_message: errorMessage || null,
    delivered_at: success ? new Date().toISOString() : null
  });

  // Update webhook stats
  if (success) {
    await supabase
      .from('webhooks')
      .update({
        success_count: webhook.success_count + 1,
        last_triggered_at: new Date().toISOString()
      })
      .eq('id', delivery.webhookId);
  } else {
    await supabase
      .from('webhooks')
      .update({
        failure_count: webhook.failure_count + 1
      })
      .eq('id', delivery.webhookId);
  }

  return success;
}

async function retryWebhookWithBackoff(delivery: WebhookDelivery): Promise<void> {
  const { data: webhook } = await supabase
    .from('webhooks')
    .select('retry_attempts')
    .eq('id', delivery.webhookId)
    .single();

  if (!webhook) return;

  let attempt = delivery.attemptNumber;
  let success = false;

  while (attempt <= webhook.retry_attempts && !success) {
    if (attempt > 1) {
      // Exponential backoff: 2^(attempt-1) seconds
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retrying webhook ${delivery.webhookId} in ${delay}ms (attempt ${attempt})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    success = await deliverWebhook({
      ...delivery,
      attemptNumber: attempt
    });

    attempt++;
  }

  if (!success) {
    console.log(`Webhook ${delivery.webhookId} failed after ${webhook.retry_attempts} attempts`);
  }
}

async function triggerWebhooks(eventType: string, payload: any, tenantId: string): Promise<void> {
  // Get all active webhooks for this tenant and event type
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .contains('events', [eventType]);

  if (!webhooks || webhooks.length === 0) {
    console.log(`No active webhooks found for event ${eventType} in tenant ${tenantId}`);
    return;
  }

  console.log(`Triggering ${webhooks.length} webhooks for event ${eventType}`);

  // Trigger all webhooks concurrently
  const deliveryPromises = webhooks.map(webhook => {
    // Apply event filters if configured
    if (webhook.event_filters && Object.keys(webhook.event_filters).length > 0) {
      const filters = webhook.event_filters;
      const shouldTrigger = Object.entries(filters).every(([key, value]) => {
        return payload[key] === value;
      });

      if (!shouldTrigger) {
        console.log(`Webhook ${webhook.id} skipped due to event filters`);
        return Promise.resolve();
      }
    }

    const delivery: WebhookDelivery = {
      webhookId: webhook.id,
      eventType,
      payload,
      attemptNumber: 1
    };

    return retryWebhookWithBackoff(delivery);
  });

  await Promise.allSettled(deliveryPromises);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventType, payload, tenantId } = await req.json();

    if (!eventType || !payload || !tenantId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: eventType, payload, tenantId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Trigger webhooks asynchronously
    triggerWebhooks(eventType, payload, tenantId).catch(error => {
      console.error('Failed to trigger webhooks:', error);
    });

    return new Response(
      JSON.stringify({ message: 'Webhooks triggered successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
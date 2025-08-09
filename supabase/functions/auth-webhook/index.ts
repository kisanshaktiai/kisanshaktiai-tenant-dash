
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Auth webhook received:', payload);

    const { type, record } = payload;

    // Handle password recovery requests
    if (type === 'user.password.recovery.requested') {
      const { email, id: userId } = record;
      
      // Generate password reset URL
      const resetUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/reset-password`;
      
      // Call our email sending function
      const emailResponse = await supabase.functions.invoke('send-auth-email', {
        body: {
          email,
          type: 'password_reset',
          resetUrl: `${resetUrl}?access_token=${record.confirmation_token}&refresh_token=${record.refresh_token}&type=recovery`
        }
      });

      if (emailResponse.error) {
        console.error('Failed to send password reset email:', emailResponse.error);
        return new Response(
          JSON.stringify({ error: 'Failed to send password reset email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Password reset email sent successfully');
    }

    // Handle email confirmation requests
    if (type === 'user.confirmation.requested') {
      const { email, id: userId, confirmation_token } = record;
      
      const confirmUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/auth/confirm?token=${confirmation_token}`;
      
      const emailResponse = await supabase.functions.invoke('send-auth-email', {
        body: {
          email,
          type: 'email_confirmation',
          confirmUrl
        }
      });

      if (emailResponse.error) {
        console.error('Failed to send confirmation email:', emailResponse.error);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auth webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

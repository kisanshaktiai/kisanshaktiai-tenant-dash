
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  email: string;
  type: 'password_reset' | 'email_confirmation';
  resetUrl?: string;
  confirmUrl?: string;
}

const sendEmail = async (to: string, subject: string, html: string, templateType: string) => {
  if (!resendApiKey) {
    throw new Error('Resend API key not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AgriTenant Hub <noreply@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
};

const getPasswordResetTemplate = (email: string, resetUrl: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - AgriTenant Hub</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌱 AgriTenant Hub</h1>
        <p>Password Reset Request</p>
      </div>
      
      <div class="content">
        <h2>Hello!</h2>
        <p>We received a request to reset the password for your AgriTenant Hub account (${email}).</p>
        
        <p>Click the button below to reset your password:</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong>
          <ul>
            <li>This link will expire in 24 hours</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>The AgriTenant Hub Team</p>
      </div>
      
      <div class="footer">
        <p>© 2024 AgriTenant Hub. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, resetUrl, confirmUrl }: EmailRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: 'Email and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log email event to database
    const { data: emailEvent, error: dbError } = await supabase
      .from('email_events')
      .insert({
        event_type: 'email_requested',
        email_address: email,
        template_type: type,
        status: 'pending',
        metadata: { resetUrl, confirmUrl }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    let subject: string;
    let html: string;

    switch (type) {
      case 'password_reset':
        if (!resetUrl) {
          return new Response(
            JSON.stringify({ error: 'Reset URL is required for password reset emails' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        subject = 'Reset Your Password - AgriTenant Hub';
        html = getPasswordResetTemplate(email, resetUrl);
        break;
      
      case 'email_confirmation':
        subject = 'Confirm Your Email - AgriTenant Hub';
        html = `
          <h1>Welcome to AgriTenant Hub!</h1>
          <p>Please confirm your email address by clicking the link below:</p>
          <a href="${confirmUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Confirm Email</a>
        `;
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid email type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Send email via Resend
    const emailResult = await sendEmail(email, subject, html, type);

    // Update email event status
    if (emailEvent) {
      await supabase
        .from('email_events')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { ...emailEvent.metadata, resend_id: emailResult.id }
        })
        .eq('id', emailEvent.id);
    }

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: emailResult.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

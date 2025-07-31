
import { supabase } from '@/integrations/supabase/client';

export interface InvitationTokenData {
  valid: boolean;
  email: string;
  role: string;
  invite_id: string;
  expires_at: string;
  error?: string;
}

class InvitationService {
  async validateInvitationToken(token: string): Promise<InvitationTokenData> {
    try {
      const { data, error } = await supabase
        .rpc('validate_invite_token', { 
          token: token 
        });

      if (error) {
        console.error('Error validating invitation token:', error);
        return {
          valid: false,
          email: '',
          role: '',
          invite_id: '',
          expires_at: '',
          error: 'Invalid or expired invitation token'
        };
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          valid: false,
          email: '',
          role: '',
          invite_id: '',
          expires_at: '',
          error: 'Invitation token not found'
        };
      }

      const tokenData = data[0];
      return {
        valid: tokenData.is_valid || false,
        email: tokenData.email || '',
        role: tokenData.role || '',
        invite_id: tokenData.invite_id || '',
        expires_at: tokenData.expires_at || '',
        error: !tokenData.is_valid ? 'Token has expired or been used' : undefined
      };
    } catch (error) {
      console.error('Unexpected error validating token:', error);
      return {
        valid: false,
        email: '',
        role: '',
        invite_id: '',
        expires_at: '',
        error: 'An unexpected error occurred'
      };
    }
  }

  async setupPassword(email: string, password: string, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            invitation_token: token
          }
        }
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create user account'
        };
      }

      // Mark the invite as accepted using the existing admin_invites table
      const { error: inviteError } = await supabase
        .from('admin_invites')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invite_token', token);

      if (inviteError) {
        console.error('Error marking invite as accepted:', inviteError);
        // Don't fail the process if we can't mark invite as accepted
      }

      // Create admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: email,
          role: 'admin', // Default role, will be updated by invite data
          is_active: true
        });

      if (adminError) {
        console.error('Error creating admin user record:', adminError);
        // The auth account was created successfully, so this is not a critical failure
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error during password setup:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during account setup'
      };
    }
  }
}

export const invitationService = new InvitationService();

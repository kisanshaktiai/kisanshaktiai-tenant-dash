
import { supabase } from '@/integrations/supabase/client';

export interface InvitationTokenData {
  valid: boolean;
  email: string;
  role: string;
  invite_id: string;
  expires_at: string;
  error?: string;
}

export class InvitationService {
  async validateInvitationToken(token: string): Promise<InvitationTokenData> {
    try {
      // Use existing validate_invite_token function from the database
      const { data, error } = await supabase
        .from('admin_invites')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return {
          valid: false,
          email: '',
          role: '',
          invite_id: '',
          expires_at: '',
          error: 'Invalid or expired invitation token'
        };
      }

      return {
        valid: true,
        email: data.email,
        role: data.role,
        invite_id: data.id,
        expires_at: data.expires_at,
      };
    } catch (error) {
      console.error('Unexpected error validating token:', error);
      return {
        valid: false,
        email: '',
        role: '',
        invite_id: '',
        expires_at: '',
        error: 'An unexpected error occurred while validating the invitation'
      };
    }
  }

  async acceptInvitation(
    token: string, 
    email: string, 
    password: string, 
    fullName: string
  ): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // First validate the token
      const tokenValidation = await this.validateInvitationToken(token);
      if (!tokenValidation.valid) {
        return {
          success: false,
          error: tokenValidation.error || 'Invalid invitation token'
        };
      }

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: tokenValidation.role,
            invite_token: token
          }
        }
      });

      if (authError) {
        console.error('Error creating user account:', authError);
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

      // Mark the invite as accepted
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
      const { error: adminUserError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: tokenValidation.role,
          is_active: true
        });

      if (adminUserError) {
        console.error('Error creating admin user record:', adminUserError);
        return {
          success: false,
          error: 'Failed to create admin user profile'
        };
      }

      return {
        success: true,
        user: authData.user
      };
    } catch (error) {
      console.error('Unexpected error accepting invitation:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while accepting the invitation'
      };
    }
  }

  async setupPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (password !== confirmPassword) {
        return {
          success: false,
          error: 'Passwords do not match'
        };
      }

      if (password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Validate the token first
      const tokenValidation = await this.validateInvitationToken(token);
      if (!tokenValidation.valid) {
        return {
          success: false,
          error: 'Invalid or expired invitation token'
        };
      }

      // Update user password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Unexpected error setting up password:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while setting up your password'
      };
    }
  }
}

export const invitationService = new InvitationService();

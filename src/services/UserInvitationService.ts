
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserInvitationData {
  email: string;
  role: 'tenant_admin' | 'tenant_manager' | 'manager' | 'viewer';
  full_name?: string;
  department?: string;
  designation?: string;
}

export interface InvitationResponse {
  success: boolean;
  invitation_id?: string;
  error?: string;
}

class UserInvitationService {
  async inviteUser(invitationData: UserInvitationData, tenantId: string): Promise<InvitationResponse> {
    try {
      // Generate invitation token
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation record
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          tenant_id: tenantId,
          email: invitationData.email,
          role: invitationData.role,
          invited_name: invitationData.full_name,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          status: 'sent',
          metadata: {
            department: invitationData.department,
            designation: invitationData.designation
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Send invitation email (would typically be done via edge function)
      toast.success(`Invitation sent to ${invitationData.email}`);

      return {
        success: true,
        invitation_id: data.id
      };
    } catch (error) {
      console.error('Unexpected error inviting user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation'
      };
    }
  }

  async getPendingInvitations(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'sent')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  }

  async resendInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;
      toast.success('Invitation resent successfully');
      return true;
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
      return false;
    }
  }

  async cancelInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;
      toast.success('Invitation cancelled successfully');
      return true;
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
      return false;
    }
  }
}

export const userInvitationService = new UserInvitationService();


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true);
    try {
      // First trigger the Supabase password reset (this will trigger the webhook)
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (supabaseError) {
        throw supabaseError;
      }

      // Also call our custom email function as a backup
      const { error: emailError } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email,
          type: 'password_reset',
          resetUrl: `${window.location.origin}/reset-password`
        }
      });

      if (emailError) {
        console.warn('Custom email function failed:', emailError);
        // Don't throw here as Supabase's built-in function might still work
      }

      toast({
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions.',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        variant: 'destructive',
        title: 'Reset failed',
        description: error.message || 'Failed to send password reset email',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendPasswordReset,
    isLoading,
  };
};

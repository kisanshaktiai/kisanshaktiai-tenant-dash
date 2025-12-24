
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true);
    try {
      // Delegate password reset to Central Authentication Service
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://auth.kisanshaktiai.in/reset-password?target=partner',
      });

      if (error) {
        throw error;
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

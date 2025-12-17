import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const SessionRecoveryButton = () => {
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecoverSession = async () => {
    setIsRecovering(true);
    try {
      console.log('SessionRecoveryButton: Attempting session recovery...');
      
      // Clear all cached data
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('currentTenantId');
      
      // Force refresh session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('SessionRecoveryButton: Recovery failed, signing out');
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }

      console.log('SessionRecoveryButton: Session recovered successfully');
      toast({
        title: 'Session Recovered',
        description: 'Your session has been refreshed. Reloading...',
      });

      // Reload page to reinitialize everything
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('SessionRecoveryButton: Recovery error:', error);
      toast({
        title: 'Recovery Failed',
        description: 'Unable to recover session. Please log in again.',
        variant: 'destructive',
      });
      
      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Button
      onClick={handleRecoverSession}
      disabled={isRecovering}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
      {isRecovering ? 'Recovering...' : 'Recover Session'}
    </Button>
  );
};


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, LogOut, AlertCircle } from 'lucide-react';
import { jwtSyncService } from '@/services/JWTSyncService';
import { supabase } from '@/integrations/supabase/client';
import { clearAuthStorage } from '@/utils/authCleanup';
import { useToast } from '@/hooks/use-toast';

interface SessionRecoveryProps {
  error?: string;
  onRetry?: () => void;
}

export const SessionRecovery = ({ error, onRetry }: SessionRecoveryProps) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRecoverSession = async () => {
    setIsRecovering(true);
    
    try {
      console.log('[SessionRecovery] Attempting to recover session...');
      
      // Reset JWT sync state
      jwtSyncService.reset();
      
      // Try to re-sync JWT
      await jwtSyncService.ensureJWTReady();
      
      toast({
        title: 'Session Recovered',
        description: 'Your session has been successfully recovered.',
      });
      
      // Trigger retry if callback provided
      if (onRetry) {
        onRetry();
      } else {
        // Reload page to refresh all state
        window.location.reload();
      }
    } catch (err) {
      console.error('[SessionRecovery] Recovery failed:', err);
      
      toast({
        variant: 'destructive',
        title: 'Recovery Failed',
        description: 'Unable to recover session. Please sign in again.',
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleReLogin = async () => {
    try {
      console.log('[SessionRecovery] Signing out for re-login...');
      
      // Clear all auth data using the centralized utility
      jwtSyncService.reset();
      clearAuthStorage();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: 'Signed Out',
        description: 'Please sign in again to continue.',
      });
      
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error('[SessionRecovery] Sign out failed:', err);
      
      // Force navigation anyway
      clearAuthStorage();
      navigate('/auth', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Session Synchronization Issue</CardTitle>
          </div>
          <CardDescription>
            We're having trouble synchronizing your authentication session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleRecoverSession} 
              disabled={isRecovering}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
              {isRecovering ? 'Recovering...' : 'Try to Recover Session'}
            </Button>
            
            <Button 
              onClick={handleReLogin}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign In Again
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="mb-1 font-medium">What's happening?</p>
            <p>Your authentication token needs to be synchronized with our servers. This usually resolves automatically, but you can try the options above if needed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

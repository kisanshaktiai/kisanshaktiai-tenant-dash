import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AuthHealthStatus {
  isHealthy: boolean;
  jwtPresent: boolean;
  jwtExpired: boolean;
  canAccessDatabase: boolean;
  lastCheck: Date | null;
  errorMessage: string | null;
}

export const useAuthenticationHealth = () => {
  const { user, session } = useAuth();
  const [healthStatus, setHealthStatus] = useState<AuthHealthStatus>({
    isHealthy: false,
    jwtPresent: false,
    jwtExpired: false,
    canAccessDatabase: false,
    lastCheck: null,
    errorMessage: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkAuthHealth = useCallback(async () => {
    if (!user || !session) {
      setHealthStatus({
        isHealthy: false,
        jwtPresent: false,
        jwtExpired: false,
        canAccessDatabase: false,
        lastCheck: new Date(),
        errorMessage: 'No active session',
      });
      return;
    }

    setIsChecking(true);

    try {
      // Check JWT status
      const { data: jwtStatus, error: jwtError } = await supabase.rpc('debug_jwt_status');

      if (jwtError) {
        throw new Error(`JWT check failed: ${jwtError.message}`);
      }

      const jwt = jwtStatus?.[0];
      const jwtPresent = jwt?.jwt_present || false;
      const jwtExpired = jwt?.is_expired || false;

      // Try to access database
      let canAccessDatabase = false;
      try {
        const { error: dbError } = await supabase
          .from('user_tenants')
          .select('id')
          .limit(1);

        canAccessDatabase = !dbError;
      } catch (dbError) {
        console.error('useAuthenticationHealth: Database access failed:', dbError);
      }

      const isHealthy = jwtPresent && !jwtExpired && canAccessDatabase;

      setHealthStatus({
        isHealthy,
        jwtPresent,
        jwtExpired,
        canAccessDatabase,
        lastCheck: new Date(),
        errorMessage: isHealthy ? null : 'Authentication synchronization issue detected',
      });
    } catch (error: any) {
      console.error('useAuthenticationHealth: Health check failed:', error);
      setHealthStatus({
        isHealthy: false,
        jwtPresent: false,
        jwtExpired: false,
        canAccessDatabase: false,
        lastCheck: new Date(),
        errorMessage: error.message || 'Health check failed',
      });
    } finally {
      setIsChecking(false);
    }
  }, [user, session]);

  const recoverSession = useCallback(async () => {
    try {
      console.log('useAuthenticationHealth: Attempting session recovery...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No session after refresh');
      }

      // Wait for synchronization
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Re-check health
      await checkAuthHealth();

      return { success: true, error: null };
    } catch (error: any) {
      console.error('useAuthenticationHealth: Session recovery failed:', error);
      return { success: false, error: error.message };
    }
  }, [checkAuthHealth]);

  // Periodic health check every 30 seconds
  useEffect(() => {
    if (!user || !session) {
      return;
    }

    // Initial check
    checkAuthHealth();

    // Set up periodic check
    const interval = setInterval(() => {
      checkAuthHealth();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, session, checkAuthHealth]);

  return {
    healthStatus,
    isChecking,
    checkAuthHealth,
    recoverSession,
  };
};

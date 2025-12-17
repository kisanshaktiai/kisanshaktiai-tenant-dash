import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSession, setLoading, setError, logout, clearError } from '@/store/slices/authSlice';
import { clearTenantData } from '@/store/slices/tenantSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, loading, initialized, error } = useAppSelector((state) => state.auth);
  const initializationRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionReadyRef = useRef(false);

  const handleAuthStateChange = useCallback((event: string, session: any) => {
    if (!isMountedRef.current) {
      return;
    }
    
    console.log('useAuth: Auth state change ->', event, 'Session:', session?.user?.id || 'none');
    
    // Clear any pending initialization timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = undefined;
    }
    
    switch (event) {
      case 'INITIAL_SESSION':
        console.log('useAuth: Setting initial session', session?.user?.id);
        dispatch(setSession(session));
        dispatch(clearError());
        sessionReadyRef.current = !!session;
        break;
      case 'SIGNED_IN':
        console.log('useAuth: User signed in', session?.user?.id);
        dispatch(setSession(session));
        dispatch(clearError());
        sessionReadyRef.current = true;
        break;
      case 'SIGNED_OUT':
        console.log('useAuth: User signed out');
        dispatch(logout());
        dispatch(clearTenantData());
        localStorage.removeItem('supabase.auth.token');
        sessionReadyRef.current = false;
        break;
      case 'TOKEN_REFRESHED':
        console.log('useAuth: Token refreshed, updating session', session?.user?.id);
        dispatch(setSession(session));
        dispatch(clearError());
        sessionReadyRef.current = true;
        break;
      case 'USER_UPDATED':
        console.log('useAuth: User updated', session?.user?.id);
        dispatch(setSession(session));
        break;
      default:
        console.log('useAuth: Other auth event:', event);
        if (session) {
          dispatch(setSession(session));
          sessionReadyRef.current = true;
        }
    }
  }, [dispatch]);

  useEffect(() => {
    isMountedRef.current = true;

    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('useAuth: Starting initialization...');
        dispatch(setLoading(true));
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        subscriptionRef.current = subscription;

        // Get initial session with shorter timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          initTimeoutRef.current = setTimeout(() => reject(new Error('Session timeout')), 3000);
        });

        try {
          const { data: { session: initialSession }, error: sessionError } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;

          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = undefined;
          }
          
          if (sessionError) {
            console.error('useAuth: Session error:', sessionError);
            if (isMountedRef.current) {
              dispatch(setError(sessionError.message));
              dispatch(setSession(null));
            }
          } else {
            console.log('useAuth: Initial session retrieved', initialSession?.user?.id || 'no user');
            if (isMountedRef.current) {
              dispatch(setSession(initialSession));
              
              // If session exists but is expired, try to refresh
              if (initialSession && initialSession.expires_at) {
                const expiresAt = initialSession.expires_at * 1000;
                const now = Date.now();
                if (now >= expiresAt - 60000) { // Refresh if expires in less than 1 minute
                  console.log('useAuth: Session near expiry, refreshing...');
                  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                  if (!refreshError && refreshData.session) {
                    console.log('useAuth: Session refreshed successfully');
                    dispatch(setSession(refreshData.session));
                  }
                }
              }
            }
          }
        } catch (error: any) {
          console.warn('useAuth: Session timeout or error:', error.message);
          // Session timeout - continue without session
          if (isMountedRef.current) {
            dispatch(setSession(null));
          }
        }

        // Always clear loading after initialization attempt
        if (isMountedRef.current) {
          dispatch(setLoading(false));
        }
        
        console.log('useAuth: Initialization complete');

      } catch (error) {
        console.error('useAuth: Initialization error:', error);
        if (isMountedRef.current) {
          dispatch(setError(error instanceof Error ? error.message : 'Authentication error'));
          dispatch(setLoading(false));
        }
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = undefined;
      }
      
      initializationRef.current = false;
    };
  }, [dispatch, handleAuthStateChange]);

  const signIn = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch(setError(error.message));
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      dispatch(setError(errorMessage));
      return { data: null, error: { message: errorMessage } };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });

      if (error) {
        dispatch(setError(error.message));
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      dispatch(setError(errorMessage));
      return { data: null, error: { message: errorMessage } };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        dispatch(setError(error.message));
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      dispatch(setError(errorMessage));
      return { error: { message: errorMessage } };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch(clearError());
      
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        dispatch(setError(error.message));
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      dispatch(setError(errorMessage));
      return { data: null, error: { message: errorMessage } };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('useAuth: Session refresh failed:', error);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
      console.error('useAuth: Session refresh error:', errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const isSessionExpired = useCallback(() => {
    if (!session?.expires_at) return false;
    
    // expires_at is a Unix timestamp in seconds, convert to milliseconds
    const expiresAt = typeof session.expires_at === 'number' 
      ? session.expires_at * 1000 
      : new Date(session.expires_at).getTime();
    const now = Date.now();
    
    return now >= expiresAt;
  }, [session?.expires_at]);

  // Helper function to check if session is ready
  const isSessionReady = useCallback(() => {
    return sessionReadyRef.current && !!session && !!user;
  }, [session, user]);

  // Helper function to wait for session to be ready
  const waitForSessionReady = useCallback(async (timeout = 5000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (!isSessionReady()) {
      if (Date.now() - startTime > timeout) {
        console.error('useAuth: Timeout waiting for session to be ready');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return true;
  }, [isSessionReady]);

  return {
    user,
    session,
    loading,
    initialized,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    isSessionExpired,
    clearError: () => dispatch(clearError()),
    isSessionReady,
    waitForSessionReady,
  };
};

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSession, setLoading, setError, logout, clearError } from '@/store/slices/authSlice';
import { clearTenantData } from '@/store/slices/tenantSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, loading, initialized, error } = useAppSelector((state) => state.auth);

  const handleAuthStateChange = useCallback((event: string, session: any) => {
    console.log('useAuth: Auth state change event:', event);
    console.log('useAuth: Session user:', session?.user?.email || 'No user');
    
    switch (event) {
      case 'INITIAL_SESSION':
        console.log('useAuth: Handling initial session');
        dispatch(setSession(session));
        dispatch(clearError());
        break;
      case 'SIGNED_IN':
        console.log('useAuth: User signed in');
        dispatch(setSession(session));
        dispatch(clearError());
        break;
      case 'SIGNED_OUT':
        console.log('useAuth: User signed out');
        dispatch(logout());
        dispatch(clearTenantData());
        localStorage.removeItem('supabase.auth.token');
        break;
      case 'TOKEN_REFRESHED':
        console.log('useAuth: Token refreshed');
        dispatch(setSession(session));
        break;
      case 'USER_UPDATED':
        console.log('useAuth: User updated');
        dispatch(setSession(session));
        break;
      default:
        console.log('useAuth: Unknown auth event:', event);
        dispatch(setSession(session));
    }
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    console.log('useAuth: Initializing auth system');

    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) {
              console.log('useAuth: Component unmounted, ignoring auth change');
              return;
            }
            handleAuthStateChange(event, session);
          }
        );

        // Then get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('useAuth: Error getting initial session:', sessionError);
          if (mounted) {
            dispatch(setError(sessionError.message));
          }
        } else if (mounted) {
          console.log('useAuth: Initial session retrieved:', initialSession?.user?.email || 'No user');
          dispatch(setSession(initialSession));
        }

        return () => {
          console.log('useAuth: Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('useAuth: Error initializing auth:', error);
        if (mounted) {
          dispatch(setError(error instanceof Error ? error.message : 'Authentication error'));
          dispatch(setLoading(false));
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      console.log('useAuth: Component unmounting');
      mounted = false;
      cleanup?.then(unsub => unsub?.());
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

      // Session will be set automatically via onAuthStateChange
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

      // State will be cleared automatically via onAuthStateChange
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
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('useAuth: Error refreshing session:', error);
        dispatch(setError(error.message));
        return { session: null, error };
      }

      return { session, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
      dispatch(setError(errorMessage));
      return { session: null, error: { message: errorMessage } };
    }
  };

  const getAccessToken = () => {
    return session?.access_token || null;
  };

  const isSessionExpired = () => {
    if (!session) return true;
    
    const expiresAt = session.expires_at;
    if (!expiresAt) return false;
    
    // Check if session expires in the next 5 minutes
    const expirationTime = expiresAt * 1000; // Convert to milliseconds
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    
    return expirationTime < fiveMinutesFromNow;
  };

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
    getAccessToken,
    isSessionExpired,
    clearError: () => dispatch(clearError()),
  };
};


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
    // Prevent multiple initializations
    if (initializationRef.current) {
      console.log('useAuth: Already initialized, skipping');
      return;
    }

    console.log('useAuth: Initializing auth system');
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        subscriptionRef.current = subscription;

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('useAuth: Error getting initial session:', sessionError);
          dispatch(setError(sessionError.message));
        } else {
          console.log('useAuth: Initial session retrieved:', initialSession?.user?.email || 'No user');
          dispatch(setSession(initialSession));
        }

      } catch (error) {
        console.error('useAuth: Error initializing auth:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Authentication error'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      console.log('useAuth: Cleaning up auth subscription');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
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
    clearError: () => dispatch(clearError()),
  };
};

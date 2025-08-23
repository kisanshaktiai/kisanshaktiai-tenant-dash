
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSession, setLoading, logout } from '@/store/slices/authSlice';
import { tenantValidationService } from '@/services/TenantValidationService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, loading, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        dispatch(setSession(session));
        
        if (event === 'SIGNED_OUT') {
          dispatch(logout());
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          console.log('Initial session:', session?.user?.email);
          dispatch(setSession(session));
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        if (mounted) {
          dispatch(setSession(null));
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    dispatch(setLoading(true));
    
    try {
      // First validate if the user can login (tenant ownership check)
      const loginCheck = await tenantValidationService.checkUserCanLogin(email);
      
      if (!loginCheck.canLogin) {
        console.error('Sign in blocked:', loginCheck.reason);
        return { 
          data: null, 
          error: { 
            message: loginCheck.reason || 'Login not allowed',
            code: 'LOGIN_NOT_ALLOWED'
          } 
        };
      }

      // Proceed with authentication if tenant validation passes
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { data, error };
      }

      if (data.user) {
        console.log('Sign in successful for tenant owner:', data.user.email);
        console.log('Tenant data:', loginCheck.tenantData);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      return { 
        data: null, 
        error: { 
          message: error.message || 'An unexpected error occurred during login',
          code: 'UNEXPECTED_ERROR'
        } 
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = async () => {
    dispatch(setLoading(true));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { error: error as any };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      return { data, error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { data: null, error: error as any };
    }
  };

  return {
    user,
    session,
    loading,
    initialized,
    signIn,
    signOut,
    resetPassword,
  };
};

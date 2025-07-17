import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSession, setLoading, logout } from '@/store/slices/authSlice';
import { clearTenantData } from '@/store/slices/tenantSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, loading, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        dispatch(setSession(session));
        
        if (event === 'SIGNED_OUT') {
          dispatch(logout());
          dispatch(clearTenantData());
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    dispatch(setLoading(true));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    dispatch(setLoading(false));
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    dispatch(setLoading(true));
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });

    dispatch(setLoading(false));
    return { data, error };
  };

  const signOut = async () => {
    dispatch(setLoading(true));
    
    const { error } = await supabase.auth.signOut();
    
    dispatch(setLoading(false));
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { data, error };
  };

  return {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
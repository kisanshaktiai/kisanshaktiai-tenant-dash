
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { tenantValidationService } from '@/services/TenantValidationService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
        setInitialized(true);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Validate tenant access first
      const loginCheck = await tenantValidationService.checkUserCanLogin(email);
      
      if (!loginCheck.canLogin) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: loginCheck.reason || 'Login not allowed',
        });
        return { error: { message: loginCheck.reason || 'Login not allowed' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: error.message,
        });
        return { error };
      }

      toast({
        title: 'Welcome back!',
        description: 'You have been successfully signed in.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: 'An unexpected error occurred during login',
      });
      return { error: { message: error.message || 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          variant: 'destructive',
          title: 'Sign Out Error',
          description: error.message,
        });
      } else {
        toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
        });
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: 'An unexpected error occurred during sign out',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Reset Failed',
          description: error.message,
        });
        return { error };
      }

      toast({
        title: 'Reset Link Sent',
        description: 'Check your email for password reset instructions.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        variant: 'destructive',
        title: 'Reset Error',
        description: 'Failed to send password reset email',
      });
      return { error: { message: error.message || 'Failed to send reset email' } };
    }
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, AlertCircle } from 'lucide-react';

interface TenantLoginFormProps {
  onSuccess?: () => void;
}

export const TenantLoginForm: React.FC<TenantLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, error: authError, clearError } = useAuth();
  const { refreshTenantData } = useTenantContext();
  const { toast } = useToast();

  // Clear auth errors when component mounts or form values change
  useEffect(() => {
    if (authError) {
      clearError();
    }
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('TenantLoginForm: Attempting tenant login for:', email);
      
      // Sign in the user
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw new Error(signInError.message);
      }

      // Refresh tenant data after successful login
      await refreshTenantData();
      
      toast({
        title: 'Login successful',
        description: 'Welcome to your tenant dashboard',
      });

      onSuccess?.();
    } catch (error) {
      console.error('TenantLoginForm: Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Tenant Login</CardTitle>
        <CardDescription>
          Sign in to access your tenant dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In to Tenant
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, signIn } = useAuth();
  const { currentTenant, refreshTenantData } = useTenantContextOptimized();
  const { toast } = useToast();
  const location = useLocation();

  // Get the intended destination from navigation state
  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  // If user is already logged in and has a tenant, redirect
  if (user && currentTenant) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('LoginPage: Attempting login for:', email);
      
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw new Error(signInError.message);
      }

      // After successful login, refresh tenant data
      console.log('LoginPage: Login successful, refreshing tenant data');
      await refreshTenantData();
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });

    } catch (error) {
      console.error('LoginPage: Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your tenant dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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
              Sign In
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          
          <div className="mt-2 text-center text-sm">
            Don't have an organization?{' '}
            <Link to="/tenant-registration" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

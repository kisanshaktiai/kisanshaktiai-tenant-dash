
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { jwtSyncService } from '@/services/JWTSyncService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sprout, Users, BarChart3, Target, ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvancedInquiryForm } from '@/components/lead-capture/AdvancedInquiryForm';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparingWorkspace, setIsPreparingWorkspace] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, user } = useAuth();
  const { sendPasswordReset, isLoading: isResettingPassword } = usePasswordReset();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle state from navigation (e.g., from password setup)
  const locationState = location.state as { email?: string; message?: string } | null;

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Set email from location state if available
    if (locationState?.email) {
      setEmail(locationState.email);
    }

    // Show message from location state if available
    if (locationState?.message) {
      toast({
        title: 'Account Ready',
        description: locationState.message,
      });
    }
  }, [locationState, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    // Ensure JWT is synchronized before navigating
    try {
      setIsPreparingWorkspace(true);
      await jwtSyncService.ensureJWTReady();
      
      toast({
        title: 'Welcome back!',
        description: 'Loading your workspace...',
      });
      
      navigate('/');
    } catch {
      setError('Failed to synchronize authentication. Please try again.');
      toast({
        variant: "destructive",
        title: "Authentication Sync Failed",
        description: "Please try signing in again.",
      });
    } finally {
      setIsLoading(false);
      setIsPreparingWorkspace(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await sendPasswordReset(resetEmail);
    
    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error || 'Failed to send password reset email');
    }
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setError(null);
    setResetEmail('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AgriTenant Hub
            </h1>
            <p className="text-xl text-muted-foreground">
              Empower your agricultural organization with comprehensive farmer management, 
              data analytics, and growth insights.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-card border shadow-soft hover-scale">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Farmer Network</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage thousands of farmers with detailed profiles and activity tracking
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border shadow-soft hover-scale">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-accent/10">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time insights and comprehensive reports for data-driven decisions
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border shadow-soft hover-scale">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-success/10">
                  <Sprout className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-semibold">Growth Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor crop progress and land management with satellite imagery
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border shadow-soft hover-scale">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-info/10">
                  <Target className="h-5 w-5 text-info" />
                </div>
                <h3 className="font-semibold">Campaigns</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Run targeted campaigns and track engagement across your network
              </p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-2xl">
          <Card className="shadow-medium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome to AgriTenant Hub
              </CardTitle>
              <CardDescription className="text-center">
                {showForgotPassword 
                  ? 'Reset your password to regain access'
                  : 'Sign in to your account or request a personalized demo'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showForgotPassword ? (
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="demo">Request Demo</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        type="submit" 
                        className="w-full hover-scale" 
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="demo" className="space-y-4">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Request Your Personalized Demo</h3>
                      <p className="text-sm text-muted-foreground">
                        Interested in AgriTenant Hub? Get a customized demonstration of our platform 
                        tailored to your organization's specific needs.
                      </p>
                    </div>
                    <AdvancedInquiryForm />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToSignIn}
                    className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Button>
                  
                  {!resetSent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <Mail className="h-12 w-12 mx-auto text-primary mb-2" />
                        <h3 className="text-lg font-semibold">Forgot Password?</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your email address and you'll receive a secure link to reset your password.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isResettingPassword}
                      >
                        {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                        <Mail className="h-12 w-12 mx-auto text-success mb-2" />
                        <h3 className="text-lg font-semibold text-success mb-2">Check Your Email</h3>
                        <p className="text-sm text-muted-foreground">
                          You'll receive a secure link to reset your password at <strong>{resetEmail}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          The reset will be completed on our secure authentication portal.
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleBackToSignIn}
                        className="w-full"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;

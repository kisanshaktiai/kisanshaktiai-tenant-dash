import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sprout, Users, BarChart3, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative'>('agri_company');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, {
      organization_name: organizationName,
      organization_type: organizationType,
    });
    
    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    setIsLoading(false);
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
            <div className="p-4 rounded-lg bg-card border shadow-soft">
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
            
            <div className="p-4 rounded-lg bg-card border shadow-soft">
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
            
            <div className="p-4 rounded-lg bg-card border shadow-soft">
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
            
            <div className="p-4 rounded-lg bg-card border shadow-soft">
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
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome to AgriTenant Hub
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        type="text"
                        placeholder="Your organization name"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-type">Organization Type</Label>
                      <select
                        id="org-type"
                        className="w-full p-2 border rounded-md bg-background"
                        value={organizationType}
                        onChange={(e) => setOrganizationType(e.target.value as any)}
                      >
                        <option value="agri_company">Agricultural Company</option>
                        <option value="ngo">NGO</option>
                        <option value="university">University/Research</option>
                        <option value="government">Government Agency</option>
                        <option value="cooperative">Cooperative</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Organization
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
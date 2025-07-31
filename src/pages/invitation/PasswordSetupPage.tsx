
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { invitationService, InvitationTokenData } from '@/services/InvitationService';

const PasswordSetupPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tokenData, setTokenData] = useState<InvitationTokenData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setIsValidating(false);
        return;
      }

      try {
        const data = await invitationService.validateInvitationToken(token);
        setTokenData(data);
        
        if (!data.valid) {
          setError(data.error || 'Invalid or expired invitation token');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setError('Failed to validate invitation token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!tokenData || !token) {
      setError('Invalid invitation data');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await invitationService.setupPassword(
        tokenData.email,
        password,
        token
      );

      if (result.success) {
        setSuccess(true);
        toast({
          title: 'Account created successfully!',
          description: 'Your password has been set. You can now sign in.',
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth', { 
            state: { 
              email: tokenData.email,
              message: 'Your account has been created. Please sign in.' 
            }
          });
        }, 3000);
      } else {
        setError(result.error || 'Failed to set up password');
        toast({
          variant: 'destructive',
          title: 'Setup failed',
          description: result.error || 'Failed to set up your password',
        });
      }
    } catch (error) {
      console.error('Password setup error:', error);
      setError('An unexpected error occurred');
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: 'An unexpected error occurred during setup',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medium">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Validating invitation...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medium">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold text-success">
                Account Created!
              </CardTitle>
              <CardDescription>
                Your password has been set successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-center text-muted-foreground">
                  Redirecting to sign in page...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!tokenData?.valid || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-destructive">
                Invalid Invitation
              </CardTitle>
              <CardDescription>
                This invitation link is not valid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {error || 'The invitation link has expired, been used, or is invalid.'}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                className="w-full"
              >
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-medium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Set Up Your Password
            </CardTitle>
            <CardDescription className="text-center">
              Complete your account setup for AgriTenant Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">{tokenData.email}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Role: {tokenData.role.charAt(0).toUpperCase() + tokenData.role.slice(1)}
              </p>
            </div>

            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
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
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Setting Up Account...' : 'Set Up Password'}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                By setting up your password, you agree to our terms of service and privacy policy.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordSetupPage;

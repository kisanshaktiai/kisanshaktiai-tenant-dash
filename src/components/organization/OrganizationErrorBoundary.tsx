import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface OrganizationErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const OrganizationErrorFallback: React.FC<OrganizationErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-semibold">
            Organization Settings Error
          </CardTitle>
          <CardDescription>
            We encountered an issue loading your organization settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>Error:</strong> {error.message || 'Unknown error occurred'}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1"
              variant="outline"
              aria-label="Try again"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/app/dashboard')}
              className="flex-1"
              aria-label="Go to dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface OrganizationErrorBoundaryProps {
  children: React.ReactNode;
}

export const OrganizationErrorBoundary: React.FC<OrganizationErrorBoundaryProps> = ({
  children,
}) => {
  const handleError = (error: Error, info: { componentStack: string }) => {
    console.error('Organization Error Boundary caught error:', error, info);
  };

  return (
    <ErrorBoundary
      FallbackComponent={OrganizationErrorFallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
};

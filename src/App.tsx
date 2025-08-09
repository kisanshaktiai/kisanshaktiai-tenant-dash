
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { IntlProvider } from '@/components/providers/IntlProvider';

// Enhanced Layout
import { EnhancedDashboardLayout } from '@/components/layout/EnhancedDashboardLayout';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import FarmersPage from '@/pages/farmers/FarmersPage';
import DealersPage from '@/pages/dealers/DealersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import SettingsPage from '@/pages/SettingsPage';
import IntegrationsPage from '@/pages/integrations/IntegrationsPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import NotFound from '@/pages/NotFound';

// Authentication and Guards
import { useAuth } from '@/hooks/useAuth';
import { OnboardingGuard } from '@/components/guards/OnboardingGuard';
import { useTenantData } from '@/hooks/useTenantData';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <OnboardingGuard>
      <EnhancedDashboardLayout>
        {children}
      </EnhancedDashboardLayout>
    </OnboardingGuard>
  );
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Onboarding Route */}
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  } />
                  
                  <Route path="/farmers" element={
                    <RequireAuth>
                      <FarmersPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/dealers" element={
                    <RequireAuth>
                      <DealersPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/products" element={
                    <RequireAuth>
                      <ProductsPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/analytics" element={
                    <RequireAuth>
                      <AnalyticsPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/campaigns" element={
                    <RequireAuth>
                      <CampaignsPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/integrations" element={
                    <RequireAuth>
                      <IntegrationsPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/subscription" element={
                    <RequireAuth>
                      <SubscriptionPage />
                    </RequireAuth>
                  } />
                  
                  <Route path="/settings" element={
                    <RequireAuth>
                      <SettingsPage />
                    </RequireAuth>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </IntlProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--card-foreground))',
              },
            }}
          />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

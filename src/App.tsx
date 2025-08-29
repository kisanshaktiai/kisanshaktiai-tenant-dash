import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSessionManager } from "@/hooks/useSessionManager";
import { TenantProvider } from "@/contexts/TenantContext";
import { IntlProvider } from "@/components/providers/IntlProvider";
import { OnboardingGuard } from "@/components/guards/OnboardingGuard";
import { EnhancedDashboardLayout } from "@/components/layout/EnhancedDashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import FarmersPage from "./pages/farmers/FarmersPage";
import ProductsPage from "./pages/products/ProductsPage";
import DealersPage from "./pages/dealers/DealersPage";
import CampaignsPage from "./pages/CampaignsPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import IntegrationsPage from "./pages/integrations/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const { user, loading, initialized } = useAuth();
  const { isSessionActive } = useSessionManager();

  console.log('App: Auth state:', { 
    user: user?.email || 'No user', 
    loading, 
    initialized,
    isSessionActive
  });

  // Show loading while initializing auth
  if (!initialized) {
    console.log('App: Auth not initialized, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TenantProvider>
          <IntlProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/auth" 
                  element={
                    user && isSessionActive ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Auth />
                    )
                  } 
                />
                <Route 
                  path="/onboarding" 
                  element={
                    user && isSessionActive ? (
                      <OnboardingPage />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  } 
                />
                
                {/* Protected Dashboard Routes */}
                <Route
                  path="/*"
                  element={
                    user && isSessionActive ? (
                      <OnboardingGuard>
                        <EnhancedDashboardLayout />
                      </OnboardingGuard>
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="farmers" element={<FarmersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="dealers" element={<DealersPage />} />
                  <Route path="campaigns" element={<CampaignsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="integrations" element={<IntegrationsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </IntlProvider>
        </TenantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

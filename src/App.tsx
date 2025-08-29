
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSessionManager } from "@/hooks/useSessionManager";
import { TenantProvider } from "@/contexts/TenantContext";
import { IntlProvider } from "@/components/providers/IntlProvider";
import { OnboardingGuard } from "@/components/guards/OnboardingGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
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
                  path="/dashboard" 
                  element={
                    user && isSessionActive ? (
                      <OnboardingGuard>
                        <Dashboard />
                      </OnboardingGuard>
                    ) : (
                      <Navigate to="/auth" replace />
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

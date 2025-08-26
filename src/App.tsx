
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSession, setLoading, logout } from "@/store/slices/authSlice";
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
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(setLoading(true));
    
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
      dispatch(setLoading(false));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
      dispatch(setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/dashboard" 
                  element={
                    user ? (
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
                    user ? (
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

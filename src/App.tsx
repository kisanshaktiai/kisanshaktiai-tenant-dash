
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useTenantData } from '@/hooks/useTenantData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { FarmersPage } from '@/pages/farmers/FarmersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import IntegrationsPage from '@/pages/integrations/IntegrationsPage';
import DealersPage from '@/pages/dealers/DealersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAppSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// App content with store access
const AppContent = () => {
  const { theme } = useAppSelector((state) => state.ui);
  
  // Initialize authentication and tenant data
  useAuth();
  useTenantData();

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="farmers" element={<FarmersPage />} />
              <Route path="dealers" element={<DealersPage />} />
              <Route path="lands" element={<div>Land Management Page</div>} />
              <Route path="crops" element={<div>Crop Monitoring Page</div>} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="campaigns" element={<div>Campaigns Page</div>} />
              <Route path="performance" element={<div>Performance Page</div>} />
              <Route path="reports" element={<div>Reports Page</div>} />
              <Route path="messages" element={<div>Messages Page</div>} />
              <Route path="forum" element={<div>Community Forum Page</div>} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="notifications" element={<div>Notifications Page</div>} />
              <Route path="settings" element={<div>Settings Page</div>} />
              <Route path="profile" element={<div>Profile Page</div>} />
              <Route path="help" element={<div>Help & Support Page</div>} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
        <Toaster />
        <Sonner />
      </TooltipProvider>
      
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;

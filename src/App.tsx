import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Index } from '@/pages';
import { Auth } from '@/pages/auth';
import { Dashboard } from '@/pages/dashboard';
import { NotFound } from '@/pages/not-found';
import { IntlProvider } from './components/providers/IntlProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider as QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools as QueryClientDevtools } from '@tanstack/react-query/devtools';
import { queryClient } from '@/lib/queryClient';
import { OnboardingGuard } from './components/guards/OnboardingGuard';

import { GlobalErrorProvider } from '@/components/providers/GlobalErrorProvider';

function App() {
  return (
    <Provider store={store}>
      <GlobalErrorProvider>
        <QueryClient client={queryClient}>
          <IntlProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <QueryClientDevtools initialIsOpen={false} />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/*" element={<Auth />} />
                  <Route path="/dashboard/*" element={
                    <OnboardingGuard>
                      <Dashboard />
                    </OnboardingGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </IntlProvider>
        </QueryClient>
      </GlobalErrorProvider>
    </Provider>
  );
}

export default App;

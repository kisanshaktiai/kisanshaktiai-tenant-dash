import { useState, useCallback } from 'react';
import { corsHeaders } from '@/services/api/cors';
import { supabase } from '@/integrations/supabase/client';

interface CorsRequestOptions extends RequestInit {
  requireAuth?: boolean;
  tenantId?: string;
}

export const useCorsRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (
    url: string,
    options: CorsRequestOptions = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add authentication if required
      if (options.requireAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      // Add tenant ID if provided
      if (options.tenantId) {
        headers['X-Tenant-ID'] = options.tenantId;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    makeRequest,
    loading,
    error,
    clearError: () => setError(null),
  };
};
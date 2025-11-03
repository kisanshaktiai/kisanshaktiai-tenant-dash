import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useState } from 'react';

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_email?: string;
  action_type: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  field_name?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AuditLogsFilters {
  action_type?: string;
  table_name?: string;
  user_id?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export const useAuditLogs = (filters: AuditLogsFilters = {}) => {
  const { getTenantId } = useTenantIsolation();
  const [page, setPage] = useState(0);
  const pageSize = filters.limit || 50;

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', getTenantId(), filters, page],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('tenant_id', getTenantId())
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }

      if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data as AuditLog[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    logs: data?.logs || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: page,
    isLoading,
    error,
    nextPage: () => setPage((p) => p + 1),
    previousPage: () => setPage((p) => Math.max(0, p - 1)),
    goToPage: setPage,
  };
};

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { toast } from 'sonner';

export const useOrganizationExport = () => {
  const { getTenantId } = useTenantIsolation();
  const [isExporting, setIsExporting] = useState(false);

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      const tenantId = getTenantId();

      // Fetch all organization data
      const [profile, branding, features, settings, analytics] = await Promise.all([
        supabase.from('tenants').select('*').eq('id', tenantId).single(),
        supabase.from('tenant_branding').select('*').eq('tenant_id', tenantId).single(),
        supabase.from('tenant_features').select('*').eq('tenant_id', tenantId).single(),
        supabase.from('organization_settings').select('*').eq('tenant_id', tenantId).single(),
        supabase.from('organization_analytics').select('*').eq('tenant_id', tenantId).single(),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        tenant_id: tenantId,
        profile: profile.data,
        branding: branding.data,
        features: features.data,
        settings: settings.data,
        analytics: analytics.data,
      };

      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `organization-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Organization data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export organization data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (tableName: 'farmers' | 'dealers' | 'products') => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('tenant_id', getTenantId());

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info(`No ${tableName} data to export`);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => (typeof val === 'string' ? `"${val}"` : val))
          .join(',')
      );
      const csv = [headers, ...rows].join('\n');

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${tableName} data exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${tableName} data`);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToJSON,
    exportToCSV,
    isExporting,
  };
};

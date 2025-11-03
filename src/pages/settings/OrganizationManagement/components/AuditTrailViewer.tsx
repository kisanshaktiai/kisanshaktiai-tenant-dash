import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLogs } from '@/hooks/organization/useAuditLogs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, History, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const AuditTrailViewer = () => {
  const [filters, setFilters] = useState({
    action_type: '',
    table_name: '',
  });

  const { logs, totalCount, totalPages, currentPage, isLoading, nextPage, previousPage } = useAuditLogs({
    action_type: filters.action_type || undefined,
    table_name: filters.table_name || undefined,
    limit: 20,
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-500/10 text-green-500';
      case 'update':
        return 'bg-blue-500/10 text-blue-500';
      case 'delete':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Track all changes to organization settings ({totalCount} total entries)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Select
              value={filters.action_type || undefined}
              onValueChange={(value) => setFilters({ ...filters, action_type: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={filters.table_name || undefined}
              onValueChange={(value) => setFilters({ ...filters, table_name: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                <SelectItem value="tenants">Profile</SelectItem>
                <SelectItem value="tenant_branding">Branding</SelectItem>
                <SelectItem value="tenant_features">Features</SelectItem>
                <SelectItem value="organization_settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Audit Logs */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionBadgeColor(log.action_type)}>
                          {log.action_type}
                        </Badge>
                        <span className="text-sm font-medium">{log.table_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <span className="font-medium">User:</span> {log.user_email || log.user_id}
                        </div>
                        {log.field_name && (
                          <div>
                            <span className="font-medium">Field:</span> {log.field_name}
                          </div>
                        )}
                        {log.old_value && (
                          <div className="flex gap-2">
                            <span className="font-medium">Old:</span>
                            <code className="text-xs bg-muted px-1 rounded">
                              {JSON.stringify(log.old_value)}
                            </code>
                          </div>
                        )}
                        {log.new_value && (
                          <div className="flex gap-2">
                            <span className="font-medium">New:</span>
                            <code className="text-xs bg-muted px-1 rounded">
                              {JSON.stringify(log.new_value)}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM dd, yyyy')}
                      <br />
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

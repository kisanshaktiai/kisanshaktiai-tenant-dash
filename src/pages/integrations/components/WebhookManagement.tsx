import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Webhook, Plus, Settings, Trash2, TestTube, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  retry_attempts: number;
  timeout_seconds: number;
  last_triggered_at: string | null;
  success_count: number;
  failure_count: number;
  created_at: string;
  custom_headers: Record<string, string>;
  event_filters: Record<string, any>;
}

interface CreateWebhookForm {
  name: string;
  url: string;
  events: string[];
  retry_attempts: number;
  timeout_seconds: number;
  custom_headers: Record<string, string>;
  event_filters: Record<string, any>;
}

const AVAILABLE_EVENTS = [
  'farmer.created',
  'farmer.updated',
  'farmer.deleted',
  'product.created',
  'product.updated',
  'product.deleted',
  'order.created',
  'order.updated',
  'order.completed',
  'payment.processed',
  'sync.completed',
  'sync.failed'
];

export function WebhookManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WebhookData[];
    }
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (formData: CreateWebhookForm) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: userTenant } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (!userTenant) throw new Error('No active tenant found');

      const secretKey = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          name: formData.name,
          url: formData.url,
          events: formData.events,
          retry_attempts: formData.retry_attempts,
          timeout_seconds: formData.timeout_seconds,
          custom_headers: formData.custom_headers,
          event_filters: formData.event_filters,
          secret_key: secretKey,
          tenant_id: userTenant.tenant_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsCreateDialogOpen(false);
      toast.success('Webhook created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create webhook: ' + error.message);
    }
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete webhook: ' + error.message);
    }
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const { data, error } = await supabase.functions.invoke('webhook-handler', {
        body: {
          eventType: 'webhook.test',
          payload: {
            test: true,
            timestamp: new Date().toISOString(),
            message: 'This is a test webhook delivery'
          },
          tenantId: 'test' // This should be the actual tenant ID
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Test webhook sent successfully');
      setTestingWebhook(null);
    },
    onError: (error) => {
      toast.error('Failed to send test webhook: ' + error.message);
      setTestingWebhook(null);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const events = AVAILABLE_EVENTS.filter(event => 
      formData.get(event) === 'on'
    );

    // Parse custom headers
    const customHeadersText = formData.get('custom_headers') as string;
    let customHeaders = {};
    if (customHeadersText) {
      try {
        customHeaders = JSON.parse(customHeadersText);
      } catch {
        toast.error('Invalid JSON format for custom headers');
        return;
      }
    }

    // Parse event filters
    const eventFiltersText = formData.get('event_filters') as string;
    let eventFilters = {};
    if (eventFiltersText) {
      try {
        eventFilters = JSON.parse(eventFiltersText);
      } catch {
        toast.error('Invalid JSON format for event filters');
        return;
      }
    }

    createWebhookMutation.mutate({
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      events,
      retry_attempts: parseInt(formData.get('retry_attempts') as string),
      timeout_seconds: parseInt(formData.get('timeout_seconds') as string),
      custom_headers: customHeaders,
      event_filters: eventFilters
    });
  };

  const handleTestWebhook = (webhookId: string) => {
    setTestingWebhook(webhookId);
    testWebhookMutation.mutate(webhookId);
  };

  if (isLoading) {
    return <div>Loading webhooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Webhook Management</h2>
          <p className="text-muted-foreground">
            Configure webhooks to receive real-time event notifications
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Set up a webhook endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Order Processing Webhook"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="url">Endpoint URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://your-app.com/webhooks"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retry_attempts">Retry Attempts</Label>
                  <Input
                    id="retry_attempts"
                    name="retry_attempts"
                    type="number"
                    defaultValue="3"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout_seconds">Timeout (seconds)</Label>
                  <Input
                    id="timeout_seconds"
                    name="timeout_seconds"
                    type="number"
                    defaultValue="30"
                    min="5"
                    max="300"
                  />
                </div>
              </div>

              <div>
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {AVAILABLE_EVENTS.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <Checkbox
                        id={event}
                        name={event}
                      />
                      <Label htmlFor={event} className="text-sm">
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom_headers">Custom Headers (JSON)</Label>
                <Textarea
                  id="custom_headers"
                  name="custom_headers"
                  placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="event_filters">Event Filters (JSON)</Label>
                <Textarea
                  id="event_filters"
                  name="event_filters"
                  placeholder='{"status": "active", "type": "premium"}'
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createWebhookMutation.isPending}>
                  {createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks?.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Webhook className="w-4 h-4" />
                    <h3 className="font-semibold">{webhook.name}</h3>
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>URL: {webhook.url}</div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span>Timeout: {webhook.timeout_seconds}s</span>
                      <span>Retries: {webhook.retry_attempts}</span>
                      {webhook.last_triggered_at && (
                        <span>
                          Last triggered: {formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">{webhook.success_count} success</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{webhook.failure_count} failed</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testingWebhook === webhook.id}
                  >
                    <TestTube className="w-4 h-4" />
                    {testingWebhook === webhook.id ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                    disabled={deleteWebhookMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Plus, Play, Pause, Trash2, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Integration {
  id: string;
  integration_type: string;
  name: string;
  configuration: Record<string, any>;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  error_log: string | null;
  created_at: string;
}

interface IntegrationTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  configFields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }[];
}

const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    type: 'sap',
    name: 'SAP Integration',
    description: 'Connect with SAP ERP for farmer and product data synchronization',
    icon: '🏢',
    configFields: [
      { key: 'server_url', label: 'SAP Server URL', type: 'url', required: true, placeholder: 'https://sap-server.com' },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'client', label: 'Client', type: 'text', required: true, placeholder: '100' },
      { key: 'sync_interval', label: 'Sync Interval', type: 'select', required: true, options: ['hourly', 'daily', 'weekly'] }
    ]
  },
  {
    type: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Sync farmer data with Salesforce for customer relationship management',
    icon: '☁️',
    configFields: [
      { key: 'instance_url', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://yourinstance.salesforce.com' },
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ]
  },
  {
    type: 'tally',
    name: 'Tally ERP',
    description: 'Connect with Tally for financial data and inventory management',
    icon: '💰',
    configFields: [
      { key: 'server_url', label: 'Tally Server URL', type: 'url', required: true, placeholder: 'http://localhost:9000' },
      { key: 'company_name', label: 'Company Name', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false }
    ]
  },
  {
    type: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send notifications and messages to farmers via WhatsApp',
    icon: '📱',
    configFields: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', required: true },
      { key: 'webhook_verify_token', label: 'Webhook Verify Token', type: 'password', required: true },
      { key: 'template_namespace', label: 'Template Namespace', type: 'text', required: true }
    ]
  },
  {
    type: 'payment_gateway',
    name: 'Payment Gateway',
    description: 'Process payments and track transactions',
    icon: '💳',
    configFields: [
      { key: 'provider', label: 'Provider', type: 'select', required: true, options: ['razorpay', 'stripe', 'payu', 'ccavenue'] },
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: false }
    ]
  },
  {
    type: 'sms',
    name: 'SMS Service',
    description: 'Send SMS notifications to farmers',
    icon: '📧',
    configFields: [
      { key: 'provider', label: 'Provider', type: 'select', required: true, options: ['twilio', 'textlocal', 'msg91', 'aws_sns'] },
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'sender_id', label: 'Sender ID', type: 'text', required: true },
      { key: 'template_id', label: 'Template ID', type: 'text', required: false }
    ]
  }
];

export function IntegrationTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Integration[];
    }
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: { template: IntegrationTemplate; config: Record<string, any>; name: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: userTenant } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (!userTenant) throw new Error('No active tenant found');

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          integration_type: data.template.type,
          name: data.name,
          configuration: data.config,
          tenant_id: userTenant.tenant_id
        })
        .select()
        .single();

      if (error) throw error;
      return integration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setIsConfigDialogOpen(false);
      setSelectedTemplate(null);
      toast.success('Integration created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create integration: ' + error.message);
    }
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration status updated');
    },
    onError: (error) => {
      toast.error('Failed to update integration: ' + error.message);
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete integration: ' + error.message);
    }
  });

  const handleConfigureIntegration = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setIsConfigDialogOpen(true);
  };

  const handleSubmitConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const formData = new FormData(e.currentTarget);
    const config: Record<string, any> = {};
    
    selectedTemplate.configFields.forEach(field => {
      const value = formData.get(field.key) as string;
      if (value) {
        config[field.key] = value;
      }
    });

    const name = formData.get('integration_name') as string;

    createIntegrationMutation.mutate({
      template: selectedTemplate,
      config,
      name
    });
  };

  if (isLoading) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Integration Templates</h2>
        <p className="text-muted-foreground">
          Connect with external systems using pre-built integration templates
        </p>
      </div>

      {/* Available Templates */}
      <div>
        <h3 className="text-lg font-medium mb-4">Available Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATION_TEMPLATES.map((template) => (
            <Card key={template.type} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{template.icon}</span>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleConfigureIntegration(template)}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Integrations */}
      <div>
        <h3 className="text-lg font-medium mb-4">Active Integrations</h3>
        <div className="space-y-4">
          {integrations?.map((integration) => {
            const template = INTEGRATION_TEMPLATES.find(t => t.type === integration.integration_type);
            return (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{template?.icon || '🔗'}</span>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge variant={integration.is_active ? "default" : "secondary"}>
                          {integration.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={
                          integration.sync_status === 'completed' ? "default" :
                          integration.sync_status === 'failed' ? "destructive" : "secondary"
                        }>
                          {integration.sync_status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Type: {template?.name || integration.integration_type}</div>
                        {integration.last_sync_at && (
                          <div>
                            Last sync: {formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}
                          </div>
                        )}
                        {integration.error_log && (
                          <div className="text-red-600">Error: {integration.error_log}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleIntegrationMutation.mutate({
                          id: integration.id,
                          is_active: !integration.is_active
                        })}
                      >
                        {integration.is_active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                        disabled={deleteIntegrationMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <form onSubmit={handleSubmitConfig} className="space-y-4">
              <div>
                <Label htmlFor="integration_name">Integration Name</Label>
                <Input
                  id="integration_name"
                  name="integration_name"
                  placeholder={`My ${selectedTemplate.name}`}
                  required
                />
              </div>

              {selectedTemplate.configFields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <Select name={field.key} required={field.required}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.key}
                      name={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIntegrationMutation.isPending}>
                  {createIntegrationMutation.isPending ? 'Creating...' : 'Create Integration'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
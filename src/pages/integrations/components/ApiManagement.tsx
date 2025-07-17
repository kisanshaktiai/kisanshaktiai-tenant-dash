import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Key, Plus, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApiKey {
  id: string;
  key_name: string;
  api_key_prefix: string;
  permissions: string[];
  rate_limit_per_hour: number;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface CreateApiKeyForm {
  key_name: string;
  permissions: string[];
  rate_limit_per_hour: number;
  expires_at: string;
}

const AVAILABLE_PERMISSIONS = [
  'farmers:read',
  'farmers:write',
  'products:read',
  'products:write',
  'orders:read',
  'orders:write',
  'analytics:read',
  'webhooks:manage'
];

export function ApiManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApiKey[];
    }
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (formData: CreateApiKeyForm) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: userTenant } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (!userTenant) throw new Error('No active tenant found');

      const apiKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: newKey, error } = await supabase
        .from('api_keys')
        .insert({
          key_name: formData.key_name,
          api_key_hash: apiKeyHash,
          api_key_prefix: apiKey.substring(0, 8),
          permissions: formData.permissions,
          rate_limit_per_hour: formData.rate_limit_per_hour,
          expires_at: formData.expires_at || null,
          tenant_id: userTenant.tenant_id,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { ...newKey, full_api_key: apiKey };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewApiKey(data.full_api_key);
      setIsCreateDialogOpen(false);
      toast.success('API key created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create API key: ' + error.message);
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete API key: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const permissions = AVAILABLE_PERMISSIONS.filter(permission => 
      formData.get(permission) === 'on'
    );

    createApiKeyMutation.mutate({
      key_name: formData.get('key_name') as string,
      permissions,
      rate_limit_per_hour: parseInt(formData.get('rate_limit_per_hour') as string),
      expires_at: formData.get('expires_at') as string
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return <div>Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">API Key Management</h2>
          <p className="text-muted-foreground">
            Create and manage API keys for accessing your tenant data
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key with specific permissions and rate limits
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key_name">Key Name</Label>
                <Input
                  id="key_name"
                  name="key_name"
                  placeholder="e.g., Production API, Mobile App"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rate_limit_per_hour">Rate Limit (requests per hour)</Label>
                <Input
                  id="rate_limit_per_hour"
                  name="rate_limit_per_hour"
                  type="number"
                  defaultValue="1000"
                  min="1"
                  max="10000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="expires_at">Expiration Date (optional)</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="datetime-local"
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        name={permission}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createApiKeyMutation.isPending}>
                  {createApiKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {newApiKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">API Key Created Successfully</CardTitle>
            <CardDescription className="text-green-600">
              Save this API key securely. You won't be able to see it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 p-3 bg-green-100 rounded border font-mono text-sm">
              <span className="flex-1">{newApiKey}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(newApiKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              className="mt-3"
              onClick={() => setNewApiKey(null)}
            >
              I've saved the key
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {apiKeys?.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <h3 className="font-semibold">{apiKey.key_name}</h3>
                    <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                      {apiKey.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Prefix: {apiKey.api_key_prefix}...</span>
                    <span>Rate Limit: {apiKey.rate_limit_per_hour}/hour</span>
                    {apiKey.last_used_at && (
                      <span>
                        Last used: {formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })}
                      </span>
                    )}
                    {apiKey.expires_at && (
                      <span>
                        Expires: {formatDistanceToNow(new Date(apiKey.expires_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
                    disabled={deleteApiKeyMutation.isPending}
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
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiKeysPage = () => {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [apiKeys] = useState([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_****************************4a2f',
      created: '2025-01-15',
      lastUsed: '2 hours ago',
      status: 'active',
      permissions: ['read', 'write', 'delete']
    },
    {
      id: '2',
      name: 'Testing API',
      key: 'sk_test_****************************8b3c',
      created: '2025-01-10',
      lastUsed: '1 day ago',
      status: 'active',
      permissions: ['read']
    },
    {
      id: '3',
      name: 'Mobile App API',
      key: 'sk_mobile_**************************9d4e',
      created: '2024-12-20',
      lastUsed: 'Never',
      status: 'inactive',
      permissions: ['read', 'write']
    }
  ]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleRegenerateKey = (id: string) => {
    toast({
      title: "API Key Regenerated",
      description: "A new API key has been generated. Please update your applications.",
    });
  };

  const handleDeleteKey = (id: string) => {
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
      variant: "destructive"
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="API Keys"
        description="Manage API keys for integrations and third-party access"
      />

      <PageContent className="space-y-6">
        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Keep your API keys secure and never share them in public repositories or client-side code.
          </AlertDescription>
        </Alert>

        {/* Create New Key */}
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for your integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input 
                  id="keyName"
                  placeholder="e.g., Production Server"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="flex gap-3 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Read</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Write</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Delete</span>
                  </label>
                </div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Manage your existing API keys and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{apiKey.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created on {apiKey.created}
                        </p>
                      </div>
                    </div>
                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                      {apiKey.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input 
                      value={showKey === apiKey.id ? 'sk_live_1234567890abcdef1234567890abcdef' : apiKey.key}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                    >
                      {showKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyKey(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last used: {apiKey.lastUsed}
                      </span>
                      <div className="flex gap-2">
                        {apiKey.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateKey(apiKey.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>API Usage Statistics</CardTitle>
            <CardDescription>
              Monitor your API usage and rate limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">45,678</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Rate Limit</p>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-xs text-muted-foreground">Current usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageLayout>
  );
};

export default ApiKeysPage;
export { ApiKeysPage };

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { 
  Database, 
  Shield, 
  Lock, 
  Download,
  Trash2,
  FileText,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataPrivacyPage = () => {
  const { toast } = useToast();
  const [dataRetention, setDataRetention] = useState('365');
  const [anonymization, setAnonymization] = useState(true);
  const [encryption, setEncryption] = useState(true);

  const handleExportData = () => {
    toast({
      title: "Data Export Initiated",
      description: "You'll receive an email with your data export within 24 hours.",
    });
  };

  const handleDeleteData = () => {
    toast({
      title: "Deletion Request Submitted",
      description: "Your data deletion request has been submitted for review.",
      variant: "destructive"
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Data & Privacy"
        description="Manage your data retention, privacy settings, and compliance"
      />

      <PageContent className="space-y-6">
        {/* GDPR Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              GDPR Compliance
            </CardTitle>
            <CardDescription>
              Your rights and data protection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your organization is compliant with GDPR regulations. Last audit: January 15, 2025
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Right to Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your organization's data
                  </p>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Right to Erasure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Request complete data deletion
                  </p>
                  <Button variant="destructive" onClick={handleDeleteData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention Policy</CardTitle>
            <CardDescription>
              Configure how long your data is retained
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Retention Period</Label>
                  <p className="text-sm text-muted-foreground">How long to keep inactive data</p>
                </div>
                <select 
                  className="w-40 p-2 border rounded-md"
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                >
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                  <option value="1825">5 years</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Farmer Data</p>
                    <p className="text-sm text-muted-foreground">Profile and activity data</p>
                  </div>
                  <Badge variant="secondary">Active: 1 year</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Transaction Logs</p>
                    <p className="text-sm text-muted-foreground">Purchase and payment records</p>
                  </div>
                  <Badge variant="secondary">Active: 5 years</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Analytics Data</p>
                    <p className="text-sm text-muted-foreground">Aggregated analytics and reports</p>
                  </div>
                  <Badge variant="secondary">Active: 2 years</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control how your data is processed and shared
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Data Anonymization</p>
                <p className="text-sm text-muted-foreground">
                  Automatically anonymize old data
                </p>
              </div>
              <Switch
                checked={anonymization}
                onCheckedChange={setAnonymization}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">End-to-End Encryption</p>
                <p className="text-sm text-muted-foreground">
                  Encrypt sensitive data at rest and in transit
                </p>
              </div>
              <Switch
                checked={encryption}
                onCheckedChange={setEncryption}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Third-Party Sharing</p>
                <p className="text-sm text-muted-foreground">
                  Control data sharing with partners
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Data Processing Activities</CardTitle>
            <CardDescription>
              Overview of how your data is processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Analytics Processing</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aggregated data analysis for insights and reporting
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">AI Model Training</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Using anonymized data to improve recommendations
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Backup & Recovery</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Regular backups for disaster recovery
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageLayout>
  );
};

export default DataPrivacyPage;
export { DataPrivacyPage };
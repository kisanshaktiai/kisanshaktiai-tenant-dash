
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { useDataPrivacySettings } from '@/hooks/useSettingsData';
import { Loading } from '@/components/Loading';
import { Database, Shield, Clock, Download } from 'lucide-react';

const dataPrivacySchema = z.object({
  data_retention_policy: z.object({
    user_data_days: z.number().min(30),
    audit_logs_days: z.number().min(90),
    analytics_days: z.number().min(30),
  }),
  anonymization_settings: z.object({
    auto_anonymize: z.boolean(),
    anonymize_after_days: z.number().min(30),
  }),
  gdpr_settings: z.object({
    enabled: z.boolean(),
    consent_required: z.boolean(),
    data_portability: z.boolean(),
  }),
  backup_settings: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    retention_days: z.number().min(7),
  }),
  encryption_settings: z.object({
    at_rest: z.boolean(),
    in_transit: z.boolean(),
    key_rotation_days: z.number().min(30),
  }),
  third_party_sharing: z.object({
    analytics: z.boolean(),
    marketing: z.boolean(),
    required_only: z.boolean(),
  }),
});

type DataPrivacyFormData = z.infer<typeof dataPrivacySchema>;

const DataPrivacyPage = () => {
  const { data: settings, isLoading, update, isUpdating } = useDataPrivacySettings();

  const form = useForm<DataPrivacyFormData>({
    resolver: zodResolver(dataPrivacySchema),
    defaultValues: {
      data_retention_policy: {
        user_data_days: 2555,
        audit_logs_days: 2555,
        analytics_days: 1095,
      },
      anonymization_settings: {
        auto_anonymize: false,
        anonymize_after_days: 365,
      },
      gdpr_settings: {
        enabled: true,
        consent_required: true,
        data_portability: true,
      },
      backup_settings: {
        enabled: true,
        frequency: 'daily',
        retention_days: 30,
      },
      encryption_settings: {
        at_rest: true,
        in_transit: true,
        key_rotation_days: 90,
      },
      third_party_sharing: {
        analytics: false,
        marketing: false,
        required_only: true,
      },
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        data_retention_policy: settings.data_retention_policy || form.getValues('data_retention_policy'),
        anonymization_settings: settings.anonymization_settings || form.getValues('anonymization_settings'),
        gdpr_settings: settings.gdpr_settings || form.getValues('gdpr_settings'),
        backup_settings: settings.backup_settings || form.getValues('backup_settings'),
        encryption_settings: settings.encryption_settings || form.getValues('encryption_settings'),
        third_party_sharing: settings.third_party_sharing || form.getValues('third_party_sharing'),
      });
    }
  }, [settings, form]);

  const onSubmit = (data: DataPrivacyFormData) => {
    update(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Data & Privacy Settings"
        description="Configure data retention, privacy policies, and compliance settings"
      />

      <PageContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Retention Policy
                </CardTitle>
                <CardDescription>
                  Configure how long different types of data are retained
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="data_retention_policy.user_data_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Data (days)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Personal and profile data</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="data_retention_policy.audit_logs_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audit Logs (days)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Security and action logs</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="data_retention_policy.analytics_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analytics Data (days)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Usage and performance data</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* GDPR Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  GDPR Compliance
                </CardTitle>
                <CardDescription>
                  Configure General Data Protection Regulation compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="gdpr_settings.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable GDPR Compliance</FormLabel>
                        <p className="text-sm text-muted-foreground">Activate GDPR compliance features</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gdpr_settings.consent_required"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Require Explicit Consent</FormLabel>
                        <p className="text-sm text-muted-foreground">Users must explicitly consent to data processing</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gdpr_settings.data_portability"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable Data Portability</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow users to export their data</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Data Anonymization */}
            <Card>
              <CardHeader>
                <CardTitle>Data Anonymization</CardTitle>
                <CardDescription>
                  Configure automatic data anonymization policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="anonymization_settings.auto_anonymize"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Auto-Anonymize Data</FormLabel>
                        <p className="text-sm text-muted-foreground">Automatically anonymize old data</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anonymization_settings.anonymize_after_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anonymize After (days)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Days after which data is automatically anonymized</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Backup Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic data backup policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="backup_settings.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable Automatic Backups</FormLabel>
                        <p className="text-sm text-muted-foreground">Automatically create data backups</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="backup_settings.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="backup_settings.retention_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Retention (days)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">How long to keep backups</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Encryption Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Encryption Settings</CardTitle>
                <CardDescription>
                  Configure data encryption and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="encryption_settings.at_rest"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Encryption at Rest</FormLabel>
                          <p className="text-sm text-muted-foreground">Encrypt stored data</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="encryption_settings.in_transit"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Encryption in Transit</FormLabel>
                          <p className="text-sm text-muted-foreground">Encrypt data transmission</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="encryption_settings.key_rotation_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Rotation Period (days)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">How often to rotate encryption keys</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </PageContent>
    </PageLayout>
  );
};

export default DataPrivacyPage;

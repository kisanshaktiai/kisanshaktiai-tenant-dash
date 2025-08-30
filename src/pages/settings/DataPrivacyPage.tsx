
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { useDataPrivacySettings } from '@/hooks/useSettingsData';
import Loading from '@/components/Loading';
import { Database, Shield, Clock, HardDrive } from 'lucide-react';

const dataPrivacySchema = z.object({
  data_retention_policy: z.object({
    user_data_days: z.number().min(30).max(365),
    automatic_deletion: z.boolean(),
  }),
  anonymization_settings: z.object({
    auto_anonymize: z.boolean(),
    anonymize_after_days: z.number().min(7).max(30),
  }),
  gdpr_settings: z.object({
    enabled: z.boolean(),
    consent_required: z.boolean(),
    data_portability: z.boolean(),
  }),
  backup_settings: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    retention_days: z.number().min(7).max(365),
  }),
  encryption_settings: z.object({
    at_rest: z.boolean(),
    in_transit: z.boolean(),
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
        user_data_days: 90,
        automatic_deletion: true,
      },
      anonymization_settings: {
        auto_anonymize: false,
        anonymize_after_days: 14,
      },
      gdpr_settings: {
        enabled: true,
        consent_required: true,
        data_portability: true,
      },
      backup_settings: {
        enabled: true,
        frequency: 'weekly',
        retention_days: 90,
      },
      encryption_settings: {
        at_rest: true,
        in_transit: true,
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
      const formData: DataPrivacyFormData = {
        data_retention_policy: {
          user_data_days: settings.data_retention_policy?.user_data_days || 90,
          automatic_deletion: true, // Map from different property structure
        },
        anonymization_settings: {
          auto_anonymize: settings.anonymization_settings?.auto_anonymize || false,
          anonymize_after_days: settings.anonymization_settings?.anonymize_after_days || 14,
        },
        gdpr_settings: {
          enabled: settings.gdpr_settings?.enabled || true,
          consent_required: settings.gdpr_settings?.consent_required || true,
          data_portability: settings.gdpr_settings?.data_portability || true,
        },
        backup_settings: {
          enabled: settings.backup_settings?.enabled || true,
          frequency: (settings.backup_settings?.frequency as 'daily' | 'weekly' | 'monthly') || 'weekly',
          retention_days: settings.backup_settings?.retention_days || 90,
        },
        encryption_settings: {
          at_rest: settings.encryption_settings?.at_rest || true,
          in_transit: settings.encryption_settings?.in_transit || true,
        },
        third_party_sharing: {
          analytics: settings.third_party_sharing?.analytics || false,
          marketing: settings.third_party_sharing?.marketing || false,
          required_only: settings.third_party_sharing?.required_only || true,
        },
      };
      form.reset(formData);
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
            {/* Data Retention Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Data Retention Policy
                </CardTitle>
                <CardDescription>
                  Set the data retention period and automatic deletion settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="data_retention_policy.user_data_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Data Retention (days)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data_retention_policy.automatic_deletion"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Automatic Deletion</FormLabel>
                        <p className="text-sm text-muted-foreground">Automatically delete data after the retention period</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Anonymization Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Anonymization Settings
                </CardTitle>
                <CardDescription>
                  Configure data anonymization settings for privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="anonymization_settings.auto_anonymize"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Auto Anonymize</FormLabel>
                        <p className="text-sm text-muted-foreground">Automatically anonymize personal data to protect user privacy</p>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* GDPR Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  GDPR Settings
                </CardTitle>
                <CardDescription>
                  Manage GDPR compliance settings and user rights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="gdpr_settings.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable GDPR</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable GDPR compliance features</p>
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
                        <FormLabel>Consent Required</FormLabel>
                        <p className="text-sm text-muted-foreground">Require user consent for data processing</p>
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
                        <FormLabel>Data Portability</FormLabel>
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

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Backup Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic data backups and storage settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="backup_settings.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable Backups</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable automatic data backups</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backup_settings.frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backup Frequency</FormLabel>
                      <FormControl>
                        <select {...field} className="border rounded px-3 py-2 w-full">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Encryption Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Encryption Settings</CardTitle>
                <CardDescription>
                  Configure data encryption settings for enhanced security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="encryption_settings.at_rest"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Encryption at Rest</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable encryption for stored data</p>
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
                        <p className="text-sm text-muted-foreground">Enable encryption for data transmission</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Third-Party Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Sharing</CardTitle>
                <CardDescription>
                  Control data sharing with third-party services and applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="third_party_sharing.analytics"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Analytics Sharing</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow sharing data with analytics providers</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="third_party_sharing.marketing"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Marketing Sharing</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow sharing data with marketing partners</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="third_party_sharing.required_only"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Required Only</FormLabel>
                        <p className="text-sm text-muted-foreground">Share data only when required for functionality</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </PageContent>
    </PageLayout>
  );
};

export default DataPrivacyPage;


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
    retention_period: z.number().min(30).max(365),
    automatic_deletion: z.boolean(),
  }),
  anonymization_settings: z.object({
    anonymize_data: z.boolean(),
    anonymization_delay: z.number().min(7).max(30),
  }),
  gdpr_settings: z.object({
    consent_tracking: z.boolean(),
    data_portability: z.boolean(),
    right_to_be_forgotten: z.boolean(),
  }),
  backup_settings: z.object({
    automatic_backups: z.boolean(),
    backup_frequency: z.enum(['daily', 'weekly', 'monthly']),
    backup_location: z.string().optional(),
  }),
  encryption_settings: z.object({
    data_encryption: z.boolean(),
    encryption_type: z.enum(['AES-256', 'RSA']),
  }),
  third_party_sharing: z.object({
    allow_third_party_sharing: z.boolean(),
    shared_data_types: z.array(z.string()).optional(),
  }),
});

type DataPrivacyFormData = z.infer<typeof dataPrivacySchema>;

const DataPrivacyPage = () => {
  const { data: settings, isLoading, update, isUpdating } = useDataPrivacySettings();

  const form = useForm<DataPrivacyFormData>({
    resolver: zodResolver(dataPrivacySchema),
    defaultValues: {
      data_retention_policy: {
        retention_period: 90,
        automatic_deletion: true,
      },
      anonymization_settings: {
        anonymize_data: false,
        anonymization_delay: 14,
      },
      gdpr_settings: {
        consent_tracking: true,
        data_portability: true,
        right_to_be_forgotten: true,
      },
      backup_settings: {
        automatic_backups: true,
        backup_frequency: 'weekly',
        backup_location: '',
      },
      encryption_settings: {
        data_encryption: true,
        encryption_type: 'AES-256',
      },
      third_party_sharing: {
        allow_third_party_sharing: false,
        shared_data_types: [],
      },
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        data_retention_policy: settings.data_retention_policy || {
          retention_period: 90,
          automatic_deletion: true,
        },
        anonymization_settings: settings.anonymization_settings || {
          anonymize_data: false,
          anonymization_delay: 14,
        },
        gdpr_settings: settings.gdpr_settings || {
          consent_tracking: true,
          data_portability: true,
          right_to_be_forgotten: true,
        },
        backup_settings: settings.backup_settings || {
          automatic_backups: true,
          backup_frequency: 'weekly' as const,
          backup_location: '',
        },
        encryption_settings: settings.encryption_settings || {
          data_encryption: true,
          encryption_type: 'AES-256' as const,
        },
        third_party_sharing: settings.third_party_sharing || {
          allow_third_party_sharing: false,
          shared_data_types: [],
        },
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
                  name="data_retention_policy.retention_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retention Period (days)</FormLabel>
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
                  name="anonymization_settings.anonymize_data"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Anonymize Data</FormLabel>
                        <p className="text-sm text-muted-foreground">Anonymize personal data to protect user privacy</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anonymization_settings.anonymization_delay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anonymization Delay (days)</FormLabel>
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
                  name="gdpr_settings.consent_tracking"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Consent Tracking</FormLabel>
                        <p className="text-sm text-muted-foreground">Track user consent for data processing</p>
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
                <FormField
                  control={form.control}
                  name="gdpr_settings.right_to_be_forgotten"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Right to be Forgotten</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable users to request data deletion</p>
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
                  name="backup_settings.automatic_backups"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Automatic Backups</FormLabel>
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
                  name="backup_settings.backup_frequency"
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
                  name="backup_settings.backup_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backup Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., AWS S3, Google Cloud Storage" />
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
                  name="encryption_settings.data_encryption"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Data Encryption</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable data encryption to protect sensitive information</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="encryption_settings.encryption_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encryption Type</FormLabel>
                      <FormControl>
                        <select {...field} className="border rounded px-3 py-2 w-full">
                          <option value="AES-256">AES-256</option>
                          <option value="RSA">RSA</option>
                        </select>
                      </FormControl>
                      <FormMessage />
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
                  name="third_party_sharing.allow_third_party_sharing"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Allow Third-Party Sharing</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow data sharing with third-party services</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('third_party_sharing.allow_third_party_sharing') && (
                  <FormField
                    control={form.control}
                    name="third_party_sharing.shared_data_types"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shared Data Types</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., User data, Analytics data" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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


import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { useNotificationPreferences } from '@/hooks/useSettingsData';
import Loading from '@/components/Loading';
import { Bell, Mail, Smartphone, Monitor, Clock } from 'lucide-react';

const notificationSchema = z.object({
  email_notifications: z.object({
    system: z.boolean(),
    marketing: z.boolean(),
    security: z.boolean(),
    campaigns: z.boolean(),
  }),
  push_notifications: z.object({
    enabled: z.boolean(),
    sound: z.boolean(),
    badge: z.boolean(),
  }),
  sms_notifications: z.object({
    enabled: z.boolean(),
    security_alerts: z.boolean(),
  }),
  in_app_notifications: z.object({
    enabled: z.boolean(),
    popup: z.boolean(),
    sound: z.boolean(),
  }),
  notification_schedule: z.object({
    quiet_hours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const NotificationsPage = () => {
  const { data: settings, isLoading, update, isUpdating } = useNotificationPreferences();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: {
        system: true,
        marketing: true,
        security: true,
        campaigns: true,
      },
      push_notifications: {
        enabled: true,
        sound: true,
        badge: true,
      },
      sms_notifications: {
        enabled: true,
        security_alerts: true,
      },
      in_app_notifications: {
        enabled: true,
        popup: true,
        sound: true,
      },
      notification_schedule: {
        quiet_hours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      },
    },
  });

  React.useEffect(() => {
    if (settings) {
      const formData: NotificationFormData = {
        email_notifications: {
          system: settings.email_notifications?.system || true,
          marketing: settings.email_notifications?.marketing || true,
          security: settings.email_notifications?.security || true,
          campaigns: settings.email_notifications?.campaigns || true,
        },
        push_notifications: {
          enabled: settings.push_notifications?.enabled || true,
          sound: settings.push_notifications?.sound || true,
          badge: settings.push_notifications?.badge || true,
        },
        sms_notifications: {
          enabled: settings.sms_notifications?.enabled || true,
          security_alerts: settings.sms_notifications?.security_alerts || true,
        },
        in_app_notifications: {
          enabled: settings.in_app_notifications?.enabled || true,
          popup: settings.in_app_notifications?.popup || true,
          sound: settings.in_app_notifications?.sound || true,
        },
        notification_schedule: {
          quiet_hours: {
            enabled: settings.notification_schedule?.quiet_hours?.enabled || false,
            start: settings.notification_schedule?.quiet_hours?.start || '22:00',
            end: settings.notification_schedule?.quiet_hours?.end || '08:00',
          },
        },
      };
      form.reset(formData);
    }
  }, [settings, form]);

  const onSubmit = (data: NotificationFormData) => {
    update(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Notification Preferences"
        description="Customize how you receive updates and alerts"
      />

      <PageContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Control which updates you receive via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email_notifications.system"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>System Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive notifications about system updates and maintenance</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_notifications.marketing"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Marketing Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive marketing updates and promotional content</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_notifications.security"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Security Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive alerts about security events and login attempts</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_notifications.campaigns"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Campaign Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive notifications about campaign updates and results</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Manage notifications delivered to your mobile devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="push_notifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable Push Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow push notifications to be sent to your devices</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="push_notifications.sound"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Sound</FormLabel>
                        <p className="text-sm text-muted-foreground">Play sound when receiving push notifications</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="push_notifications.badge"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Badge</FormLabel>
                        <p className="text-sm text-muted-foreground">Show badge count on app icon</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
                <CardDescription>
                  Configure critical alerts delivered via SMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sms_notifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable SMS</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow SMS notifications to be sent to your phone</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sms_notifications.security_alerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Security Alerts</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive SMS for security events and suspicious activity</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  In-App Notifications
                </CardTitle>
                <CardDescription>
                  Customize notifications displayed within the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="in_app_notifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable In-App Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="in_app_notifications.popup"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Popup Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Show popup notifications in the app</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="in_app_notifications.sound"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Sound</FormLabel>
                        <p className="text-sm text-muted-foreground">Play sound for in-app notifications</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notification Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Notification Schedule
                </CardTitle>
                <CardDescription>
                  Configure quiet hours and notification timing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notification_schedule.quiet_hours.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Quiet Hours</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable quiet hours to pause non-critical notifications</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('notification_schedule.quiet_hours.enabled') && (
                  <>
                    <FormField
                      control={form.control}
                      name="notification_schedule.quiet_hours.start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <input {...field} type="time" className="border rounded px-3 py-2 w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notification_schedule.quiet_hours.end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <input {...field} type="time" className="border rounded px-3 py-2 w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        </Form>
      </PageContent>
    </PageLayout>
  );
};

export default NotificationsPage;

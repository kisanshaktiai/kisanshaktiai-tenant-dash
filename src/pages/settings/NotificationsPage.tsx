
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
import { useNotificationPreferences } from '@/hooks/useSettingsData';
import { Loading } from '@/components/Loading';
import { Bell, Mail, Smartphone, MessageSquare, Clock } from 'lucide-react';

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
  const { data: preferences, isLoading, update, isUpdating } = useNotificationPreferences();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: {
        system: true,
        marketing: false,
        security: true,
        campaigns: true,
      },
      push_notifications: {
        enabled: true,
        sound: true,
        badge: true,
      },
      sms_notifications: {
        enabled: false,
        security_alerts: false,
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
    if (preferences) {
      form.reset({
        email_notifications: preferences.email_notifications || form.getValues('email_notifications'),
        push_notifications: preferences.push_notifications || form.getValues('push_notifications'),
        sms_notifications: preferences.sms_notifications || form.getValues('sms_notifications'),
        in_app_notifications: preferences.in_app_notifications || form.getValues('in_app_notifications'),
        notification_schedule: preferences.notification_schedule || form.getValues('notification_schedule'),
      });
    }
  }, [preferences, form]);

  const onSubmit = (data: NotificationFormData) => {
    update(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Notification Settings"
        description="Configure how and when you receive notifications"
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
                  Choose which email notifications you want to receive
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
                        <p className="text-sm text-muted-foreground">Important updates and system messages</p>
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
                        <FormLabel>Security Alerts</FormLabel>
                        <p className="text-sm text-muted-foreground">Login attempts and security-related notifications</p>
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
                        <FormLabel>Campaign Updates</FormLabel>
                        <p className="text-sm text-muted-foreground">Campaign status and performance reports</p>
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
                        <FormLabel>Marketing Communications</FormLabel>
                        <p className="text-sm text-muted-foreground">Product updates and promotional content</p>
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
                  Configure browser and mobile push notifications
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
                        <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
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
                        <FormLabel>Notification Sounds</FormLabel>
                        <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
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
                        <FormLabel>Badge Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Show notification count on app icon</p>
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
                  <MessageSquare className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
                <CardDescription>
                  Configure text message notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sms_notifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable SMS Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
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
                        <FormLabel>Security Alerts via SMS</FormLabel>
                        <p className="text-sm text-muted-foreground">Critical security notifications via text</p>
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
                  <Bell className="h-5 w-5" />
                  In-App Notifications
                </CardTitle>
                <CardDescription>
                  Configure notifications within the application
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
                        <p className="text-sm text-muted-foreground">Show notifications within the app</p>
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
                        <p className="text-sm text-muted-foreground">Show popup notifications in the interface</p>
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
                        <FormLabel>In-App Sounds</FormLabel>
                        <p className="text-sm text-muted-foreground">Play sounds for in-app notifications</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quiet Hours
                </CardTitle>
                <CardDescription>
                  Set times when you don't want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notification_schedule.quiet_hours.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable Quiet Hours</FormLabel>
                        <p className="text-sm text-muted-foreground">Pause non-critical notifications during set hours</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('notification_schedule.quiet_hours.enabled') && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="notification_schedule.quiet_hours.start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
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
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </PageContent>
    </PageLayout>
  );
};

export default NotificationsPage;

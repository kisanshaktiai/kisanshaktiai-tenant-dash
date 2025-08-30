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
    new_followers: z.boolean(),
    new_messages: z.boolean(),
    new_comments: z.boolean(),
    updates_and_announcements: z.boolean(),
  }),
  push_notifications: z.object({
    new_followers: z.boolean(),
    new_messages: z.boolean(),
    new_comments: z.boolean(),
    updates_and_announcements: z.boolean(),
  }),
  sms_notifications: z.object({
    security_alerts: z.boolean(),
    critical_updates: z.boolean(),
  }),
  in_app_notifications: z.object({
    new_followers: z.boolean(),
    new_messages: z.boolean(),
    new_comments: z.boolean(),
    updates_and_announcements: z.boolean(),
  }),
  notification_schedule: z.object({
    daily_summary: z.boolean(),
    weekly_report: z.boolean(),
    monthly_newsletter: z.boolean(),
  }),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const NotificationsPage = () => {
  const { data: settings, isLoading, update, isUpdating } = useNotificationPreferences();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: {
        new_followers: true,
        new_messages: true,
        new_comments: true,
        updates_and_announcements: true,
      },
      push_notifications: {
        new_followers: true,
        new_messages: true,
        new_comments: true,
        updates_and_announcements: true,
      },
      sms_notifications: {
        security_alerts: true,
        critical_updates: true,
      },
      in_app_notifications: {
        new_followers: true,
        new_messages: true,
        new_comments: true,
        updates_and_announcements: true,
      },
      notification_schedule: {
        daily_summary: true,
        weekly_report: true,
        monthly_newsletter: true,
      },
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        email_notifications: settings.email_notifications || form.getValues('email_notifications'),
        push_notifications: settings.push_notifications || form.getValues('push_notifications'),
        sms_notifications: settings.sms_notifications || form.getValues('sms_notifications'),
        in_app_notifications: settings.in_app_notifications || form.getValues('in_app_notifications'),
        notification_schedule: settings.notification_schedule || form.getValues('notification_schedule'),
      });
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
                  name="email_notifications.new_followers"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Followers</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when someone starts following you</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_notifications.new_messages"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Messages</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when you receive a new direct message</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_notifications.new_comments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Comments</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when someone comments on your posts</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_notifications.updates_and_announcements"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Updates and Announcements</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive important product updates and announcements</p>
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
                  name="push_notifications.new_followers"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Followers</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when someone starts following you</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="push_notifications.new_messages"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Messages</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when you receive a new direct message</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="push_notifications.new_comments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Comments</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when someone comments on your posts</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="push_notifications.updates_and_announcements"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Updates and Announcements</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive important product updates and announcements</p>
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
                  name="sms_notifications.security_alerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Security Alerts</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify about suspicious activity or security breaches</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sms_notifications.critical_updates"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Critical Updates</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive notifications about critical system updates</p>
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
                  name="in_app_notifications.new_followers"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Followers</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when someone starts following you</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="in_app_notifications.new_messages"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Messages</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when you receive a new direct message</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="in_app_notifications.new_comments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>New Comments</FormLabel>
                        <p className="text-sm text-muted-foreground">Notify when someone comments on your posts</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="in_app_notifications.updates_and_announcements"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Updates and Announcements</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive important product updates and announcements</p>
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
                  Configure the frequency of summary notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notification_schedule.daily_summary"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Daily Summary</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive a daily summary of important updates</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notification_schedule.weekly_report"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Weekly Report</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive a weekly report of key metrics and activities</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notification_schedule.monthly_newsletter"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Monthly Newsletter</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive a monthly newsletter with product updates and tips</p>
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


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
import { useSecuritySettings } from '@/hooks/useSettingsData';
import Loading from '@/components/Loading';
import { Shield, Lock, UserCheck, Clock } from 'lucide-react';

const securitySchema = z.object({
  password_policy: z.object({
    min_length: z.number().min(6).max(20),
    require_uppercase: z.boolean(),
    require_lowercase: z.boolean(),
    require_numbers: z.boolean(),
    require_symbols: z.boolean(),
  }),
  session_settings: z.object({
    timeout_minutes: z.number().min(15).max(1440),
    remember_me_days: z.number().min(1).max(90),
  }),
  mfa_settings: z.object({
    enabled: z.boolean(),
    required_for_admins: z.boolean(),
    backup_codes: z.number().min(5).max(20),
  }),
  login_restrictions: z.object({
    max_attempts: z.number().min(3).max(10),
    lockout_minutes: z.number().min(5).max(60),
  }),
  audit_settings: z.object({
    log_all_actions: z.boolean(),
    retention_days: z.number().min(30).max(365),
  }),
});

type SecurityFormData = z.infer<typeof securitySchema>;

const SecurityPage = () => {
  const { data: settings, isLoading, update, isUpdating } = useSecuritySettings();

  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: false,
      },
      session_settings: {
        timeout_minutes: 480,
        remember_me_days: 30,
      },
      mfa_settings: {
        enabled: false,
        required_for_admins: false,
        backup_codes: 10,
      },
      login_restrictions: {
        max_attempts: 5,
        lockout_minutes: 15,
      },
      audit_settings: {
        log_all_actions: true,
        retention_days: 90,
      },
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        password_policy: settings.password_policy || form.getValues('password_policy'),
        session_settings: settings.session_settings || form.getValues('session_settings'),
        mfa_settings: settings.mfa_settings || form.getValues('mfa_settings'),
        login_restrictions: settings.login_restrictions || form.getValues('login_restrictions'),
        audit_settings: settings.audit_settings || form.getValues('audit_settings'),
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SecurityFormData) => {
    update(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Security Settings"
        description="Configure security policies and authentication settings"
      />

      <PageContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Policy
                </CardTitle>
                <CardDescription>
                  Set password requirements for all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="password_policy.min_length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Length</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password_policy.require_uppercase"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Require Uppercase</FormLabel>
                          <p className="text-sm text-muted-foreground">At least one uppercase letter</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password_policy.require_lowercase"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Require Lowercase</FormLabel>
                          <p className="text-sm text-muted-foreground">At least one lowercase letter</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password_policy.require_numbers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Require Numbers</FormLabel>
                          <p className="text-sm text-muted-foreground">At least one numeric digit</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password_policy.require_symbols"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Require Symbols</FormLabel>
                          <p className="text-sm text-muted-foreground">At least one special character</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Multi-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Multi-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Configure two-factor authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mfa_settings.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Enable MFA</FormLabel>
                        <p className="text-sm text-muted-foreground">Allow users to enable two-factor authentication</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mfa_settings.required_for_admins"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Required for Admins</FormLabel>
                        <p className="text-sm text-muted-foreground">Enforce MFA for administrator accounts</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mfa_settings.backup_codes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backup Codes</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Number of backup codes to generate</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Settings
                </CardTitle>
                <CardDescription>
                  Configure user session and timeout settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="session_settings.timeout_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Timeout (minutes)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="session_settings.remember_me_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remember Me Duration (days)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">How long to remember login</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Login Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Login Restrictions
                </CardTitle>
                <CardDescription>
                  Configure failed login attempt policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="login_restrictions.max_attempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Failed Attempts</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Before account lockout</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="login_restrictions.lockout_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lockout Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">How long to lock account</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audit Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Audit & Logging</CardTitle>
                <CardDescription>
                  Configure security audit and logging settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="audit_settings.log_all_actions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Log All Actions</FormLabel>
                        <p className="text-sm text-muted-foreground">Record all user actions for audit trails</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="audit_settings.retention_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Log Retention (days)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">How long to keep audit logs</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </PageContent>
    </PageLayout>
  );
};

export default SecurityPage;

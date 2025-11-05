import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOrganizationSettings } from '@/hooks/organization/useOrganizationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Lock, Key, FileText, Database } from 'lucide-react';

const SecurityTab = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useOrganizationSettings();

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_required: false,
    password_min_length: 8,
    session_timeout_minutes: 60,
  });

  const [complianceSettings, setComplianceSettings] = useState({
    gdpr_compliant: false,
    data_retention_days: 365,
    audit_logging_enabled: true,
    encryption_enabled: true,
  });

  useEffect(() => {
    if (settings?.security_settings) {
      setSecuritySettings({
        two_factor_required: settings.security_settings.two_factor_required || false,
        password_min_length: settings.security_settings.password_min_length || 8,
        session_timeout_minutes: settings.security_settings.session_timeout_minutes || 60,
      });
    }
    if (settings?.compliance_settings) {
      setComplianceSettings({
        gdpr_compliant: settings.compliance_settings.gdpr_compliant || false,
        data_retention_days: settings.compliance_settings.data_retention_days || 365,
        audit_logging_enabled: settings.compliance_settings.audit_logging_enabled || true,
        encryption_enabled: settings.compliance_settings.encryption_enabled || true,
      });
    }
  }, [settings]);

  const handleSecurityUpdate = async () => {
    await updateSettings({ security_settings: securitySettings });
  };

  const handleComplianceUpdate = async () => {
    await updateSettings({ compliance_settings: complianceSettings });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const securityScore = 85;

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Score
          </CardTitle>
          <CardDescription>
            Overall security health of your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{securityScore}%</span>
              <div className="text-right">
                <p className="text-sm font-medium">Good</p>
                <p className="text-xs text-muted-foreground">Above average</p>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-primary rounded-full transition-all duration-500"
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Access Control
          </CardTitle>
          <CardDescription>
            Configure authentication and access policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="2fa">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all admin users
              </p>
            </div>
            <Switch
              id="2fa"
              checked={securitySettings.two_factor_required}
              onCheckedChange={(checked) =>
                setSecuritySettings({ ...securitySettings, two_factor_required: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-length">Minimum Password Length</Label>
            <Input
              id="password-length"
              type="number"
              min={8}
              max={32}
              value={securitySettings.password_min_length}
              onChange={(e) =>
                setSecuritySettings({
                  ...securitySettings,
                  password_min_length: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              min={15}
              max={480}
              value={securitySettings.session_timeout_minutes}
              onChange={(e) =>
                setSecuritySettings({
                  ...securitySettings,
                  session_timeout_minutes: parseInt(e.target.value),
                })
              }
            />
          </div>

          <Button onClick={handleSecurityUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Compliance & Data Protection
          </CardTitle>
          <CardDescription>
            Manage compliance and data protection settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="gdpr">GDPR Compliant</Label>
              <p className="text-sm text-muted-foreground">
                Enable GDPR compliance features
              </p>
            </div>
            <Switch
              id="gdpr"
              checked={complianceSettings.gdpr_compliant}
              onCheckedChange={(checked) =>
                setComplianceSettings({ ...complianceSettings, gdpr_compliant: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="audit">Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Track all changes and activities
              </p>
            </div>
            <Switch
              id="audit"
              checked={complianceSettings.audit_logging_enabled}
              onCheckedChange={(checked) =>
                setComplianceSettings({ ...complianceSettings, audit_logging_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="encryption">Data Encryption</Label>
              <p className="text-sm text-muted-foreground">
                Encrypt sensitive data at rest
              </p>
            </div>
            <Switch
              id="encryption"
              checked={complianceSettings.encryption_enabled}
              onCheckedChange={(checked) =>
                setComplianceSettings({ ...complianceSettings, encryption_enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Data Retention Period (days)</Label>
            <Input
              id="retention"
              type="number"
              min={30}
              max={3650}
              value={complianceSettings.data_retention_days}
              onChange={(e) =>
                setComplianceSettings({
                  ...complianceSettings,
                  data_retention_days: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              How long to keep user data before automatic deletion
            </p>
          </div>

          <Button onClick={handleComplianceUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Compliance Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Users, MapPin, Globe, Phone, Mail, 
  Shield, Activity, TrendingUp, Calendar, Lock,
  Bell, Palette, Code, Database, CreditCard,
  CheckCircle2, AlertCircle, Info, Zap, Trophy,
  BarChart3, Settings2, Upload, Download, ChevronRight,
  Sparkles, Rocket, Target, Award
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// AI-powered insights mock data
const aiInsights = [
  {
    id: 1,
    title: "Security Score Improvement",
    description: "Enable 2FA to improve your security score by 25%",
    priority: "high",
    icon: Shield,
    color: "text-red-500"
  },
  {
    id: 2,
    title: "Team Productivity",
    description: "Your team is 40% more productive than industry average",
    priority: "medium",
    icon: TrendingUp,
    color: "text-green-500"
  },
  {
    id: 3,
    title: "Storage Optimization",
    description: "Clean up unused data to save 2.3GB of storage",
    priority: "low",
    icon: Database,
    color: "text-blue-500"
  }
];

const organizationMetrics = {
  healthScore: 85,
  complianceScore: 92,
  securityScore: 78,
  performanceScore: 88
};

export const EnhancedOrganizationPage: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form states
  const [orgData, setOrgData] = useState({
    name: currentTenant?.name || '',
    slug: currentTenant?.slug || '',
    industry: currentTenant?.type || '',
    size: '',
    description: '',
    email: currentTenant?.owner_email || '',
    phone: '',
    website: '',
    timezone: 'UTC',
    address: ''
  });

  // Advanced settings states
  const [advancedSettings, setAdvancedSettings] = useState({
    autoBackup: true,
    aiAnalytics: true,
    advancedSecurity: false,
    customBranding: true,
    apiAccess: false,
    dataExport: true,
    auditLogs: true,
    ssoEnabled: false
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Organization settings updated successfully', {
        description: 'Your changes have been saved and applied.'
      });
    } catch (error) {
      toast.error('Failed to save settings', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    trend?: number;
  }) => (
    <div className={cn(
      "p-4 rounded-xl border bg-gradient-to-br",
      "hover:shadow-lg transition-all duration-300 hover:scale-105",
      "relative overflow-hidden group"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Icon className={cn("h-5 w-5", color)} />
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend > 0 ? "text-green-500" : "text-red-500"
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}%</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
        <Progress value={value} className="mt-2 h-1" />
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Organization Management"
        description="Configure and optimize your organization settings with AI-powered insights"
        badge={{
          text: `${currentTenant?.subscription_plan || 'Enterprise'}`,
          variant: 'default'
        }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isSaving ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full bg-muted/30">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-background">
                  <Building2 className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-background">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="integrations" className="data-[state=active]:bg-background">
                  <Code className="h-4 w-4 mr-2" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-background">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Organization Health Dashboard */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Organization Health Dashboard
                    </CardTitle>
                    <CardDescription>
                      Real-time insights and AI-powered recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard
                        title="Health Score"
                        value={organizationMetrics.healthScore}
                        icon={Activity}
                        color="text-green-500"
                        trend={5}
                      />
                      <MetricCard
                        title="Compliance"
                        value={organizationMetrics.complianceScore}
                        icon={CheckCircle2}
                        color="text-blue-500"
                        trend={2}
                      />
                      <MetricCard
                        title="Security"
                        value={organizationMetrics.securityScore}
                        icon={Shield}
                        color="text-orange-500"
                        trend={-3}
                      />
                      <MetricCard
                        title="Performance"
                        value={organizationMetrics.performanceScore}
                        icon={Zap}
                        color="text-purple-500"
                        trend={8}
                      />
                    </div>

                    {/* AI Insights */}
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI-Powered Insights
                      </h4>
                      {aiInsights.map((insight) => (
                        <div
                          key={insight.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <insight.icon className={cn("h-5 w-5 mt-0.5", insight.color)} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{insight.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">1,247</p>
                          <p className="text-sm text-muted-foreground">Active Farmers</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">12%</span>
                        <span className="text-muted-foreground ml-1">from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">89%</p>
                          <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        </div>
                        <Target className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">5%</span>
                        <span className="text-muted-foreground ml-1">improvement</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">₹2.4M</p>
                          <p className="text-sm text-muted-foreground">Revenue Impact</p>
                        </div>
                        <Trophy className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">23%</span>
                        <span className="text-muted-foreground ml-1">year-over-year</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organization Information
                    </CardTitle>
                    <CardDescription>
                      Manage your organization's profile and public information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Logo Upload Section */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-2xl font-bold">
                          {orgData.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 400x400px, max 2MB
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name *</Label>
                        <Input
                          id="orgName"
                          value={orgData.name}
                          onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                          placeholder="Enter organization name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgSlug">URL Slug *</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                            app.lovable.dev/
                          </span>
                          <Input
                            id="orgSlug"
                            value={orgData.slug}
                            onChange={(e) => setOrgData({...orgData, slug: e.target.value})}
                            className="rounded-l-none"
                            placeholder="organization-slug"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <select 
                          id="industry"
                          value={orgData.industry}
                          onChange={(e) => setOrgData({...orgData, industry: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="">Select Industry</option>
                          <option value="agriculture">Agriculture</option>
                          <option value="ngo">NGO</option>
                          <option value="university">University</option>
                          <option value="cooperative">Cooperative</option>
                          <option value="government">Government</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Organization Size</Label>
                        <select 
                          id="size"
                          value={orgData.size}
                          onChange={(e) => setOrgData({...orgData, size: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="">Select Size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={orgData.description}
                        onChange={(e) => setOrgData({...orgData, description: e.target.value})}
                        rows={4}
                        placeholder="Brief description of your organization's mission and activities"
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {orgData.description.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Primary Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={orgData.email}
                          onChange={(e) => setOrgData({...orgData, email: e.target.value})}
                          placeholder="contact@organization.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={orgData.phone}
                          onChange={(e) => setOrgData({...orgData, phone: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={orgData.website}
                          onChange={(e) => setOrgData({...orgData, website: e.target.value})}
                          placeholder="https://organization.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select 
                          id="timezone"
                          value={orgData.timezone}
                          onChange={(e) => setOrgData({...orgData, timezone: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="UTC">UTC</option>
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Textarea
                        id="address"
                        value={orgData.address}
                        onChange={(e) => setOrgData({...orgData, address: e.target.value})}
                        rows={3}
                        placeholder="Full organization address"
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-500" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage security policies and access controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <p className="font-medium">Two-Factor Authentication (2FA)</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Require 2FA for all admin users
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <p className="font-medium">IP Whitelisting</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Restrict access to specific IP addresses
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <p className="font-medium">Session Management</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Auto-logout after 30 minutes of inactivity
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <p className="font-medium">Data Encryption</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            End-to-end encryption for sensitive data
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Password Policy</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Minimum 12 characters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Require uppercase and lowercase letters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Require numbers and special characters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Password expiry every 90 days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Integrations</CardTitle>
                    <CardDescription>
                      Manage third-party services and API connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'WhatsApp Business', status: 'connected', icon: '💬' },
                        { name: 'Google Analytics', status: 'connected', icon: '📊' },
                        { name: 'Salesforce CRM', status: 'disconnected', icon: '☁️' },
                        { name: 'Slack', status: 'connected', icon: '💼' },
                        { name: 'Microsoft Teams', status: 'disconnected', icon: '👥' },
                        { name: 'Zapier', status: 'connected', icon: '⚡' }
                      ].map((integration) => (
                        <div
                          key={integration.name}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{integration.icon}</span>
                            <div>
                              <p className="font-medium">{integration.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {integration.status === 'connected' ? 'Active' : 'Not connected'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={integration.status === 'connected' ? 'outline' : 'default'}
                            size="sm"
                          >
                            {integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Configure advanced features and experimental options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(advancedSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {key === 'autoBackup' && 'Automatic daily backups of your data'}
                            {key === 'aiAnalytics' && 'AI-powered insights and recommendations'}
                            {key === 'advancedSecurity' && 'Enhanced security features and monitoring'}
                            {key === 'customBranding' && 'Custom branding for all touchpoints'}
                            {key === 'apiAccess' && 'Full API access for integrations'}
                            {key === 'dataExport' && 'Export data in multiple formats'}
                            {key === 'auditLogs' && 'Detailed audit logging for compliance'}
                            {key === 'ssoEnabled' && 'Single Sign-On for enterprise users'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setAdvancedSettings({ ...advancedSettings, [key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Status Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Organization Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plan</span>
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80">
                      {currentTenant?.subscription_plan || 'Enterprise'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      <span className="mr-1">●</span> Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Users</span>
                    <span className="text-sm font-medium">47 / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm font-medium">23.4 GB / 100 GB</span>
                  </div>
                </div>
                
                <Progress value={23.4} className="h-2" />
                
                <Button className="w-full" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { action: 'Settings updated', time: '2 hours ago', icon: Settings2 },
                      { action: 'New user invited', time: '5 hours ago', icon: Users },
                      { action: 'API key generated', time: '1 day ago', icon: Code },
                      { action: 'Backup completed', time: '2 days ago', icon: Database },
                      { action: 'Security scan passed', time: '3 days ago', icon: Shield }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <activity.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Audit Logs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reset Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default EnhancedOrganizationPage;
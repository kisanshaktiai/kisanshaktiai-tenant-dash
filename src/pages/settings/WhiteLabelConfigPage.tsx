import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWhiteLabelSettings } from '@/hooks/useWhiteLabelSettings';
import { 
  Palette, Globe, Mail, Smartphone, Layers, Settings2, 
  FileText, Share2, Save, Upload, Download, Check, 
  HelpCircle, Globe2, Shield, Activity, RefreshCw, Eye
} from 'lucide-react';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { BrandingUploader } from '@/components/settings/BrandingUploader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { EnhancedMobileThemePanel } from '@/components/settings/EnhancedMobileThemePanel';

const WhiteLabelConfigPage = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useWhiteLabelSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('branding');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Local state for all configuration
  const [localConfig, setLocalConfig] = useState({
    // Brand Identity
    app_name: '',
    tag_line: '',
    company_name: '',
    app_logo_url: '',
    app_icon_url: '',
    app_splash_screen_url: '',
    
    // Colors
    primary_color: '#10b981',
    secondary_color: '#8b5cf6',
    accent_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    error_color: '#ef4444',
    info_color: '#3b82f6',
    
    // Mobile Theme (stored in mobile_theme column in DB)
    mobile_theme: {
      primary_color: '142 76% 36%',
      secondary_color: '155 76% 36%',
      accent_color: '220 14% 46%',
      background_color: '0 0% 100%',
      surface_color: '0 0% 100%',
      text_color: '224 71% 4%',
      border_color: '0 0% 94%',
      success_color: '142 76% 36%',
      warning_color: '45 93% 47%',
      error_color: '0 84% 60%',
      info_color: '199 89% 48%',
      primary_variant: '142 76% 30%',
      secondary_variant: '155 76% 30%',
      tertiary_color: '280 50% 50%',
      on_surface_color: '224 71% 4%'
    },
    
    // Domain Configuration
    custom_domain: '',
    subdomain: '',
    enable_ssl: true,
    
    // Mobile Configuration
    bundle_identifier: '',
    app_version: '1.0.0',
    build_number: '1',
    min_ios_version: 'iOS 13.0',
    min_android_version: 'Android 8.0 (API 26)',
    supported_languages: 'en, hi, mr, gu, ta, te',
    
    // PWA Settings
    pwa_enabled: true,
    pwa_name: '',
    pwa_short_name: '',
    pwa_display_mode: 'standalone',
    pwa_orientation: 'portrait',
    offline_support: true,
    install_prompt_text: 'Install our app for a better experience!',
    cache_strategy: 'network-first',
    
    // Content Management
    help_center_url: '',
    documentation_url: '',
    getting_started_guide: '',
    
    // Email Templates
    email_templates: {
      welcome: { enabled: true, category: 'onboarding' },
      notification: { enabled: true, category: 'notifications' },
      invoice: { enabled: true, category: 'billing' },
      password_reset: { enabled: true, category: 'authentication' }
    },
    
    // Advanced Settings
    custom_css: '',
    enable_custom_css: false,
    font_family: 'Inter',
    animations_enabled: true,
    
    // Distribution
    enable_pwa: true,
    enable_private_store: false,
    deep_links_enabled: true,
    auto_updates_enabled: true,
    download_manifest_url: ''
  });

  // Initialize local config from settings - only run when settings change
  useEffect(() => {
    if (settings) {
      // Handle mobile_theme - check if it has nested structure from DB
      let processedMobileTheme = localConfig.mobile_theme;
      
      if (settings.mobile_theme) {
        const mobileThemeData = settings.mobile_theme as any;
        
        // Check if it's already in the nested Modern2025Theme format
        if (mobileThemeData.core && mobileThemeData.neutral && 
            mobileThemeData.status && mobileThemeData.support) {
          // Use the nested structure directly, preserving all properties
          processedMobileTheme = mobileThemeData;
        } else if (mobileThemeData.primary_color || mobileThemeData.secondary_color) {
          // It's in flat format, use the flat properties
          processedMobileTheme = {
            primary_color: mobileThemeData.primary_color || localConfig.mobile_theme.primary_color,
            secondary_color: mobileThemeData.secondary_color || localConfig.mobile_theme.secondary_color,
            accent_color: mobileThemeData.accent_color || localConfig.mobile_theme.accent_color,
            background_color: mobileThemeData.background_color || localConfig.mobile_theme.background_color,
            surface_color: mobileThemeData.surface_color || localConfig.mobile_theme.surface_color,
            text_color: mobileThemeData.text_color || localConfig.mobile_theme.text_color,
            border_color: mobileThemeData.border_color || localConfig.mobile_theme.border_color,
            success_color: mobileThemeData.success_color || localConfig.mobile_theme.success_color,
            warning_color: mobileThemeData.warning_color || localConfig.mobile_theme.warning_color,
            error_color: mobileThemeData.error_color || localConfig.mobile_theme.error_color,
            info_color: mobileThemeData.info_color || localConfig.mobile_theme.info_color,
            primary_variant: mobileThemeData.primary_variant || localConfig.mobile_theme.primary_variant,
            secondary_variant: mobileThemeData.secondary_variant || localConfig.mobile_theme.secondary_variant,
            tertiary_color: mobileThemeData.tertiary_color || localConfig.mobile_theme.tertiary_color,
            on_surface_color: mobileThemeData.on_surface_color || localConfig.mobile_theme.on_surface_color,
            // Include nested structure if present
            ...mobileThemeData
          };
        }
      }
      
      setLocalConfig(prev => ({
        ...prev,
        app_name: settings.app_name || prev.app_name,
        app_logo_url: settings.app_logo_url || prev.app_logo_url,
        app_icon_url: settings.app_icon_url || prev.app_icon_url,
        app_splash_screen_url: settings.app_splash_screen_url || prev.app_splash_screen_url,
        primary_color: settings.primary_color || prev.primary_color,
        secondary_color: settings.secondary_color || prev.secondary_color,
        accent_color: settings.accent_color || prev.accent_color,
        background_color: settings.background_color || prev.background_color,
        text_color: settings.text_color || prev.text_color,
        success_color: settings.success_color || prev.success_color,
        warning_color: settings.warning_color || prev.warning_color,
        error_color: settings.error_color || prev.error_color,
        info_color: settings.info_color || prev.info_color,
        bundle_identifier: settings.bundle_identifier || prev.bundle_identifier,
        mobile_theme: processedMobileTheme,
        // Spread other config properties
        ...(settings.pwa_config || {}),
        ...(settings.mobile_ui_config || {})
      }));
    }
  }, [settings]); // Remove isLoading to prevent re-render loop

  const handleFieldChange = (field: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        app_name: localConfig.app_name,
        app_logo_url: localConfig.app_logo_url,
        app_icon_url: localConfig.app_icon_url,
        app_splash_screen_url: localConfig.app_splash_screen_url,
        primary_color: localConfig.primary_color,
        secondary_color: localConfig.secondary_color,
        accent_color: localConfig.accent_color,
        background_color: localConfig.background_color,
        text_color: localConfig.text_color,
        success_color: localConfig.success_color,
        warning_color: localConfig.warning_color,
        error_color: localConfig.error_color,
        info_color: localConfig.info_color,
        bundle_identifier: localConfig.bundle_identifier,
        android_package_name: localConfig.bundle_identifier,
        pwa_config: {
          pwa_enabled: localConfig.pwa_enabled,
          pwa_name: localConfig.pwa_name,
          pwa_short_name: localConfig.pwa_short_name,
          pwa_display_mode: localConfig.pwa_display_mode,
          pwa_orientation: localConfig.pwa_orientation,
          offline_support: localConfig.offline_support,
          install_prompt_text: localConfig.install_prompt_text,
          cache_strategy: localConfig.cache_strategy,
        },
        mobile_ui_config: {
          animations_enabled: localConfig.animations_enabled,
        },
        // Store mobile theme in the database
        mobile_theme: localConfig.mobile_theme
      });
      
      setHasUnsavedChanges(false);
      toast({
        title: "Configuration saved",
        description: "Your white label settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(localConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'white-label-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setLocalConfig(prev => ({ ...prev, ...imported }));
          setHasUnsavedChanges(true);
          toast({
            title: "Configuration imported",
            description: "Settings have been imported successfully.",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid configuration file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full max-w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">White Label Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Customize your application's branding, appearance, and distribution settings
          </p>
        </div>

        {hasUnsavedChanges && (
          <Alert className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>You have unsaved changes</span>
              <Button onClick={handleSave} disabled={isUpdating} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-8">
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden lg:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="domain" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden lg:inline">Domain</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden lg:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span className="hidden lg:inline">Mobile</span>
              </TabsTrigger>
              <TabsTrigger value="pwa" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden lg:inline">PWA</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                <span className="hidden lg:inline">Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden lg:inline">Distribution</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
                <CardDescription>Configure your brand colors, logo, and visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Logo</Label>
                  <BrandingUploader
                    logoUrl={localConfig.app_logo_url}
                    onLogoChange={(url) => handleFieldChange('app_logo_url', url)}
                  />
                  <p className="text-sm text-muted-foreground">PNG, JPG or SVG up to 2MB</p>
                </div>

                {/* App Name and Tag Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">App Name</Label>
                    <Input
                      id="app-name"
                      value={localConfig.app_name}
                      onChange={(e) => handleFieldChange('app_name', e.target.value)}
                      placeholder="KisanShakti Ai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag-line">Tag Line</Label>
                    <Input
                      id="tag-line"
                      value={localConfig.tag_line}
                      onChange={(e) => handleFieldChange('tag_line', e.target.value)}
                      placeholder="An Intelligent Ai GURU for Farmer"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> These brand colors serve as the default theme for your application. 
                    The mobile theme section allows you to override these colors specifically for mobile app experiences.
                  </AlertDescription>
                </Alert>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        label=""
                        value={localConfig.primary_color}
                        onChange={(color) => handleFieldChange('primary_color', color)}
                      />
                      <Input
                        value={localConfig.primary_color}
                        onChange={(e) => handleFieldChange('primary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        label=""
                        value={localConfig.secondary_color}
                        onChange={(color) => handleFieldChange('secondary_color', color)}
                      />
                      <Input
                        value={localConfig.secondary_color}
                        onChange={(e) => handleFieldChange('secondary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        label=""
                        value={localConfig.accent_color}
                        onChange={(color) => handleFieldChange('accent_color', color)}
                      />
                      <Input
                        value={localConfig.accent_color}
                        onChange={(e) => handleFieldChange('accent_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Name and Font */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={localConfig.company_name}
                      onChange={(e) => handleFieldChange('company_name', e.target.value)}
                      placeholder="KisanShakti Ai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select value={localConfig.font_family} onValueChange={(v) => handleFieldChange('font_family', v)}>
                      <SelectTrigger id="font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domain Tab */}
          <TabsContent value="domain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain Configuration</CardTitle>
                <CardDescription>Set up custom domain and subdomain settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <div className="relative">
                    <Input
                      id="custom-domain"
                      value={localConfig.custom_domain}
                      onChange={(e) => handleFieldChange('custom_domain', e.target.value)}
                      placeholder="app.kisanshaktiai.in"
                    />
                    {localConfig.custom_domain && (
                      <Badge className="absolute right-2 top-2" variant="outline">
                        <Check className="w-3 h-3 mr-1" />
                        Domain is available
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={localConfig.subdomain}
                    onChange={(e) => handleFieldChange('subdomain', e.target.value)}
                    placeholder="kisanshaktiai.in"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-ssl">Enable SSL/HTTPS</Label>
                    <p className="text-sm text-muted-foreground">Secure your domain with SSL certificate</p>
                  </div>
                  <Switch
                    id="enable-ssl"
                    checked={localConfig.enable_ssl}
                    onCheckedChange={(checked) => handleFieldChange('enable_ssl', checked)}
                  />
                </div>

                <Separator />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe2 className="w-5 h-5" />
                      Domain Health Monitoring
                    </CardTitle>
                    <CardDescription>Monitor the health and performance of your custom domains</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">SSL Status</span>
                      </div>
                      <Badge variant="secondary">pending</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">DNS Status</span>
                      </div>
                      <Badge variant="secondary">pending</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Performance</span>
                      </div>
                      <span className="text-2xl font-bold text-destructive">0/100</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Uptime</span>
                      </div>
                      <span className="text-2xl font-bold text-destructive">0.0%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Required DNS Records</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-4">
                      <Badge variant="outline">A</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Point to: 185.158.133.1</p>
                        <p className="text-xs text-muted-foreground">Main domain record</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="outline">CNAME</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">www → app.kisanshaktiai.in</p>
                        <p className="text-xs text-muted-foreground">Redirect www subdomain</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Customize email templates with your branding and content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(localConfig.email_templates).map(([key, template]) => (
                  <Card key={key}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium capitalize">{key.replace('_', ' ')} Email</h4>
                          <p className="text-sm text-muted-foreground">
                            {key === 'welcome' && 'Welcome to {{app_name}}!'}
                            {key === 'notification' && 'New notification from {{app_name}}'}
                            {key === 'invoice' && 'Invoice #{{invoice_number}} from {{company_name}}'}
                            {key === 'password_reset' && 'Reset your {{app_name}} password'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="secondary" size="sm">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <EnhancedMobileThemePanel
              config={localConfig}
              updateConfig={(section, field, value) => {
                if (section === 'mobile_theme') {
                  setLocalConfig(prev => ({
                    ...prev,
                    mobile_theme: value
                  }));
                } else {
                  setLocalConfig(prev => ({
                    ...prev,
                    [field]: value
                  }));
                }
                setHasUnsavedChanges(true);
              }}
              
              appName={localConfig.app_name}
              logoUrl={localConfig.app_logo_url}
            />

            <Card>
              <CardHeader>
                <CardTitle>Advanced App Customization</CardTitle>
                <CardDescription>Deep customization of app behavior, UI, and user experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bundle-id">Bundle ID</Label>
                    <Input
                      id="bundle-id"
                      value={localConfig.bundle_identifier}
                      onChange={(e) => handleFieldChange('bundle_identifier', e.target.value)}
                      placeholder="com.yourcompany.kisanshakti"
                    />
                    <p className="text-xs text-muted-foreground">Unique identifier for your app. Cannot be changed after publishing.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-version">App Version</Label>
                    <Input
                      id="app-version"
                      value={localConfig.app_version}
                      onChange={(e) => handleFieldChange('app_version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="build-number">Build Number</Label>
                    <Input
                      id="build-number"
                      value={localConfig.build_number}
                      onChange={(e) => handleFieldChange('build_number', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-ios">Minimum iOS Version</Label>
                    <Input
                      id="min-ios"
                      value={localConfig.min_ios_version}
                      onChange={(e) => handleFieldChange('min_ios_version', e.target.value)}
                      placeholder="iOS 13.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-android">Minimum Android Version</Label>
                  <Select value={localConfig.min_android_version} onValueChange={(v) => handleFieldChange('min_android_version', v)}>
                    <SelectTrigger id="min-android">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Android 8.0 (API 26)">Android 8.0 (API 26)</SelectItem>
                      <SelectItem value="Android 9.0 (API 28)">Android 9.0 (API 28)</SelectItem>
                      <SelectItem value="Android 10.0 (API 29)">Android 10.0 (API 29)</SelectItem>
                      <SelectItem value="Android 11.0 (API 30)">Android 11.0 (API 30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages">Supported Languages (comma-separated)</Label>
                  <Input
                    id="languages"
                    value={localConfig.supported_languages}
                    onChange={(e) => handleFieldChange('supported_languages', e.target.value)}
                    placeholder="en, hi, mr, gu, ta, te"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PWA Tab */}
          <TabsContent value="pwa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressive Web App Settings</CardTitle>
                <CardDescription>Configure PWA manifest and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pwa-name">App Name</Label>
                    <Input
                      id="pwa-name"
                      value={localConfig.pwa_name}
                      onChange={(e) => handleFieldChange('pwa_name', e.target.value)}
                      placeholder="KisanShakti AI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pwa-short-name">Short Name</Label>
                    <Input
                      id="pwa-short-name"
                      value={localConfig.pwa_short_name}
                      onChange={(e) => handleFieldChange('pwa_short_name', e.target.value)}
                      placeholder="KS AI"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="display-mode">Display Mode</Label>
                    <Select value={localConfig.pwa_display_mode} onValueChange={(v) => handleFieldChange('pwa_display_mode', v)}>
                      <SelectTrigger id="display-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standalone">Standalone</SelectItem>
                        <SelectItem value="fullscreen">Fullscreen</SelectItem>
                        <SelectItem value="minimal-ui">Minimal UI</SelectItem>
                        <SelectItem value="browser">Browser</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select value={localConfig.pwa_orientation} onValueChange={(v) => handleFieldChange('pwa_orientation', v)}>
                      <SelectTrigger id="orientation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CSS Injection</CardTitle>
                <CardDescription>Add custom CSS to override default styles. Use with caution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-css">Enable Custom CSS Injection</Label>
                  <Switch
                    id="enable-css"
                    checked={localConfig.enable_custom_css}
                    onCheckedChange={(checked) => handleFieldChange('enable_custom_css', checked)}
                  />
                </div>
                {localConfig.enable_custom_css && (
                  <div className="space-y-2">
                    <Textarea
                      value={localConfig.custom_css}
                      onChange={(e) => handleFieldChange('custom_css', e.target.value)}
                      placeholder="/* Your custom CSS here */"
                      className="font-mono text-sm min-h-[200px]"
                    />
                    <Button variant="outline" size="sm">Advanced Editor</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Customize help documentation, legal content, and in-app messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="help-url">
                      <HelpCircle className="w-4 h-4 inline mr-2" />
                      Custom Help Center URL
                    </Label>
                    <Input
                      id="help-url"
                      value={localConfig.help_center_url}
                      onChange={(e) => handleFieldChange('help_center_url', e.target.value)}
                      placeholder="https://help.yourcompany.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="docs-url">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Documentation URL
                    </Label>
                    <Input
                      id="docs-url"
                      value={localConfig.documentation_url}
                      onChange={(e) => handleFieldChange('documentation_url', e.target.value)}
                      placeholder="https://docs.yourcompany.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="getting-started">Getting Started Guide</Label>
                  <Textarea
                    id="getting-started"
                    value={localConfig.getting_started_guide}
                    onChange={(e) => handleFieldChange('getting_started_guide', e.target.value)}
                    placeholder="Write a custom getting started guide for your users..."
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Options</CardTitle>
                <CardDescription>Configure app distribution, updates, and deployment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable-pwa-dist">Enable Progressive Web App</Label>
                      <p className="text-sm text-muted-foreground">Recommended</p>
                    </div>
                    <Switch
                      id="enable-pwa-dist"
                      checked={localConfig.enable_pwa}
                      onCheckedChange={(checked) => handleFieldChange('enable_pwa', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="install-prompt">Custom Install Prompt Text</Label>
                    <Input
                      id="install-prompt"
                      value={localConfig.install_prompt_text}
                      onChange={(e) => handleFieldChange('install_prompt_text', e.target.value)}
                      placeholder="Install our app for a better experience!"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="offline-support">Enable Offline Support</Label>
                    </div>
                    <Switch
                      id="offline-support"
                      checked={localConfig.offline_support}
                      onCheckedChange={(checked) => handleFieldChange('offline_support', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cache-strategy">Cache Strategy</Label>
                    <Select value={localConfig.cache_strategy} onValueChange={(v) => handleFieldChange('cache_strategy', v)}>
                      <SelectTrigger id="cache-strategy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="network-first">Network First</SelectItem>
                        <SelectItem value="cache-first">Cache First</SelectItem>
                        <SelectItem value="network-only">Network Only</SelectItem>
                        <SelectItem value="cache-only">Cache Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Manifest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Config
                </span>
              </Button>
            </label>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isUpdating || !hasUnsavedChanges}
            className="min-w-[120px]"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default WhiteLabelConfigPage;
import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWhiteLabelSettingsOptimized } from '@/hooks/useWhiteLabelSettingsOptimized';
import { 
  Palette, Globe, Mail, Smartphone, Layers, Settings2, 
  FileText, Share2, Save, Upload, Download, Check, 
  HelpCircle, Globe2, Shield, Activity, RefreshCw, Eye, Loader2
} from 'lucide-react';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { BrandingUploader } from '@/components/settings/BrandingUploader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { EnhancedMobileThemePanel } from '@/components/settings/EnhancedMobileThemePanel';

// Default configuration to prevent undefined errors
const getDefaultConfig = () => ({
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
  
  // Mobile Theme
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
    on_surface_color: '224 71% 4%',
    disabled_color: '0 0% 60%',
    overlay_color: '0 0% 0%'
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

const WhiteLabelConfigPageOptimized = () => {
  const { settings, isLoading, updateSettings, isUpdating, cleanup } = useWhiteLabelSettingsOptimized();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('branding');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Initialize with default config
  const [localConfig, setLocalConfig] = useState(getDefaultConfig());
  
  // Flag to track if initial load is complete
  const [isInitialized, setIsInitialized] = useState(false);

  // Merge settings with defaults when they arrive
  useEffect(() => {
    if (settings && !isInitialized) {
      const mergedConfig = {
        ...getDefaultConfig(),
        ...settings,
        // Deep merge mobile_theme
        mobile_theme: {
          ...getDefaultConfig().mobile_theme,
          ...(settings.mobile_theme || {})
        },
        // Deep merge pwa_config
        ...(settings.pwa_config || {}),
        // Deep merge mobile_ui_config
        ...(settings.mobile_ui_config || {})
      };
      
      setLocalConfig(mergedConfig);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleFieldChange = (field: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Prepare the update payload matching the database structure
      const updatePayload = {
        // Brand Identity
        app_name: localConfig.app_name,
        app_logo_url: localConfig.app_logo_url,
        app_icon_url: localConfig.app_icon_url,
        app_splash_screen_url: localConfig.app_splash_screen_url,
        
        // Core Colors - these are stored at root level for backward compatibility
        primary_color: localConfig.primary_color,
        secondary_color: localConfig.secondary_color,
        accent_color: localConfig.accent_color,
        background_color: localConfig.background_color,
        text_color: localConfig.text_color,
        success_color: localConfig.success_color,
        warning_color: localConfig.warning_color,
        error_color: localConfig.error_color,
        info_color: localConfig.info_color,
        
        // Mobile App Settings
        bundle_identifier: localConfig.bundle_identifier,
        android_package_name: localConfig.bundle_identifier,
        
        // PWA Configuration
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
        
        // Mobile UI Configuration
        mobile_ui_config: {
          animations_enabled: localConfig.animations_enabled,
        },
        
        // Mobile Theme - this is the complete theme object
        mobile_theme: localConfig.mobile_theme
      };
      
      console.log('Saving white label config with mobile_theme:', updatePayload.mobile_theme);
      
      await updateSettings(updatePayload);
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save error:', error);
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

  // Update config handler for mobile theme
  const updateMobileThemeConfig = (section: string, field: string, value: any) => {
    if (section === 'mobile_theme') {
      setLocalConfig(prev => ({
        ...prev,
        mobile_theme: value
      }));
      setHasUnsavedChanges(true);
    } else {
      handleFieldChange(field || section, value);
    }
  };

  // Loading skeleton
  if (isLoading && !isInitialized) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading white label configuration...</span>
          </div>
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
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Tab with Enhanced Theme Panel */}
          <TabsContent value="mobile" className="space-y-6">
            <EnhancedMobileThemePanel
              config={localConfig}
              updateConfig={updateMobileThemeConfig}
              appName={localConfig.app_name}
              logoUrl={localConfig.app_logo_url}
            />
          </TabsContent>

          {/* PWA Settings Tab */}
          <TabsContent value="pwa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressive Web App Configuration</CardTitle>
                <CardDescription>Configure PWA settings for installable web experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pwa-enabled">Enable PWA</Label>
                    <p className="text-sm text-muted-foreground">Allow users to install the app from browser</p>
                  </div>
                  <Switch
                    id="pwa-enabled"
                    checked={localConfig.pwa_enabled}
                    onCheckedChange={(checked) => handleFieldChange('pwa_enabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pwa-name">PWA Name</Label>
                    <Input
                      id="pwa-name"
                      value={localConfig.pwa_name}
                      onChange={(e) => handleFieldChange('pwa_name', e.target.value)}
                      placeholder="Full app name for PWA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pwa-short-name">PWA Short Name</Label>
                    <Input
                      id="pwa-short-name"
                      value={localConfig.pwa_short_name}
                      onChange={(e) => handleFieldChange('pwa_short_name', e.target.value)}
                      placeholder="Short name (max 12 chars)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="display-mode">Display Mode</Label>
                    <Select 
                      value={localConfig.pwa_display_mode}
                      onValueChange={(value) => handleFieldChange('pwa_display_mode', value)}
                    >
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
                    <Select 
                      value={localConfig.pwa_orientation}
                      onValueChange={(value) => handleFieldChange('pwa_orientation', value)}
                    >
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offline-support">Offline Support</Label>
                    <p className="text-sm text-muted-foreground">Enable offline functionality with service workers</p>
                  </div>
                  <Switch
                    id="offline-support"
                    checked={localConfig.offline_support}
                    onCheckedChange={(checked) => handleFieldChange('offline_support', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs can be added similarly... */}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <label htmlFor="import-config">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Config
                </span>
              </Button>
            </label>
            <input
              id="import-config"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isUpdating || !hasUnsavedChanges}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default WhiteLabelConfigPageOptimized;

import React, { useState, useEffect } from 'react';
import { useWhiteLabelSettings } from '@/hooks/useWhiteLabelSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandingUploader } from '@/components/settings/BrandingUploader';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { LivePreview } from '@/components/settings/LivePreview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Palette, 
  Smartphone, 
  Layout, 
  Code, 
  Globe, 
  Settings,
  Monitor,
  Tablet,
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
  Shield,
  Bell,
  Mail,
  Languages,
  Brush,
  CheckCircle
} from 'lucide-react';
import { AppearanceSettings } from '@/services/AppearanceSettingsService';
import { ThemePresets, ThemePreset, themePresets } from '@/components/settings/ThemePresets';
import { WhiteLabelConfig } from '@/services/WhiteLabelService';

export default function WhiteLabelConfigPage() {
  const { settings, updateSettings, isUpdating } = useWhiteLabelSettings();
  const [localSettings, setLocalSettings] = useState<Partial<WhiteLabelConfig>>(settings || {});
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [appliedThemeId, setAppliedThemeId] = useState<string>('');

  useEffect(() => {
    if (settings && Object.keys(localSettings).length === 0) {
      setLocalSettings(settings);
    }
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectTheme = (preset: ThemePreset) => {
    setSelectedThemeId(preset.id);
    setLocalSettings(prev => ({
      ...prev,
      ...preset.colors,
      font_family: preset.styles.font_family,
      button_style: preset.styles.button_style,
      input_style: preset.styles.input_style,
      card_style: preset.styles.card_style,
      navigation_style: preset.styles.navigation_style,
      animations_enabled: preset.styles.animations_enabled
    }));
    
    setAppliedThemeId(preset.id);
    
    toast({
      title: "Theme applied",
      description: `${preset.name} theme has been applied. Click "Save to Database" to persist changes.`,
    });
  };

  const handleSave = async () => {
    if (!localSettings) return;
    
    try {
      await updateSettings(localSettings);
      toast({
        title: "Settings saved successfully",
        description: "Your white label configuration has been updated and saved to the database.",
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "An error occurred while saving",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
      toast({
        title: "Settings reset",
        description: "Changes have been discarded.",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'white-label-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Configuration exported",
      description: "Your settings have been exported to a JSON file.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setLocalSettings({ ...localSettings, ...imported });
        toast({
          title: "Configuration imported",
          description: "Settings have been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid configuration file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!settings && !localSettings) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-6">
        {/* Action Bar */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              >
                {isPreviewVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Select value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      Tablet
                    </div>
                  </SelectItem>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Desktop
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isUpdating} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save to Database'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={cn(
          "grid gap-6",
          isPreviewVisible ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {/* Configuration Panel */}
          <div className={cn(
            "space-y-6",
            isPreviewVisible ? "lg:col-span-2" : "col-span-1"
          )}>
            <Tabs defaultValue="themes" className="w-full">
              <TabsList className="grid grid-cols-8 w-full">
                <TabsTrigger value="themes">
                  <Brush className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="branding">
                  <Wand2 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Sparkles className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="communication">
                  <Bell className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Code className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="themes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Theme Presets</span>
                      {appliedThemeId && (
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Theme Applied
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Select a ready-made theme to quickly customize your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <ThemePresets
                        selectedTheme={selectedThemeId}
                        onSelectTheme={handleSelectTheme}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>App Branding</CardTitle>
                    <CardDescription>Configure your app's identity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>App Name</Label>
                      <Input
                        value={localSettings.app_name || ''}
                        onChange={(e) => setLocalSettings({...localSettings, app_name: e.target.value})}
                        placeholder="Your App Name"
                      />
                    </div>
                    
                    <div>
                      <Label>App Logo</Label>
                      <BrandingUploader
                        logoUrl={localSettings.app_logo_url}
                        onLogoChange={(url) => setLocalSettings({...localSettings, app_logo_url: url})}
                      />
                    </div>
                    
                    <div>
                      <Label>App Icon</Label>
                      <BrandingUploader
                        logoUrl={localSettings.app_icon_url}
                        onLogoChange={(url) => setLocalSettings({...localSettings, app_icon_url: url})}
                      />
                    </div>
                    
                    <div>
                      <Label>Splash Screen</Label>
                      <BrandingUploader
                        logoUrl={localSettings.app_splash_screen_url}
                        onLogoChange={(url) => setLocalSettings({...localSettings, app_splash_screen_url: url})}
                      />
                    </div>
                    
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>Define your brand colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Primary Color"
                        value={localSettings.primary_color || '#10b981'}
                        onChange={(color) => setLocalSettings({...localSettings, primary_color: color})}
                      />
                      <ColorPicker
                        label="Secondary Color"
                        value={localSettings.secondary_color || '#059669'}
                        onChange={(color) => setLocalSettings({...localSettings, secondary_color: color})}
                      />
                      <ColorPicker
                        label="Accent Color"
                        value={localSettings.accent_color || '#14b8a6'}
                        onChange={(color) => setLocalSettings({...localSettings, accent_color: color})}
                      />
                      <ColorPicker
                        label="Background Color"
                        value={localSettings.background_color || '#ffffff'}
                        onChange={(color) => setLocalSettings({...localSettings, background_color: color})}
                      />
                      <ColorPicker
                        label="Success Color"
                        value={localSettings.success_color || '#10b981'}
                        onChange={(color) => setLocalSettings({...localSettings, success_color: color})}
                      />
                      <ColorPicker
                        label="Warning Color"
                        value={localSettings.warning_color || '#f59e0b'}
                        onChange={(color) => setLocalSettings({...localSettings, warning_color: color})}
                      />
                      <ColorPicker
                        label="Error Color"
                        value={localSettings.error_color || '#ef4444'}
                        onChange={(color) => setLocalSettings({...localSettings, error_color: color})}
                      />
                      <ColorPicker
                        label="Info Color"
                        value={localSettings.info_color || '#3b82f6'}
                        onChange={(color) => setLocalSettings({...localSettings, info_color: color})}
                      />
                    </div>
                    
                    <div>
                      <Label>Primary Gradient</Label>
                      <Input
                        value={localSettings.primary_gradient || ''}
                        onChange={(e) => setLocalSettings({...localSettings, primary_gradient: e.target.value})}
                        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mobile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mobile App Configuration</CardTitle>
                    <CardDescription>Configure mobile-specific branding and UI settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mobile UI Configuration */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Mobile Navigation & UI</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Navigation Style</Label>
                          <Select 
                            value={localSettings.mobile_ui_config?.navigation_style || 'bottom-tabs'}
                            onValueChange={(value) => setLocalSettings({
                              ...localSettings, 
                              mobile_ui_config: { ...localSettings.mobile_ui_config, navigation_style: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom-tabs">Bottom Tabs</SelectItem>
                              <SelectItem value="hamburger">Hamburger Menu</SelectItem>
                              <SelectItem value="floating-action">Floating Action Button</SelectItem>
                              <SelectItem value="side-drawer">Side Drawer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Enable Animations</Label>
                          <Switch
                            checked={localSettings.mobile_ui_config?.animations_enabled ?? true}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              mobile_ui_config: { ...localSettings.mobile_ui_config, animations_enabled: checked }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Features */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Mobile Features</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Offline Mode</Label>
                          <Switch
                            checked={localSettings.mobile_features?.offline_mode ?? false}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              mobile_features: { ...localSettings.mobile_features, offline_mode: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Push Notifications</Label>
                          <Switch
                            checked={localSettings.mobile_features?.push_notifications ?? true}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              mobile_features: { ...localSettings.mobile_features, push_notifications: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Biometric Authentication</Label>
                          <Switch
                            checked={localSettings.mobile_features?.biometric_auth ?? false}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              mobile_features: { ...localSettings.mobile_features, biometric_auth: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Location Services</Label>
                          <Switch
                            checked={localSettings.mobile_features?.location_services ?? false}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              mobile_features: { ...localSettings.mobile_features, location_services: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Camera Access</Label>
                          <Switch
                            checked={localSettings.mobile_features?.camera_access ?? true}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              mobile_features: { ...localSettings.mobile_features, camera_access: checked }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* PWA Configuration */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">PWA Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Cache Strategy</Label>
                          <Select 
                            value={localSettings.pwa_config?.cache_strategy || 'network-first'}
                            onValueChange={(value) => setLocalSettings({
                              ...localSettings,
                              pwa_config: { ...localSettings.pwa_config, cache_strategy: value }
                            })}
                          >
                            <SelectTrigger>
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
                        <div className="flex items-center justify-between">
                          <Label>Enable PWA Features</Label>
                          <Switch
                            checked={localSettings.pwa_config?.enabled ?? false}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings,
                              pwa_config: { ...localSettings.pwa_config, enabled: checked }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* App Store Configuration */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">App Store Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Bundle Identifier (iOS)</Label>
                            <Input
                              value={localSettings.bundle_identifier || ''}
                              onChange={(e) => setLocalSettings({...localSettings, bundle_identifier: e.target.value})}
                              placeholder="com.company.app"
                            />
                          </div>
                          <div>
                            <Label>Package Name (Android)</Label>
                            <Input
                              value={localSettings.android_package_name || ''}
                              onChange={(e) => setLocalSettings({...localSettings, android_package_name: e.target.value})}
                              placeholder="com.company.app"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>iOS App Store URL</Label>
                          <Input
                            value={localSettings.app_store_config?.ios_url || ''}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              app_store_config: { ...localSettings.app_store_config, ios_url: e.target.value }
                            })}
                            placeholder="https://apps.apple.com/app/your-app"
                          />
                        </div>
                        <div>
                          <Label>Google Play Store URL</Label>
                          <Input
                            value={localSettings.play_store_config?.android_url || ''}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              play_store_config: { ...localSettings.play_store_config, android_url: e.target.value }
                            })}
                            placeholder="https://play.google.com/store/apps/details?id=com.yourapp"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deep Linking */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Deep Linking Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>URL Scheme</Label>
                          <Input
                            value={localSettings.deep_link_config?.url_scheme || ''}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              deep_link_config: { ...localSettings.deep_link_config, url_scheme: e.target.value }
                            })}
                            placeholder="yourapp://"
                          />
                        </div>
                        <div>
                          <Label>Universal Links Domain</Label>
                          <Input
                            value={localSettings.deep_link_config?.universal_links_domain || ''}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              deep_link_config: { ...localSettings.deep_link_config, universal_links_domain: e.target.value }
                            })}
                            placeholder="yourapp.com"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout & Typography</CardTitle>
                    <CardDescription>Configure layout and typography settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Navigation Style</Label>
                      <Select 
                        value={localSettings.navigation_style || 'sidebar'}
                        onValueChange={(value) => setLocalSettings({...localSettings, navigation_style: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="topbar">Top Bar</SelectItem>
                          <SelectItem value="bottom">Bottom Navigation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Font Family</Label>
                      <Select 
                        value={localSettings.font_family || 'Inter'}
                        onValueChange={(value) => setLocalSettings({...localSettings, font_family: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Nunito">Nunito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Button Style</Label>
                      <Select 
                        value={localSettings.button_style || 'rounded'}
                        onValueChange={(value) => setLocalSettings({...localSettings, button_style: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="pill">Pill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Card Style</Label>
                      <Select 
                        value={localSettings.card_style || 'elevated'}
                        onValueChange={(value) => setLocalSettings({...localSettings, card_style: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevated">Elevated</SelectItem>
                          <SelectItem value="bordered">Bordered</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Enable Animations</Label>
                      <Switch
                        checked={localSettings.animations_enabled ?? true}
                        onCheckedChange={(checked) => setLocalSettings({...localSettings, animations_enabled: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Toggles</CardTitle>
                    <CardDescription>Enable or disable app features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {[
                        { key: 'weather', label: 'Weather Updates' },
                        { key: 'marketplace', label: 'Marketplace' },
                        { key: 'advisory', label: 'Crop Advisory' },
                        { key: 'community', label: 'Community Forum' },
                        { key: 'financing', label: 'Financial Services' },
                        { key: 'analytics', label: 'Analytics Dashboard' },
                        { key: 'notifications', label: 'Push Notifications' },
                        { key: 'offline_mode', label: 'Offline Mode' },
                      ].map(feature => (
                        <div key={feature.key} className="flex items-center justify-between">
                          <Label>{feature.label}</Label>
                          <Switch
                            checked={localSettings.feature_toggles?.[feature.key] ?? true}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings, 
                              feature_toggles: {
                                ...localSettings.feature_toggles,
                                [feature.key]: checked
                              }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Settings</CardTitle>
                    <CardDescription>Configure notification and language preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Default Language</Label>
                      <Select 
                        value={localSettings.language_settings?.default || 'en'}
                        onValueChange={(value) => setLocalSettings({
                          ...localSettings, 
                          language_settings: {
                            ...localSettings.language_settings,
                            default: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="mr">Marathi</SelectItem>
                          <SelectItem value="gu">Gujarati</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Maintenance Mode</Label>
                      <Switch
                        checked={localSettings.maintenance_mode ?? false}
                        onCheckedChange={(checked) => setLocalSettings({...localSettings, maintenance_mode: checked})}
                      />
                    </div>
                    
                    {localSettings.maintenance_mode && (
                      <div>
                        <Label>Maintenance Message</Label>
                        <Textarea
                          value={localSettings.maintenance_message || ''}
                          onChange={(e) => setLocalSettings({...localSettings, maintenance_message: e.target.value})}
                          placeholder="We're currently performing maintenance. Please check back later."
                          rows={3}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Custom CSS and scripts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Custom CSS</Label>
                      <Textarea
                        value={localSettings.custom_css || ''}
                        onChange={(e) => setLocalSettings({...localSettings, custom_css: e.target.value})}
                        placeholder="/* Add your custom CSS here */"
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label>Head Scripts</Label>
                      <Textarea
                        value={localSettings.custom_scripts?.head || ''}
                        onChange={(e) => setLocalSettings({
                          ...localSettings, 
                          custom_scripts: {
                            ...localSettings.custom_scripts,
                            head: e.target.value
                          }
                        })}
                        placeholder="<!-- Add scripts for <head> tag -->"
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label>Body Scripts</Label>
                      <Textarea
                        value={localSettings.custom_scripts?.body || ''}
                        onChange={(e) => setLocalSettings({
                          ...localSettings, 
                          custom_scripts: {
                            ...localSettings.custom_scripts,
                            body: e.target.value
                          }
                        })}
                        placeholder="<!-- Add scripts for <body> tag -->"
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          {isPreviewVisible && (
            <div className="space-y-4 lg:col-span-1">
              <Card className="sticky top-6 h-fit overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Preview</span>
                    <div className="flex items-center gap-2">
                      <Select value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-3 w-3" />
                              Mobile
                            </div>
                          </SelectItem>
                          <SelectItem value="tablet">
                            <div className="flex items-center gap-2">
                              <Tablet className="h-3 w-3" />
                              Tablet
                            </div>
                          </SelectItem>
                          <SelectItem value="desktop">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-3 w-3" />
                              Desktop
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Preview your theme changes in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4">
                  <div className={cn(
                    "transition-all duration-300",
                    previewMode === 'mobile' && "max-w-[375px]",
                    previewMode === 'tablet' && "max-w-[768px]",
                    previewMode === 'desktop' && "max-w-full"
                  )}>
                    <LivePreview 
                      colors={{
                        primary: localSettings.primary_color || '#10b981',
                        secondary: localSettings.secondary_color || '#059669',
                        accent: localSettings.accent_color || '#14b8a6',
                        background: localSettings.background_color || '#ffffff',
                        text: localSettings.text_color || '#1f2937'
                      }}
                      appName={localSettings.app_name}
                      logo={localSettings.logo_override_url}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
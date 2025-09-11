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
      mobile_ui_config: {
        ...prev?.mobile_ui_config,
        navigation_style: preset.styles.navigation_style,
        animations_enabled: preset.styles.animations_enabled,
        button_style: preset.styles.button_style,
        input_style: preset.styles.input_style,
        card_style: preset.styles.card_style
      }
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
        description: "All changes have been reverted to the last saved state.",
      });
    }
  };

  const handleExport = () => {
    const exportData = JSON.stringify(localSettings, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'white-label-config.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration exported",
      description: "Your white label configuration has been downloaded.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setLocalSettings(prev => ({
          ...prev,
          ...importedConfig
        }));
        
        toast({
          title: "Configuration imported",
          description: "Settings have been loaded. Review and save to apply.",
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
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Auto-saved
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            >
              {isPreviewVisible ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
            </label>
            
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button size="sm" onClick={handleSave} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              Save to Database
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={cn(
          "grid gap-6",
          isPreviewVisible ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}>
          {/* Settings Tabs */}
          <div className={cn(
            "space-y-6",
            isPreviewVisible ? "lg:col-span-2" : "lg:col-span-1"
          )}>
            <Tabs defaultValue="themes" className="space-y-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="themes">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Themes
                </TabsTrigger>
                <TabsTrigger value="branding">
                  <Brush className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-2" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Layout className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="communication">
                  <Bell className="h-4 w-4 mr-2" />
                  Communication
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Themes Tab */}
              <TabsContent value="themes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start Templates</CardTitle>
                    <CardDescription>
                      Select a pre-configured theme to get started quickly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ThemePresets 
                      onSelectTheme={handleSelectTheme}
                      selectedTheme={selectedThemeId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Identity</CardTitle>
                    <CardDescription>Configure your app's brand elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="app_name">Application Name</Label>
                      <Input
                        id="app_name"
                        value={localSettings?.app_name || ''}
                        onChange={(e) => setLocalSettings({...localSettings, app_name: e.target.value})}
                        placeholder="Your App Name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>App Logo</Label>
                        <BrandingUploader
                          logoUrl={localSettings?.app_logo_url}
                          onLogoChange={(url) => setLocalSettings({...localSettings, app_logo_url: url})}
                        />
                      </div>
                      
                      <div>
                        <Label>App Icon</Label>
                        <BrandingUploader
                          logoUrl={localSettings?.app_icon_url}
                          onLogoChange={(url) => setLocalSettings({...localSettings, app_icon_url: url})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Splash Screen</Label>
                      <BrandingUploader
                        logoUrl={localSettings?.app_splash_screen_url}
                        onLogoChange={(url) => setLocalSettings({...localSettings, app_splash_screen_url: url})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>Define your brand colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Color</Label>
                        <ColorPicker
                          label="Primary Color"
                          value={localSettings?.primary_color || '#10b981'}
                          onChange={(color) => setLocalSettings({...localSettings, primary_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Secondary Color</Label>
                        <ColorPicker
                          label="Secondary Color"
                          value={localSettings?.secondary_color || '#059669'}
                          onChange={(color) => setLocalSettings({...localSettings, secondary_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Accent Color</Label>
                        <ColorPicker
                          label="Accent Color"
                          value={localSettings?.accent_color || '#14b8a6'}
                          onChange={(color) => setLocalSettings({...localSettings, accent_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Background Color</Label>
                        <ColorPicker
                          label="Background Color"
                          value={localSettings?.background_color || '#ffffff'}
                          onChange={(color) => setLocalSettings({...localSettings, background_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Text Color</Label>
                        <ColorPicker
                          label="Text Color"
                          value={localSettings?.text_color || '#1f2937'}
                          onChange={(color) => setLocalSettings({...localSettings, text_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Success Color</Label>
                        <ColorPicker
                          label="Success Color"
                          value={localSettings?.success_color || '#10b981'}
                          onChange={(color) => setLocalSettings({...localSettings, success_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Warning Color</Label>
                        <ColorPicker
                          label="Warning Color"
                          value={localSettings?.warning_color || '#f59e0b'}
                          onChange={(color) => setLocalSettings({...localSettings, warning_color: color})}
                        />
                      </div>
                      
                      <div>
                        <Label>Error Color</Label>
                        <ColorPicker
                          label="Error Color"
                          value={localSettings?.error_color || '#ef4444'}
                          onChange={(color) => setLocalSettings({...localSettings, error_color: color})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mobile Tab */}
              <TabsContent value="mobile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mobile App Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">User Interface</h3>
                      
                      <div>
                        <Label htmlFor="navigation_style">Navigation Style</Label>
                        <Select
                          value={localSettings?.mobile_ui_config?.navigation_style || 'bottom_tabs'}
                          onValueChange={(value) => setLocalSettings(prev => ({
                            ...prev,
                            mobile_ui_config: {
                              ...prev?.mobile_ui_config,
                              navigation_style: value
                            }
                          }))}
                        >
                          <SelectTrigger id="navigation_style">
                            <SelectValue placeholder="Select navigation style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom_tabs">Bottom Tabs</SelectItem>
                            <SelectItem value="drawer">Drawer Menu</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Enable Animations</Label>
                        <Switch
                          checked={localSettings?.mobile_ui_config?.animations_enabled ?? true}
                          onCheckedChange={(checked) => setLocalSettings(prev => ({
                            ...prev,
                            mobile_ui_config: {
                              ...prev?.mobile_ui_config,
                              animations_enabled: checked
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">PWA Configuration</h3>
                      <div>
                        <Label>Short Name</Label>
                        <Input
                          value={localSettings.pwa_config?.short_name || ''}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            pwa_config: { ...localSettings.pwa_config, short_name: e.target.value }
                          })}
                          placeholder="App"
                        />
                      </div>
                      
                      <div>
                        <Label>Theme Color</Label>
                        <ColorPicker
                          label="Theme Color"
                          value={localSettings.pwa_config?.theme_color || localSettings.primary_color || '#10b981'}
                          onChange={(color) => setLocalSettings({
                            ...localSettings,
                            pwa_config: { ...localSettings.pwa_config, theme_color: color }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">App Store Configuration</h3>
                      <div>
                        <Label>Bundle Identifier (iOS)</Label>
                        <Input
                          value={localSettings.bundle_identifier || ''}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            bundle_identifier: e.target.value
                          })}
                          placeholder="com.yourcompany.app"
                        />
                      </div>
                      <div>
                        <Label>Package Name (Android)</Label>
                        <Input
                          value={localSettings.android_package_name || ''}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            android_package_name: e.target.value
                          })}
                          placeholder="com.yourcompany.app"
                        />
                      </div>
                    </div>

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
                            checked={localSettings.mobile_features?.[feature.key] ?? true}
                            onCheckedChange={(checked) => setLocalSettings({
                              ...localSettings, 
                              mobile_features: {
                                ...localSettings.mobile_features,
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
                      <Label>Default Notification Channel</Label>
                      <Select 
                        value={localSettings.notification_config?.default_channel || 'push'}
                        onValueChange={(value) => setLocalSettings({
                          ...localSettings, 
                          notification_config: {
                            ...localSettings.notification_config,
                            default_channel: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="push">Push Notifications</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>API and integration settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>API Version</Label>
                      <Input
                        value={localSettings.app_store_config?.api_version || 'v1'}
                        onChange={(e) => setLocalSettings({
                          ...localSettings,
                          app_store_config: { 
                            ...localSettings.app_store_config, 
                            api_version: e.target.value 
                          }
                        })}
                        placeholder="v1"
                      />
                    </div>
                    
                    <div>
                      <Label>Custom Headers (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(localSettings.app_store_config?.custom_headers || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const headers = JSON.parse(e.target.value);
                            setLocalSettings({
                              ...localSettings,
                              app_store_config: {
                                ...localSettings.app_store_config,
                                custom_headers: headers
                              }
                            });
                          } catch (error) {
                            // Invalid JSON, don't update
                          }
                        }}
                        placeholder='{"X-Custom-Header": "value"}'
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
                      logo={localSettings.app_logo_url}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
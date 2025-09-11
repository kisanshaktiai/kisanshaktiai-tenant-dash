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
import { cn } from '@/lib/utils';
import { 
  Palette, 
  Smartphone, 
  Globe,
  Mail,
  Download,
  Shield,
  Layers,
  Package,
  Save
} from 'lucide-react';
import { ThemePresets, ThemePreset, themePresets } from '@/components/settings/ThemePresets';
import { WhiteLabelConfig } from '@/services/WhiteLabelService';

export default function WhiteLabelConfigPage() {
  const { settings, updateSettings, isUpdating } = useWhiteLabelSettings();
  const [localSettings, setLocalSettings] = useState<Partial<WhiteLabelConfig>>(settings || {});
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');

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
    
    toast({
      title: "Theme applied",
      description: `${preset.name} theme has been applied to preview.`,
    });
  };

  const handleSave = async () => {
    if (!localSettings) return;
    
    try {
      await updateSettings(localSettings);
      toast({
        title: "Settings saved",
        description: "Your white label configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const hexToHSL = (hex: string): string => {
    // Remove the hash if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">White Label Configuration</h1>
              <Button onClick={handleSave} disabled={isUpdating} size="lg" className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-6 py-6">
          <Tabs defaultValue="branding" className="space-y-8">
            <TabsList className="grid grid-cols-8 w-full h-auto p-1 bg-muted/50">
              <TabsTrigger value="branding" className="gap-2 py-3">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="domain" className="gap-2 py-3">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Domain</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2 py-3">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2 py-3">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Mobile</span>
              </TabsTrigger>
              <TabsTrigger value="pwa" className="gap-2 py-3">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PWA</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2 py-3">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2 py-3">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="distribution" className="gap-2 py-3">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Distribution</span>
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Identity</CardTitle>
                      <CardDescription>Configure your application's brand elements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="app_name">Application Name</Label>
                        <Input
                          id="app_name"
                          value={localSettings?.app_name || ''}
                          onChange={(e) => setLocalSettings({...localSettings, app_name: e.target.value})}
                          placeholder="Enter your app name"
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Logo</Label>
                          <div className="mt-2">
                            <BrandingUploader
                              logoUrl={localSettings?.app_logo_url}
                              onLogoChange={(url) => setLocalSettings({...localSettings, app_logo_url: url})}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Favicon</Label>
                          <div className="mt-2">
                            <BrandingUploader
                              logoUrl={localSettings?.app_icon_url}
                              onLogoChange={(url) => setLocalSettings({...localSettings, app_icon_url: url})}
                            />
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Color Palette</CardTitle>
                      <CardDescription>Define your brand colors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <ColorPicker
                            label="Primary"
                            value={localSettings?.primary_color || '#3b82f6'}
                            onChange={(color) => setLocalSettings({...localSettings, primary_color: color})}
                          />
                        </div>
                        <div>
                          <ColorPicker
                            label="Secondary"
                            value={localSettings?.secondary_color || '#10b981'}
                            onChange={(color) => setLocalSettings({...localSettings, secondary_color: color})}
                          />
                        </div>
                        <div>
                          <ColorPicker
                            label="Accent"
                            value={localSettings?.accent_color || '#f59e0b'}
                            onChange={(color) => setLocalSettings({...localSettings, accent_color: color})}
                          />
                        </div>
                        <div>
                          <ColorPicker
                            label="Background"
                            value={localSettings?.background_color || '#ffffff'}
                            onChange={(color) => setLocalSettings({...localSettings, background_color: color})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Live Preview</CardTitle>
                      <CardDescription>See how your brand looks in real-time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LivePreview
                        colors={{
                          primary: localSettings?.primary_color || '#3b82f6',
                          secondary: localSettings?.secondary_color || '#10b981',
                          accent: localSettings?.accent_color || '#f59e0b',
                          background: localSettings?.background_color || '#ffffff',
                          text: localSettings?.text_color || '#1f2937'
                        }}
                        appName={localSettings?.app_name}
                        logo={localSettings?.app_logo_url}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Mobile Tab */}
            <TabsContent value="mobile" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Start Themes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Start Themes</CardTitle>
                      <CardDescription>Select a preset theme to start with</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ThemePresets 
                        onSelectTheme={handleSelectTheme}
                        selectedTheme={selectedThemeId}
                      />
                    </CardContent>
                  </Card>

                  {/* Core Theme Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Core Theme Colors</CardTitle>
                      <CardDescription>Main brand colors for your mobile app</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-medium mb-3 block">Primary</Label>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ColorPicker
                                  label=""
                                  value={localSettings?.primary_color || '#3b82f6'}
                                  onChange={(color) => setLocalSettings({...localSettings, primary_color: color})}
                                />
                              </div>
                              <div 
                                className="w-20 h-10 rounded-md border shadow-sm"
                                style={{ backgroundColor: localSettings?.primary_color || '#3b82f6' }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {localSettings?.primary_color && hexToHSL(localSettings.primary_color)}
                            </p>
                            <p className="text-xs text-muted-foreground">Main brand color</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-3 block">Secondary</Label>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ColorPicker
                                  label=""
                                  value={localSettings?.secondary_color || '#10b981'}
                                  onChange={(color) => setLocalSettings({...localSettings, secondary_color: color})}
                                />
                              </div>
                              <div 
                                className="w-20 h-10 rounded-md border shadow-sm"
                                style={{ backgroundColor: localSettings?.secondary_color || '#10b981' }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {localSettings?.secondary_color && hexToHSL(localSettings.secondary_color)}
                            </p>
                            <p className="text-xs text-muted-foreground">Supporting accent</p>
                          </div>

                        </div>

                        <div className="space-y-6">

                          <div>
                            <Label className="text-sm font-medium mb-3 block">Accent</Label>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ColorPicker
                                  label=""
                                  value={localSettings?.accent_color || '#f59e0b'}
                                  onChange={(color) => setLocalSettings({...localSettings, accent_color: color})}
                                />
                              </div>
                              <div 
                                className="w-20 h-10 rounded-md border shadow-sm"
                                style={{ backgroundColor: localSettings?.accent_color || '#f59e0b' }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {localSettings?.accent_color && hexToHSL(localSettings.accent_color)}
                            </p>
                            <p className="text-xs text-muted-foreground">Highlight color</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile App Preview */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Mobile App Preview</CardTitle>
                      <CardDescription>See how your theme looks on a real mobile app</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div className="relative">
                        {/* Phone Frame */}
                        <div className="relative mx-auto border-[14px] border-gray-800 dark:border-gray-800 bg-gray-800 rounded-[2.5rem] h-[600px] w-[300px]">
                          {/* Screen */}
                          <div className="h-[572px] w-[272px] rounded-[2rem] overflow-hidden bg-white dark:bg-gray-900">
                            {/* Status Bar */}
                            <div className="bg-gray-900 text-white px-4 py-1 flex justify-between items-center text-xs">
                              <span>9:41</span>
                              <div className="flex gap-1">
                                <div className="w-4 h-3 bg-white rounded-sm"></div>
                                <div className="w-4 h-3 bg-white rounded-sm"></div>
                                <div className="w-4 h-3 bg-white rounded-sm"></div>
                              </div>
                            </div>
                            
                            {/* App Content */}
                            <div className="p-4" style={{ backgroundColor: localSettings?.background_color || '#ffffff' }}>
                              {/* Header */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="w-6 h-6 rounded" style={{ backgroundColor: localSettings?.primary_color || '#3b82f6' }}></div>
                                <h2 className="font-semibold text-lg" style={{ color: localSettings?.text_color || '#1f2937' }}>
                                  {localSettings?.app_name || 'AgriTech Platform'}
                                </h2>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: localSettings?.secondary_color || '#10b981' }}></div>
                              </div>

                              {/* Stats Cards */}
                              <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-3 rounded-lg text-white" style={{ backgroundColor: localSettings?.primary_color || '#3b82f6' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                                    <span className="text-xs">+12%</span>
                                  </div>
                                  <div className="text-xl font-bold">₹45,231</div>
                                  <div className="text-xs opacity-80">Total Revenue</div>
                                </div>
                                <div className="p-3 rounded-lg text-white" style={{ backgroundColor: localSettings?.secondary_color || '#10b981' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                                    <span className="text-xs">+8%</span>
                                  </div>
                                  <div className="text-xl font-bold">152</div>
                                  <div className="text-xs opacity-80">Active Orders</div>
                                </div>
                              </div>

                              {/* Chart Preview */}
                              <div className="mb-6">
                                <h3 className="text-sm font-medium mb-3" style={{ color: localSettings?.text_color || '#1f2937' }}>
                                  Weekly Overview
                                </h3>
                                <div className="flex items-end justify-between h-24 px-2">
                                  {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                                    <div
                                      key={i}
                                      className="w-8 rounded-t"
                                      style={{
                                        height: `${height}%`,
                                        backgroundColor: i === 6 ? (localSettings?.primary_color || '#3b82f6') : '#e5e7eb'
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Bottom Navigation */}
                              <div className="flex justify-around pt-4 border-t">
                                {['Orders', 'Schedule', 'Track', 'Reviews'].map((item, i) => (
                                  <div key={item} className="flex flex-col items-center gap-1">
                                    <div 
                                      className="w-6 h-6 rounded"
                                      style={{ 
                                        backgroundColor: i === 0 ? (localSettings?.primary_color || '#3b82f6') : '#e5e7eb'
                                      }}
                                    />
                                    <span className="text-[10px]" style={{ color: localSettings?.text_color || '#1f2937' }}>
                                      {item}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Notch */}
                        <div className="absolute top-[14px] left-1/2 transform -translate-x-1/2 h-[6px] w-[120px] bg-gray-800 rounded-b-xl"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { useToast } from '@/hooks/use-toast';
import { FONT_OPTIONS } from '@/config/fonts';
import { Palette, Eye, EyeOff, Save, RotateCcw, Type, Moon, Sun, Monitor } from 'lucide-react';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';
import { ThemePresets, ThemePreset } from '@/components/settings/ThemePresets';

const AppearancePageImproved = () => {
  const { settings, updateSettings, isUpdating } = useAppearanceSettings();
  const { toast } = useToast();
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  
  // Local state for form inputs
  const [formData, setFormData] = useState({
    theme_mode: 'system' as 'light' | 'dark' | 'system',
    primary_color: '#10b981',
    secondary_color: '#059669',
    accent_color: '#14b8a6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    info_color: '#3b82f6',
    error_color: '#ef4444',
    border_color: '#e5e7eb',
    muted_color: '#f3f4f6',
    sidebar_background_color: '#ffffff',
    font_family: 'Inter',
    custom_css: '',
  });

  // Update form data when settings change - only once on initial load
  useEffect(() => {
    if (settings && !hasUnsavedChanges) {
      setFormData({
        theme_mode: settings.theme_mode || 'system',
        primary_color: settings.primary_color || '#10b981',
        secondary_color: settings.secondary_color || '#059669',
        accent_color: settings.accent_color || '#14b8a6',
        background_color: settings.background_color || '#ffffff',
        text_color: settings.text_color || '#1f2937',
        success_color: settings.success_color || '#10b981',
        warning_color: settings.warning_color || '#f59e0b',
        info_color: settings.info_color || '#3b82f6',
        error_color: settings.error_color || '#ef4444',
        border_color: settings.border_color || '#e5e7eb',
        muted_color: settings.muted_color || '#f3f4f6',
        sidebar_background_color: settings.sidebar_background_color || '#ffffff',
        font_family: settings.font_family || 'Inter',
        custom_css: settings.custom_css || '',
      });
    }
  }, [settings]);

  // Apply preview when form data changes and preview is enabled
  useEffect(() => {
    if (isPreviewEnabled) {
      appearanceSettingsService.applyThemeColors({
        ...formData,
        tenant_id: settings?.tenant_id || '',
      } as any);
    }
  }, [formData, isPreviewEnabled]);

  // Reset preview when disabled
  useEffect(() => {
    if (!isPreviewEnabled && settings) {
      appearanceSettingsService.applyThemeColors(settings);
    }
  }, [isPreviewEnabled, settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setHasUnsavedChanges(false);
      toast({
        title: "Theme updated",
        description: "Your appearance settings have been saved and applied successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      theme_mode: 'system' as const,
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      success_color: '#10b981',
      warning_color: '#f59e0b',
      info_color: '#3b82f6',
      error_color: '#ef4444',
      border_color: '#e5e7eb',
      muted_color: '#f3f4f6',
      sidebar_background_color: '#ffffff',
      font_family: 'Inter',
      custom_css: '',
    };
    setFormData(defaults);
    setHasUnsavedChanges(true);
  };

  const handlePreviewToggle = () => {
    setIsPreviewEnabled(!isPreviewEnabled);
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    setFormData(prev => ({
      ...prev,
      primary_color: preset.colors.primary_color,
      secondary_color: preset.colors.secondary_color,
      accent_color: preset.colors.accent_color,
      background_color: preset.colors.background_color,
      text_color: preset.colors.text_color,
      border_color: preset.colors.border_color,
      muted_color: preset.colors.muted_color,
      success_color: preset.colors.success_color,
      warning_color: preset.colors.warning_color,
      error_color: preset.colors.error_color,
      info_color: preset.colors.info_color,
      font_family: preset.styles.font_family,
    }));
    setSelectedPresetId(preset.id);
    setHasUnsavedChanges(true);
  };

  const ColorInput = ({ label, field, value }: { label: string; field: string; value: string }) => (
    <div>
      <Label htmlFor={field}>{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <Input
          id={field}
          type="color"
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-12 h-9 p-1 border rounded cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Appearance Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize the look and feel of your application
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <Switch
                id="preview-mode"
                checked={isPreviewEnabled}
                onCheckedChange={handlePreviewToggle}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="preview-mode" className="flex items-center gap-1.5 cursor-pointer text-sm">
                {isPreviewEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Live Preview
              </Label>
            </div>
            
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-1.5" />
              {isUpdating ? 'Saving...' : 'Save'}
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  •
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Preview Notice */}
        {isPreviewEnabled && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Live preview enabled - changes appear instantly across the application
            </p>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="presets" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Presets
                </CardTitle>
                <CardDescription>
                  Choose from professionally designed color themes to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <ThemePresets
                    selectedTheme={selectedPresetId}
                    onSelectTheme={handlePresetSelect}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Theme Mode */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Theme Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={formData.theme_mode === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('theme_mode', 'light')}
                      className="justify-start"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={formData.theme_mode === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('theme_mode', 'dark')}
                      className="justify-start"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={formData.theme_mode === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('theme_mode', 'system')}
                      className="justify-start"
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Typography</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.font_family}
                    onValueChange={(value) => handleInputChange('font_family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Brand Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Brand Colors</CardTitle>
                  <CardDescription className="text-xs">
                    Core colors that define your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorInput label="Primary" field="primary_color" value={formData.primary_color} />
                    <ColorInput label="Secondary" field="secondary_color" value={formData.secondary_color} />
                    <ColorInput label="Accent" field="accent_color" value={formData.accent_color} />
                    <ColorInput label="Muted" field="muted_color" value={formData.muted_color} />
                  </div>
                </CardContent>
              </Card>

              {/* Status Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Colors</CardTitle>
                  <CardDescription className="text-xs">
                    Colors for different states and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorInput label="Success" field="success_color" value={formData.success_color} />
                    <ColorInput label="Warning" field="warning_color" value={formData.warning_color} />
                    <ColorInput label="Error" field="error_color" value={formData.error_color} />
                    <ColorInput label="Info" field="info_color" value={formData.info_color} />
                  </div>
                </CardContent>
              </Card>

              {/* Layout Colors */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Layout Colors</CardTitle>
                  <CardDescription className="text-xs">
                    Colors for backgrounds, text, and borders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <ColorInput label="Background" field="background_color" value={formData.background_color} />
                    <ColorInput label="Text" field="text_color" value={formData.text_color} />
                    <ColorInput label="Border" field="border_color" value={formData.border_color} />
                    <ColorInput label="Sidebar" field="sidebar_background_color" value={formData.sidebar_background_color} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your theme looks with sample components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                  <Button disabled>Disabled</Button>
                  <Button size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Sample Card</CardTitle>
                    <CardDescription>This is how cards will appear</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Your theme customization affects all components throughout the application.
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-2 p-4 rounded-lg border">
                  <p style={{ fontFamily: formData.font_family }} className="text-2xl font-bold">
                    {formData.font_family} Font Preview
                  </p>
                  <p style={{ fontFamily: formData.font_family }} className="text-lg">
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p style={{ fontFamily: formData.font_family }} className="text-sm text-muted-foreground">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>
                  Add custom CSS for advanced customization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.custom_css}
                  onChange={(e) => handleInputChange('custom_css', e.target.value)}
                  className="w-full h-48 p-3 font-mono text-sm border rounded-lg bg-background"
                  placeholder="/* Add your custom CSS here */"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AppearancePageImproved;
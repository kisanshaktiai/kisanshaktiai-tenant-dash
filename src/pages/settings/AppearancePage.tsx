import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { useToast } from '@/hooks/use-toast';
import { FONT_OPTIONS } from '@/config/fonts';
import { Palette, Eye, Save, RotateCcw, Type } from 'lucide-react';

const AppearancePage = () => {
  const { settings, updateSettings, isUpdating } = useAppearanceSettings();
  const { toast } = useToast();
  
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

  // Update form data when settings change
  React.useEffect(() => {
    if (settings) {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      toast({
        title: "Theme updated",
        description: "Your appearance settings have been saved successfully.",
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
    setFormData({
      theme_mode: 'system',
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
  };

  const presetThemes = [
    {
      name: 'Agricultural Green',
      colors: {
        primary_color: '#10b981',
        secondary_color: '#059669',
        accent_color: '#14b8a6',
        success_color: '#10b981',
        warning_color: '#f59e0b',
        info_color: '#3b82f6',
        destructive_color: '#ef4444',
      }
    },
    {
      name: 'Ocean Blue',
      colors: {
        primary_color: '#0ea5e9',
        secondary_color: '#0284c7',
        accent_color: '#06b6d4',
        success_color: '#10b981',
        warning_color: '#f59e0b',
        info_color: '#0ea5e9',
        destructive_color: '#ef4444',
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary_color: '#f97316',
        secondary_color: '#ea580c',
        accent_color: '#fb923c',
        success_color: '#10b981',
        warning_color: '#f97316',
        info_color: '#3b82f6',
        destructive_color: '#ef4444',
      }
    }
  ];

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setFormData(prev => ({
      ...prev,
      ...preset.colors
    }));
  };

  return (
    <div className="container-responsive py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appearance Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize the look and feel of your application
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Theme Mode
              </CardTitle>
              <CardDescription>
                Choose between light, dark, or system preference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.theme_mode}
                onValueChange={(value) => handleInputChange('theme_mode', value as 'light' | 'dark' | 'system')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription>
                Choose from world-class fonts optimized for readability and modern design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="font_family">Font Family</Label>
                <Select
                  value={formData.font_family}
                  onValueChange={(value) => handleInputChange('font_family', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{font.label}</span>
                          <span className="text-xs text-muted-foreground">{font.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/10">
                <p className="text-sm font-medium mb-2">Font Preview</p>
                <div style={{ fontFamily: formData.font_family === 'System' ? 'system-ui' : formData.font_family }}>
                  <h3 className="text-lg font-semibold mb-1">Sample Heading</h3>
                  <p className="text-sm text-muted-foreground">
                    This is how your content will look with the selected font. The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Web Application Theme Colors
              </CardTitle>
              <CardDescription>
                Define your organization's primary brand colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="accent_color"
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
              <CardDescription>
                Colors used for status indicators and feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="success_color">Success Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="success_color"
                      type="color"
                      value={formData.success_color}
                      onChange={(e) => handleInputChange('success_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.success_color}
                      onChange={(e) => handleInputChange('success_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="warning_color">Warning Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="warning_color"
                      type="color"
                      value={formData.warning_color}
                      onChange={(e) => handleInputChange('warning_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.warning_color}
                      onChange={(e) => handleInputChange('warning_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="info_color">Info Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="info_color"
                      type="color"
                      value={formData.info_color}
                      onChange={(e) => handleInputChange('info_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.info_color}
                      onChange={(e) => handleInputChange('info_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="error_color">Error Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="error_color"
                      type="color"
                      value={formData.error_color}
                      onChange={(e) => handleInputChange('error_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.error_color}
                      onChange={(e) => handleInputChange('error_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Colors</CardTitle>
              <CardDescription>
                Background, text, and structural element colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background_color">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="background_color"
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text_color">Text Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="text_color"
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => handleInputChange('text_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.text_color}
                      onChange={(e) => handleInputChange('text_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="border_color">Border Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="border_color"
                      type="color"
                      value={formData.border_color}
                      onChange={(e) => handleInputChange('border_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.border_color}
                      onChange={(e) => handleInputChange('border_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sidebar_background_color">Sidebar Background</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="sidebar_background_color"
                      type="color"
                      value={formData.sidebar_background_color}
                      onChange={(e) => handleInputChange('sidebar_background_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.sidebar_background_color}
                      onChange={(e) => handleInputChange('sidebar_background_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Presets</CardTitle>
              <CardDescription>
                Quick color schemes to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {presetThemes.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                  className="w-full justify-start"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: preset.colors.primary_color }}
                    />
                    {preset.name}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your colors look in action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button className="w-full btn-primary">
                  Primary Button
                </Button>
                <Button variant="secondary" className="w-full">
                  Secondary Button
                </Button>
                <Button variant="outline" className="w-full">
                  Outline Button
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Badge className="bg-success text-success-foreground">Success</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                <Badge className="bg-info text-info-foreground">Info</Badge>
                <Badge className="bg-destructive text-destructive-foreground">Error</Badge>
              </div>

              <Separator />

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Sample Card</h4>
                <p className="text-muted-foreground text-sm">
                  This is how your content will look with the selected colors and font.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;

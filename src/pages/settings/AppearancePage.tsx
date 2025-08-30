
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const presetColors = [
  { name: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#14b8a6' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb', accent: '#1d4ed8' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#6d28d9' },
  { name: 'Orange', primary: '#f97316', secondary: '#ea580c', accent: '#c2410c' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#be123c' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488', accent: '#0f766e' }
];

const fontOptions = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' }
];

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoading, isUpdating } = useAppearanceSettings();
  const [previewMode, setPreviewMode] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleColorChange = (colorType: string, value: string) => {
    updateSettings({
      [colorType]: value
    });
  };

  const handlePresetSelect = (preset: typeof presetColors[0]) => {
    updateSettings({
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // TODO: Implement logo upload to storage
      // For now, we'll just store the filename
      updateSettings({
        logo_override_url: URL.createObjectURL(file)
      });
    }
  };

  const handleReset = () => {
    updateSettings({
      theme_mode: 'system',
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Inter',
      logo_override_url: null
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Appearance" description="Customize the look and feel of your dashboard" />
        <PageContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title="Appearance" 
        description="Customize the look and feel of your dashboard"
      />
      
      <PageContent className="space-y-6">
        {/* Theme Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Theme Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map((themeOption) => (
                <Button
                  key={themeOption.value}
                  variant={theme === themeOption.value ? 'default' : 'outline'}
                  onClick={() => {
                    setTheme(themeOption.value as any);
                    updateSettings({ theme_mode: themeOption.value as any });
                  }}
                  className="h-20 flex-col gap-2"
                >
                  <themeOption.icon className="w-5 h-5" />
                  <span className="text-sm">{themeOption.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Customization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'primary_color', label: 'Primary Color' },
                { key: 'secondary_color', label: 'Secondary Color' },
                { key: 'accent_color', label: 'Accent Color' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm"
                      style={{ backgroundColor: settings?.[key as keyof typeof settings] || '#10b981' }}
                    />
                    <Input
                      type="color"
                      value={settings?.[key as keyof typeof settings] || '#10b981'}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Color Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Color Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {presetColors.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => handlePresetSelect(preset)}
                    className="h-auto p-3 flex-col gap-2 hover:scale-[1.02] transition-all"
                  >
                    <div className="flex gap-1">
                      {[preset.primary, preset.secondary, preset.accent].map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Override */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Logo Override
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Custom Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              {settings?.logo_override_url && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <img 
                    src={settings.logo_override_url} 
                    alt="Custom logo preview" 
                    className="h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>Font Family</Label>
              <Select 
                value={settings?.font_family || 'Inter'} 
                onValueChange={(value) => updateSettings({ font_family: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isUpdating}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="preview-mode"
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
              <Label htmlFor="preview-mode" className="text-sm">
                {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Live Preview
              </Label>
            </div>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default AppearancePage;

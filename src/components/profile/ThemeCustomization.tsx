
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { tenantProfileService } from '@/services/TenantProfileService';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Eye,
  RefreshCw,
  Wand2,
  Paintbrush2,
  Contrast
} from 'lucide-react';

const presetThemes = [
  {
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1e293b'
  },
  {
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#14b8a6',
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1c1917'
  },
  {
    name: 'Royal Purple',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a855f7',
    background: '#ffffff',
    text: '#1e1b4b'
  },
  {
    name: 'Rose Gold',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#1f1f1f'
  },
  {
    name: 'Modern Dark',
    primary: '#6366f1',
    secondary: '#4f46e5',
    accent: '#8b5cf6',
    background: '#0f0f0f',
    text: '#f8fafc'
  }
];

export const ThemeCustomization: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { currentTenant } = useTenantContextOptimized();
  const { toast } = useToast();
  
  const [customColors, setCustomColors] = useState({
    primary: '#10b981',
    secondary: '#059669',
    accent: '#14b8a6',
    background: '#ffffff',
    text: '#1f2937'
  });
  
  const [fontFamily, setFontFamily] = useState('Inter');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load current branding
  useEffect(() => {
    if (currentTenant?.branding) {
      setCustomColors({
        primary: currentTenant.branding.primary_color || '#10b981',
        secondary: currentTenant.branding.secondary_color || '#059669',
        accent: currentTenant.branding.accent_color || '#14b8a6',
        background: currentTenant.branding.background_color || '#ffffff',
        text: currentTenant.branding.text_color || '#1f2937'
      });
      setFontFamily(currentTenant.branding.font_family || 'Inter');
    }
  }, [currentTenant]);

  const handleColorChange = (colorType: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorType]: value }));
    
    if (previewMode) {
      applyPreviewColors({ ...customColors, [colorType]: value });
    }
  };

  const applyPreviewColors = (colors: typeof customColors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.text);
  };

  const resetPreviewColors = () => {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
  };

  const handlePresetSelect = (preset: typeof presetThemes[0]) => {
    setCustomColors({
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
      background: preset.background,
      text: preset.text
    });
    
    if (previewMode) {
      applyPreviewColors({
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        background: preset.background,
        text: preset.text
      });
    }
  };

  const handlePreviewToggle = (enabled: boolean) => {
    setPreviewMode(enabled);
    if (enabled) {
      applyPreviewColors(customColors);
    } else {
      resetPreviewColors();
    }
  };

  const handleSave = async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    try {
      await tenantProfileService.upsertBranding(currentTenant.id, {
        app_name: currentTenant.name,
        logo_url: currentTenant.branding?.logo_url,
        primary_color: customColors.primary,
        secondary_color: customColors.secondary,
        accent_color: customColors.accent,
        background_color: customColors.background,
        text_color: customColors.text,
        font_family: fontFamily
      });

      // Apply colors permanently
      applyPreviewColors(customColors);
      
      toast({
        title: "Theme updated successfully",
        description: "Your custom theme has been saved and applied.",
      });
    } catch (error) {
      toast({
        title: "Failed to update theme",
        description: "There was an error saving your theme preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultColors = {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#14b8a6',
      background: '#ffffff',
      text: '#1f2937'
    };
    setCustomColors(defaultColors);
    setFontFamily('Inter');
    
    if (previewMode) {
      applyPreviewColors(defaultColors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode Selection */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Contrast className="w-5 h-5 text-primary" />
            <CardTitle>Theme Mode</CardTitle>
          </div>
          <CardDescription>
            Choose between light, dark, or system theme
          </CardDescription>
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
                onClick={() => setTheme(themeOption.value as any)}
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Color Customization</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="preview-mode" className="text-sm">Live Preview</Label>
              <Switch
                id="preview-mode"
                checked={previewMode}
                onCheckedChange={handlePreviewToggle}
              />
            </div>
          </div>
          <CardDescription>
            Customize the color scheme for your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(customColors).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1')}
                </Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                  <Input
                    id={key}
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Preset Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium">Preset Themes</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presetThemes.map((preset) => (
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

          <Separator />

          {/* Font Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Paintbrush2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium">Typography</Label>
            </div>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter (Default)</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </Button>
            <div className="flex gap-2">
              {previewMode && (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="w-3 h-3" />
                  Live Preview Active
                </Badge>
              )}
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Save Theme
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

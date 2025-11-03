import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useOrganizationBranding } from '@/hooks/organization/useOrganizationBranding';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BrandingTab = () => {
  const { branding, isLoading, updateBranding, uploadLogo, isUpdating, isUploading } = useOrganizationBranding();
  const { toast } = useToast();

  const [colors, setColors] = useState({
    primary_color: '#10b981',
    secondary_color: '#3b82f6',
    accent_color: '#8b5cf6',
  });

  const [appName, setAppName] = useState('');
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    if (branding) {
      setColors({
        primary_color: branding.primary_color || '#10b981',
        secondary_color: branding.secondary_color || '#3b82f6',
        accent_color: branding.accent_color || '#8b5cf6',
      });
      setAppName(branding.app_name || '');
      setFontFamily(branding.font_family || '');
    }
  }, [branding]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadLogo(file);
    } catch (error) {
      console.error('Logo upload error:', error);
    }
  };

  const handleColorUpdate = async () => {
    await updateBranding(colors);
  };

  const handleBrandingUpdate = async () => {
    await updateBranding({
      app_name: appName,
      font_family: fontFamily,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const presetThemes = [
    { name: 'Modern Green', primary: '#10b981', secondary: '#3b82f6', accent: '#8b5cf6' },
    { name: 'Professional Blue', primary: '#3b82f6', secondary: '#06b6d4', accent: '#8b5cf6' },
    { name: 'Elegant Purple', primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b' },
    { name: 'Organic Brown', primary: '#92400e', secondary: '#059669', accent: '#d97706' },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Visual Identity
          </CardTitle>
          <CardDescription>
            Upload your organization's logo and branding assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="logo">Organization Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                {branding?.logo_url && (
                  <div className="h-20 w-20 rounded-lg border overflow-hidden bg-muted">
                    <img
                      src={branding.logo_url}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB. Recommended: 512x512px
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Your App Name"
              />
            </div>

            <Button onClick={handleBrandingUpdate} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Branding'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Color System
          </CardTitle>
          <CardDescription>
            Customize your brand colors and preview them in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={colors.primary_color}
                  onChange={(e) => setColors({ ...colors, primary_color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={colors.primary_color}
                  onChange={(e) => setColors({ ...colors, primary_color: e.target.value })}
                  placeholder="#10b981"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary"
                  type="color"
                  value={colors.secondary_color}
                  onChange={(e) => setColors({ ...colors, secondary_color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={colors.secondary_color}
                  onChange={(e) => setColors({ ...colors, secondary_color: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  value={colors.accent_color}
                  onChange={(e) => setColors({ ...colors, accent_color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={colors.accent_color}
                  onChange={(e) => setColors({ ...colors, accent_color: e.target.value })}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>
          </div>

          {/* Preset Themes */}
          <div className="space-y-3">
            <Label>Preset Themes</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setColors({
                    primary_color: theme.primary,
                    secondary_color: theme.secondary,
                    accent_color: theme.accent,
                  })}
                  className="p-3 rounded-lg border hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.primary }} />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.secondary }} />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.accent }} />
                    </div>
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleColorUpdate} disabled={isUpdating}>
            {isUpdating ? 'Applying...' : 'Apply Colors'}
          </Button>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Choose the font family for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Input
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              placeholder="e.g., Inter, Roboto, Poppins"
            />
            <p className="text-xs text-muted-foreground">
              Enter a Google Font name or system font
            </p>
          </div>
          <Button onClick={handleBrandingUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Typography'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingTab;


import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Image,
  Upload,
  Download,
  Trash2,
  Eye,
  Copy,
  Check,
  Star,
  Palette,
  Type,
  Layout
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BrandIdentityManager: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [brandAssets, setBrandAssets] = useState({
    logo: '',
    logoLight: '',
    logoDark: '',
    favicon: '',
    brandName: 'AgriTech Solutions',
    tagline: 'Transforming Agriculture Through Technology',
    brandColors: {
      primary: '#10B981',
      secondary: '#065F46',
      accent: '#34D399'
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, assetType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Create object URL for preview
          const url = URL.createObjectURL(file);
          setBrandAssets(prev => ({
            ...prev,
            [assetType]: url
          }));
          
          toast({
            title: "Upload successful",
            description: `${assetType} has been uploaded successfully`,
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadBrandKit = () => {
    toast({
      title: "Brand kit downloading",
      description: "Your complete brand assets are being prepared for download",
    });
  };

  const copyBrandGuidelines = () => {
    const guidelines = `
Brand Guidelines for ${brandAssets.brandName}

Primary Color: ${brandAssets.brandColors.primary}
Secondary Color: ${brandAssets.brandColors.secondary}
Accent Color: ${brandAssets.brandColors.accent}

Logo Usage:
- Minimum size: 32px height
- Clear space: 2x logo height on all sides
- Do not distort or modify proportions

Typography:
- Headlines: Use brand fonts consistently
- Body text: Maintain readability standards
- Color contrast: Meet WCAG AA standards
    `;

    navigator.clipboard.writeText(guidelines);
    toast({
      title: "Brand guidelines copied",
      description: "Brand guidelines have been copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Assets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo & Brand Assets
              </CardTitle>
              <CardDescription>
                Upload and manage your organization's visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Primary Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                    {brandAssets.logo ? (
                      <img src={brandAssets.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Image className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, SVG recommended. Max 2MB
                    </p>
                  </div>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Light Theme Logo</Label>
                  <div className="w-full h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-white">
                    {brandAssets.logoLight ? (
                      <img src={brandAssets.logoLight} alt="Light Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <Image className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Light</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dark Theme Logo</Label>
                  <div className="w-full h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-gray-900">
                    {brandAssets.logoDark ? (
                      <img src={brandAssets.logoDark} alt="Dark Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <Image className="w-4 h-4 text-white mx-auto mb-1" />
                        <span className="text-xs text-white">Dark</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="hidden"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>
                Define your brand's core identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input
                  value={brandAssets.brandName}
                  onChange={(e) => setBrandAssets(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Enter your brand name"
                />
              </div>

              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={brandAssets.tagline}
                  onChange={(e) => setBrandAssets(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Your brand's tagline or mission"
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Description</Label>
                <Textarea
                  placeholder="Describe your brand's values, mission, and unique value proposition..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand Preview & Guidelines */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Brand Preview
              </CardTitle>
              <CardDescription>
                See how your brand identity appears across different contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header Preview */}
              <div className="p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={brandAssets.logo} />
                    <AvatarFallback style={{ backgroundColor: brandAssets.brandColors.primary, color: 'white' }}>
                      {brandAssets.brandName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{brandAssets.brandName}</h3>
                    <p className="text-sm text-muted-foreground">{brandAssets.tagline}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: brandAssets.brandColors.primary }} className="text-white">
                    Primary Action
                  </Button>
                  <Button variant="outline" style={{ borderColor: brandAssets.brandColors.secondary }}>
                    Secondary
                  </Button>
                </div>
              </div>

              {/* Card Preview */}
              <div className="p-4 border rounded-lg" style={{ borderColor: brandAssets.brandColors.accent }}>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: brandAssets.brandColors.primary }}
                  />
                  <h4 className="font-medium">Sample Dashboard Card</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  This is how your brand colors will appear in dashboard components
                </p>
                <Badge style={{ backgroundColor: brandAssets.brandColors.accent }} className="text-white">
                  Brand Accent
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Brand Guidelines
              </CardTitle>
              <CardDescription>
                Maintain consistency across all touchpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Logo Usage</span>
                  <Badge variant="outline">✓ Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Color Contrast</span>
                  <Badge variant="outline">✓ WCAG AA</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Typography Scale</span>
                  <Badge variant="outline">✓ Consistent</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Brand Colors</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(brandAssets.brandColors).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div 
                        className="w-full h-12 rounded border mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={copyBrandGuidelines} className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Guidelines
                </Button>
                <Button variant="outline" onClick={downloadBrandKit} className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Download Kit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

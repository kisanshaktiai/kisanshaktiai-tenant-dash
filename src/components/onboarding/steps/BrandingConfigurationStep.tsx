
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Palette, CheckCircle, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface BrandingConfigurationStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const BrandingConfigurationStep: React.FC<BrandingConfigurationStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    app_name: step.step_data?.app_name || step.step_data?.appName || '',
    primary_color: step.step_data?.primary_color || step.step_data?.primaryColor || '#10B981',
    secondary_color: step.step_data?.secondary_color || step.step_data?.secondaryColor || '#3B82F6',
    logo_url: step.step_data?.logo_url || step.step_data?.logoUrl || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(formData.logo_url || '');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `logos/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      // Upload to branding-assets bucket
      const { data, error: uploadError } = await supabase.storage
        .from('branding-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        setLogoPreview('');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('branding-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      setLogoPreview(publicUrl);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
      setLogoPreview('');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    disabled: isUploading
  });

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo_url: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.app_name.trim()) {
      toast.error('Please enter an app name');
      return;
    }

    // Pass data with correct field names for the service
    onComplete({
      app_name: formData.app_name.trim(),
      logo_url: formData.logo_url,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color
    });
  };

  const handleColorChange = (colorType: 'primary_color' | 'secondary_color', value: string) => {
    setFormData(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  if (step.step_status === 'completed') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Branding Configuration Complete</h3>
        <p className="text-muted-foreground">
          Your app branding has been configured successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Logo & App Name
            </CardTitle>
            <CardDescription>
              Upload your organization's logo and set the app name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="appName">App Name *</Label>
              <Input
                id="appName"
                value={formData.app_name}
                onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                placeholder="Your Organization Name"
              />
            </div>
            
            <div>
              <Label>Logo Upload</Label>
              <div
                {...getRootProps()}
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                  isUploading && "pointer-events-none opacity-50",
                  logoPreview && "bg-muted/30"
                )}
              >
                <input {...getInputProps()} />
                
                {isUploading ? (
                  <div className="py-4">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="mx-auto max-h-24 max-w-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLogo();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      {isDragActive ? "Drop your logo here" : "Drag & drop your logo"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse (PNG, JPG, SVG up to 5MB)
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 200x200px or larger
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Scheme
            </CardTitle>
            <CardDescription>
              Choose colors that represent your brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formData.primary_color }}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formData.secondary_color }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.app_name.trim() || isLoading || isUploading}
          className="min-w-32"
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};

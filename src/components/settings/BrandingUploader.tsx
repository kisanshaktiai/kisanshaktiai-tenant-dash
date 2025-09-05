import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface BrandingUploaderProps {
  logoUrl?: string;
  onLogoChange: (url: string) => void;
}

export const BrandingUploader: React.FC<BrandingUploaderProps> = ({
  logoUrl,
  onLogoChange,
}) => {
  const [preview, setPreview] = useState<string>(logoUrl || '');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onLogoChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    },
    multiple: false,
    maxSize: 5242880 // 5MB
  });

  const removeLogo = () => {
    setPreview('');
    onLogoChange('');
  };

  return (
    <div className="space-y-4">
      <Label>App Logo</Label>
      
      <Card
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed p-8 text-center cursor-pointer transition-all",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          preview && "bg-muted/30"
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Logo preview"
              className="mx-auto max-h-32 max-w-full object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={(e) => {
                e.stopPropagation();
                removeLogo();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Drop your logo here" : "Drag & drop your logo"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse (PNG, JPG, SVG up to 5MB)
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            Recommended: 512x512px minimum, transparent background
          </p>
        </div>
        {preview && (
          <Button variant="outline" size="sm" onClick={removeLogo}>
            Remove Logo
          </Button>
        )}
      </div>
    </div>
  );
};
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadWithCropProps {
  currentLogoUrl?: string;
  onUpload: (file: File) => Promise<string | void>;
  isUploading: boolean;
}

const LogoUploadWithCrop = ({ currentLogoUrl, onUpload, isUploading }: LogoUploadWithCropProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      setPreview(null);
      setSelectedFile(null);
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Organization Logo
        </CardTitle>
        <CardDescription>
          Upload your logo with drag & drop support. Recommended: 512x512px, PNG or JPG
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Logo Display */}
        {currentLogoUrl && !preview && (
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
            <div className="h-24 w-24 rounded-lg border-2 border-primary/20 overflow-hidden bg-background">
              <img
                src={currentLogoUrl}
                alt="Current Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Current Logo</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a new logo to replace this one
              </p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          {preview ? (
            <div className="space-y-4 animate-fade-in">
              <div className="mx-auto h-48 w-48 rounded-lg border-2 border-primary/20 overflow-hidden bg-background">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={handleUpload} disabled={isUploading} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop your logo here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB • Recommended: 512x512px
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="logo-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
          <p className="font-medium">Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use a square image for optimal display</li>
            <li>Ensure good contrast against both light and dark backgrounds</li>
            <li>Use PNG with transparent background for best results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoUploadWithCrop;

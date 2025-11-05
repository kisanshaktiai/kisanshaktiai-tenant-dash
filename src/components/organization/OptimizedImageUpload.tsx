import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OptimizedImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentImageUrl?: string;
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  accept?: string;
  label?: string;
}

export const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  onUpload,
  currentImageUrl,
  maxSizeMB = 2,
  maxWidth = 1000,
  maxHeight = 1000,
  accept = 'image/jpeg,image/png,image/webp',
  label = 'Upload Image',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const optimizeImage = useCallback(
    async (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            
            // Resize if needed
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to optimize image'));
                  return;
                }
                
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                resolve(optimizedFile);
              },
              'image/jpeg',
              0.85
            );
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
    },
    [maxWidth, maxHeight]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);
      try {
        // Optimize image
        const optimizedFile = await optimizeImage(file);
        
        // Create preview
        const previewUrl = URL.createObjectURL(optimizedFile);
        setPreview(previewUrl);
        
        // Upload
        await onUpload(optimizedFile);
        
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Failed to upload image');
        setPreview(currentImageUrl || null);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, optimizeImage, maxSizeMB, currentImageUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = useCallback(() => {
    setPreview(null);
    // Call parent with null to remove image
  }, []);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>
      
      {preview ? (
        <div className="relative w-full max-w-xs">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg border border-border"
            loading="lazy"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          role="button"
          aria-label="Upload image"
          tabIndex={0}
        >
          <input {...getInputProps()} aria-label="File input" />
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
          ) : (
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading
              ? 'Uploading...'
              : isDragActive
              ? 'Drop image here'
              : 'Drag & drop an image, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {maxSizeMB}MB, will be optimized to {maxWidth}x{maxHeight}
          </p>
        </div>
      )}
    </div>
  );
};

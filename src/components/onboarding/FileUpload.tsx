
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string[];
  onChange: (files: string[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  bucket?: string;
  folder?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'image/svg+xml': ['.svg']
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  bucket = 'onboarding-documents',
  folder = 'uploads'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: '',
      size: file.size,
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    const uploadPromises = acceptedFiles.map(async (file, index) => {
      const fileId = newFiles[index].id;
      const fileName = `${folder}/${fileId}-${file.name}`;

      try {
        // Upload file to Supabase storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'success', progress: 100, url: publicUrl }
            : f
        ));

        return publicUrl;
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as string[];
    
    onChange([...value, ...successfulUploads]);
    setIsUploading(false);
  }, [uploadedFiles.length, maxFiles, bucket, folder, value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: isUploading || uploadedFiles.length >= maxFiles
  });

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          or click to browse
        </p>
        <Button variant="outline" size="sm" disabled={isUploading}>
          Choose Files
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Max {maxFiles} files, {Math.round(maxSize / (1024 * 1024))}MB each
        </p>
      </div>

      {/* Uploaded files in progress */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {file.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadedFile(file.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Successfully uploaded files */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files</p>
          {value.map((url, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-success/5 rounded-lg border border-success/20"
            >
              <CheckCircle className="w-4 h-4 text-success" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Document {index + 1}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

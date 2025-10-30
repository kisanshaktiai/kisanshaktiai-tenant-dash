import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Modern2025AvatarUploaderProps {
  currentAvatar?: string;
  userName: string;
  onUpload: (file: File) => Promise<string | null>;
}

export const Modern2025AvatarUploader = ({
  currentAvatar,
  userName,
  onUpload,
}: Modern2025AvatarUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const url = await onUpload(file);
    setUploading(false);

    if (url) {
      toast.success('Avatar updated successfully');
    } else {
      toast.error('Failed to upload avatar');
      setPreviewUrl(currentAvatar);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative group">
      <div className="relative">
        <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl">
          <AvatarImage src={previewUrl} alt={userName} className="object-cover" />
          <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Upload Button Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Upload Icon Badge */}
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border-4 border-background">
          <Upload className="h-4 w-4" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

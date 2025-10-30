import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  currentAvatar?: string;
  userName?: string;
  onUpload: (file: File) => Promise<string | null>;
}

export const AvatarUploader = ({ currentAvatar, userName, onUpload }: AvatarUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      if (url) {
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentAvatar} alt={userName} />
        <AvatarFallback className="bg-primary/10 text-primary text-xl">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>
      
      <Button
        size="icon"
        variant="secondary"
        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

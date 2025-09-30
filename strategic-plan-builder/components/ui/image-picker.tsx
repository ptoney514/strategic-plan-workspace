'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  X,
  Check,
  Info
} from 'lucide-react';
import { DEFAULT_OBJECTIVE_IMAGES, IMAGE_UPLOAD_CONFIG } from '@/lib/default-images';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImagePickerProps {
  value?: string;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ImagePicker({ value, onChange, className }: ImagePickerProps) {
  const [showDefaults, setShowDefaults] = useState(!value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > IMAGE_UPLOAD_CONFIG.maxSizeBytes) {
      toast.error(`File size must be less than ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!IMAGE_UPLOAD_CONFIG.acceptedFormats.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    setUploading(true);
    try {
      // For now, we'll create a local URL
      // In production, this would upload to Supabase Storage
      const localUrl = URL.createObjectURL(file);
      
      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const expectedRatio = IMAGE_UPLOAD_CONFIG.recommendedWidth / IMAGE_UPLOAD_CONFIG.recommendedHeight;
        
        if (Math.abs(aspectRatio - expectedRatio) > 0.1) {
          toast.warning(`Image aspect ratio should be ${IMAGE_UPLOAD_CONFIG.aspectRatio} for best results`);
        }
        
        onChange(localUrl);
        setShowDefaults(false);
        toast.success('Image selected successfully');
      };
      
      img.onerror = () => {
        toast.error('Failed to load image');
      };
      
      img.src = localUrl;
    } catch (error) {
      console.error('Failed to process image:', error);
      toast.error('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleDefaultSelect = (url: string) => {
    onChange(url);
    setShowDefaults(false);
  };

  const handleRemove = () => {
    onChange(null);
    setShowDefaults(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Image Preview */}
      {value && (
        <div className="relative">
          <div className="relative aspect-[2/1] w-full max-w-md rounded-lg overflow-hidden border border-gray-200">
            <img
              src={value}
              alt="Strategic objective"
              className="w-full h-full object-cover"
            />
            <Button
              onClick={handleRemove}
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Current image
          </p>
        </div>
      )}

      {/* Upload Options */}
      {!value && (
        <>
          {/* Custom Upload */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Upload Custom Image</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: {IMAGE_UPLOAD_CONFIG.recommendedWidth}x{IMAGE_UPLOAD_CONFIG.recommendedHeight}px ({IMAGE_UPLOAD_CONFIG.aspectRatio}), Max {IMAGE_UPLOAD_CONFIG.maxSizeMB}MB
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={IMAGE_UPLOAD_CONFIG.acceptedFormats.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Images */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Choose from Library</h4>
                  <Badge variant="secondary" className="text-xs">
                    {DEFAULT_OBJECTIVE_IMAGES.length} options
                  </Badge>
                </div>
                
                {showDefaults && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEFAULT_OBJECTIVE_IMAGES.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => handleDefaultSelect(img.url)}
                        className="group relative aspect-[2/1] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <img
                          src={img.url}
                          alt={img.description}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-xs font-medium truncate">
                              {img.name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!showDefaults && (
                  <Button
                    onClick={() => setShowDefaults(true)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Show Default Images
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
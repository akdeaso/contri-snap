'use client';

import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BackgroundSelectorProps {
  backgroundImage?: string;
  onImageChange: (url: string) => void;
}

export function BackgroundSelector({ backgroundImage, onImageChange }: BackgroundSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Background Image
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <ImageIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
          <Input
            type="text"
            value={backgroundImage || ''}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="Paste image URL..."
            className="pl-9 pr-9"
          />
          {backgroundImage && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                icon={<X />}
                onClick={() => onImageChange('')}
                aria-label="Clear background image"
              />
            </div>
          )}
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          icon={<Upload />}
        >
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}

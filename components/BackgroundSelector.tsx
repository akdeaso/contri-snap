'use client';

import { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface BackgroundSelectorProps {
  backgroundImage?: string;
  onImageChange: (url: string) => void;
}

export function BackgroundSelector({
  backgroundImage,
  onImageChange,
}: BackgroundSelectorProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3">
      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Background Settings
      </h4>

      {/* Custom URL Input */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Background Image URL
        </label>
        <div className="flex gap-2">
           <input
            type="text"
            defaultValue={backgroundImage || ''}
            placeholder="https://example.com/image.jpg"
            onBlur={(e) => {
              const url = e.target.value.trim();
              if (url && url.startsWith('http')) {
                onImageChange(url);
              } else if (!url) {
                onImageChange('');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                const url = target.value.trim();
                if (url && url.startsWith('http')) {
                  onImageChange(url);
                }
              }
            }}
            className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Paste an image URL to set the background. Use the preview area to drag and resize the image.
        </p>
      </div>

      {/* Current Selection Preview */}
      {backgroundImage && (
        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
           <ImageIcon className="h-4 w-4 text-blue-500" />
           <span className="truncate flex-1">{backgroundImage}</span>
           <button 
             onClick={() => onImageChange('')}
             className="text-red-500 hover:text-red-600"
           >
             Remove
           </button>
        </div>
      )}
    </div>
  );
}


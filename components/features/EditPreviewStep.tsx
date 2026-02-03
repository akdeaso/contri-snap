'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Download, Copy, Calendar, RotateCcw, ZoomIn, ZoomOut, MousePointer2, ExternalLink } from 'lucide-react';
import { Leaderboard } from '@/components/features/Leaderboard';
import { BackgroundSelector } from '@/components/features/BackgroundSelector';
import { Toast } from '@/components/shared/Toast';
import type { ContributorData, Contributor, BadgeType } from '@/types';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useExport } from '@/hooks/useExport';
import { useLeaderboardInteraction } from '@/hooks/useLeaderboardInteraction';
import { useEditorData } from '@/hooks/useEditorData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMonthYearToInput, parseInputToMonthYear } from '@/utils/date';

interface EditPreviewStepProps {
  data: ContributorData;
  onBack: () => void;
}

export function EditPreviewStep({ data, onBack }: EditPreviewStepProps) {
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Data management
  const { editedData, updateField, updateContributor } = useEditorData(data);

  // 2. Image Proxying
  const { proxyBackgroundUrl, proxiedAvatars, imageStatus } = useImageProxy(
    editedData.backgroundImage, 
    editedData.contributors
  );

  // 3. Export logic
  const { exporting, handleDownload, handleCopy, handleOpen } = useExport(
    leaderboardRef, 
    editedData.month, 
    editedData.year
  );

  // 4. Interaction logic
  const { scaleFactor, isDragging, handleMouseDown, handleMouseMove, handleMouseUp } = useLeaderboardInteraction(
    containerRef,
    editedData.backgroundPosition,
    editedData.backgroundImage,
    (pos) => updateField('backgroundPosition', pos)
  );

  // UI State for toast (could also be moved to a hook if needed, but keeping it simple)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const onExportAction = async (action: () => Promise<{ success?: boolean; message?: string } | void>) => {
    if (imageStatus === 'loading') {
      setToast({ message: 'Images are still being processed. Please wait a moment...', type: 'error' });
      return;
    }
    const result = await action();
    if (result && result.message) {
      setToast({ message: result.message, type: result.success ? 'success' : 'error' });
    }
  };

  const displayData = {
    ...editedData,
    backgroundImage: proxyBackgroundUrl || editedData.backgroundImage,
    contributors: editedData.contributors.map((c, i) => ({
      ...c,
      avatar_url: proxiedAvatars[i] || c.avatar_url
    }))
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header - Compact */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Edit & Preview
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        {/* Left Column - Header, Background, Preview */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* Row 1: Header Settings */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Header Settings
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Group Name
                </label>
                <Input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Visual Novel Lovers"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Date
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="month"
                    value={formatMonthYearToInput(editedData.month || '', editedData.year || '')}
                    onChange={(e) => {
                      const res = parseInputToMonthYear(e.target.value);
                      if (res) {
                        updateField('month', res.month);
                        updateField('year', res.year);
                      }
                    }}
                    className="pl-9 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Background Selector & Controls */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3">
             <BackgroundSelector
                backgroundImage={editedData.backgroundImage}
                onImageChange={(url) => updateField('backgroundImage', url)}
             />
             
             {/* Status Indicator */}
             {editedData.backgroundImage && (
               <div className="flex items-center justify-end px-1">
                 {imageStatus === 'loading' && <span className="text-[10px] text-slate-500 flex items-center gap-1">⏳ Processing image...</span>}
                 {imageStatus === 'ready' && <span className="text-[10px] text-green-600 flex items-center gap-1">✅ Ready for export</span>}
                 {imageStatus === 'error' && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠️ Remote image blocked, please upload image manually</span>}
               </div>
             )}
             
             {/* Background Resize Controls */}
             {editedData.backgroundImage && (
               <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between">
                    <span>Background Transform</span>
                    <Button 
                       variant="ghost"
                       size="sm"
                       onClick={() => {
                         updateField('backgroundScale', 1);
                         updateField('backgroundPosition', { x: 0, y: 0 });
                       }}
                       className="h-6 text-[10px] text-slate-500 hover:text-blue-500"
                    >
                       <RotateCcw className="h-3 w-3" /> Reset
                    </Button>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 text-slate-400" />
                    <input 
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.01"
                      value={editedData.backgroundScale || 1}
                      onChange={(e) => updateField('backgroundScale', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-mono text-slate-500 w-10 text-right">
                      {Math.round((editedData.backgroundScale || 1) * 100)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                     <MousePointer2 className="h-3 w-3" /> Drag image in preview to reposition
                  </p>
               </div>
             )}
          </div>

          {/* Row 3: Preview */}
          <div className="flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 relative flex items-center justify-center">
               {/* Drag Overlay Helper Text */}
               {editedData.backgroundImage && (
                 <div className={`absolute top-4 right-4 z-10 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                    Drag to move
                 </div>
               )}

              {/* Responsive Container Wrapper */}
              <div 
                ref={containerRef}
                className={`max-w-full w-full aspect-[4/5] relative overflow-hidden transition-cursor ${isDragging ? 'cursor-grabbing' : editedData.backgroundImage ? 'cursor-grab' : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                 {/* Scaled Content */}
                 <div 
                   className="origin-top-left absolute top-0 left-0"
                   style={{ 
                     transform: `scale(${scaleFactor})`, 
                     width: '1080px', 
                     height: '1350px' 
                   }}
                 >
                    {/* Shadow/Border wrapper */}
                    <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-lg border border-slate-200 dark:border-slate-800">
                      <div
                        ref={leaderboardRef}
                        style={{ width: '1080px', height: '1350px' }}
                        className="inline-block bg-slate-900" 
                      >
                        <Leaderboard data={displayData} />
                      </div>
                    </div>
                </div>
              </div>
            </div>
            
            {/* Export Buttons */}
            <div className="mt-2 flex gap-2">
              <Button
                onClick={() => onExportAction(handleDownload)}
                disabled={exporting}
                className="flex-1 font-medium shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{exporting ? 'Exporting...' : 'Download'}</span>
              </Button>
              <Button
                onClick={() => onExportAction(handleOpen)}
                disabled={exporting}
                variant="secondary"
                className="flex-1 font-medium shadow-md"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open</span>
              </Button>
              <Button
                onClick={() => onExportAction(handleCopy)}
                disabled={exporting}
                variant="default" 
                className="flex-1 bg-green-600 hover:bg-green-700 font-medium shadow-md"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Contributors Edit Form */}
        <div className="flex flex-col overflow-auto min-h-0">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 flex-1 overflow-auto min-h-0">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Contributors
            </h4>
            <div className="space-y-1.5">
              {editedData.contributors.map((contributor, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-6 flex-shrink-0">
                      #{contributor.rank}
                    </span>
                    <Input
                      type="text"
                      value={contributor.name}
                      onChange={(e) => updateContributor(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="flex-1 h-8 text-sm"
                    />
                  </div>
                  
                  <Input
                    type="text"
                    value={contributor.avatar_url}
                    onChange={(e) => updateContributor(index, 'avatar_url', e.target.value)}
                    placeholder="Avatar URL"
                    className="w-full h-7 text-xs"
                  />
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input
                      type="number"
                      value={contributor.posts}
                      onChange={(e) => updateContributor(index, 'posts', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Posts"
                      className="h-7 text-xs"
                    />
                    <Input
                      type="number"
                      value={contributor.comments}
                      onChange={(e) => updateContributor(index, 'comments', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Comments"
                      className="h-7 text-xs"
                    />
                    <Input
                      type="number"
                      value={contributor.reactions}
                      onChange={(e) => updateContributor(index, 'reactions', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Reactions"
                      className="h-7 text-xs"
                    />
                  </div>
                  
                  <select
                    value={contributor.badge || ''}
                    onChange={(e) => updateContributor(index, 'badge', e.target.value as BadgeType || null)}
                    className="flex h-7 w-full rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">No Badge</option>
                    <option value="all-star contributor">All-star Contributor</option>
                    <option value="top contributor">Top Contributor</option>
                    <option value="rising contributor">Rising Contributor</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


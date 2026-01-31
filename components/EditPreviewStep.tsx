'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Calendar, RotateCcw, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Leaderboard } from './Leaderboard';
import { BackgroundSelector } from './BackgroundSelector';
import { Toast } from './Toast';
import type { ContributorData, Contributor, BadgeType } from '@/types';

interface EditPreviewStepProps {
  data: ContributorData;
  onBack: () => void;
}

export function EditPreviewStep({ data, onBack }: EditPreviewStepProps) {
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editedData, setEditedData] = useState<ContributorData>({
    ...data,
    title: data.title || 'Visual Novel Lovers',
    month: data.month || 'Dec',
    year: data.year || '2025',
    backgroundScale: data.backgroundScale || 1,
    backgroundPosition: data.backgroundPosition || { x: 0, y: 0 },
  });

  // Image loading status
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [proxyBackgroundUrl, setProxyBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const loadProxyImage = async () => {
       if (!editedData.backgroundImage) {
          if (active) {
            setProxyBackgroundUrl(null);
            setImageStatus('ready');
          }
          return;
       }
       
       if (editedData.backgroundImage.startsWith('/') || editedData.backgroundImage.startsWith('data:')) {
          if (active) {
            setProxyBackgroundUrl(editedData.backgroundImage);
            setImageStatus('ready');
          }
          return;
       }

       if (active) setImageStatus('loading');

       try {
         console.log('[Proxy Load] Fetching:', editedData.backgroundImage);
         const res = await fetch(`/api/proxy?url=${encodeURIComponent(editedData.backgroundImage)}`);
         if (!res.ok) throw new Error(`Proxy failed: ${res.status}`);
         
         const blob = await res.blob();
         console.log('[Proxy Load] Success, blob size:', blob.size);
         if (active) {
            objectUrl = URL.createObjectURL(blob);
            setProxyBackgroundUrl(objectUrl);
            setImageStatus('ready');
         }
       } catch (e) {
         console.warn('[Proxy Load] Failed, fallback to direct.', e);
         if (active) {
            setProxyBackgroundUrl(editedData.backgroundImage);
            setImageStatus('error'); // Error means "Preview Only" (direct URL)
         }
       }
    };

    loadProxyImage();
    
    return () => {
       active = false;
       if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [editedData.backgroundImage]);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Responsive Preview State
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(0.5);

  const updateContributor = (index: number, field: keyof Contributor, value: string | number | BadgeType) => {
    const updated = { ...editedData };
    updated.contributors[index] = {
      ...updated.contributors[index],
      [field]: value,
    };
    setEditedData(updated);
  };

  // Date picker handler for month/year only
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Format: YYYY-MM
    if (value) {
      const [year, monthNum] = value.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[parseInt(monthNum) - 1] || 'Dec';
      setEditedData({ ...editedData, month, year });
    }
  };

  // Convert month name to YYYY-MM format for input
  const getDateInputValue = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.indexOf(editedData.month || 'Dec');
    const monthNum = monthIndex >= 0 ? String(monthIndex + 1).padStart(2, '0') : '12';
    return `${editedData.year || '2025'}-${monthNum}`;
  };

  const handleDownload = async () => {
    if (!leaderboardRef.current) return;
    setExporting(true);
    console.log('[Export] Starting download...');
    try {
      const dataUrl = await toPng(leaderboardRef.current, {
        width: 1080,
        height: 1350,
        quality: 1,
        pixelRatio: 2,
        skipAutoScale: true,
        cacheBust: proxyBackgroundUrl?.startsWith('blob:') ? false : true,
      });
      console.log('[Export] Generation success');
      const link = document.createElement('a');
      link.download = 'top-contributors.png';
      link.href = dataUrl;
      link.click();
      setToast({ message: 'Image downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('[Export] Error:', error);
      setToast({ message: 'Failed to export image. Check console for details.', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!leaderboardRef.current) return;
    setExporting(true);
    console.log('[Export] Starting copy...');
    try {
      const dataUrl = await toPng(leaderboardRef.current, {
        width: 1080,
        height: 1350,
        quality: 1,
        pixelRatio: 2,
        skipAutoScale: true,
        cacheBust: proxyBackgroundUrl?.startsWith('blob:') ? false : true,
      });
      console.log('[Export] Generation success');
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': fetch(dataUrl).then((r) => r.blob()),
        }),
      ]);
      setToast({ message: 'Image copied to clipboard!', type: 'success' });
    } catch (error) {
      console.error('[Export] Error:', error);
      setToast({ message: 'Failed to copy image. Check console for details.', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  // --- Scale Calculation ---
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // The original design width is 1080px.
        // We want the container to be responsive, so we calculate the scale based on the current width of the container.
        const newScale = width / 1080;
        setScaleFactor(newScale);
      }
    };

    // Calculate initial scale
    updateScale();

    // Listen for resize
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // --- Background Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editedData.backgroundImage) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos(editedData.backgroundPosition || { x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // Adjust delta by scaleFactor to keep movement 1:1 with cursor
    const deltaX = (e.clientX - dragStart.x) / scaleFactor;
    const deltaY = (e.clientY - dragStart.y) / scaleFactor;
    
    setEditedData({
      ...editedData,
      backgroundPosition: {
        x: initialPos.x + deltaX,
        y: initialPos.y + deltaY
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse up to catch dragging outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  const displayData = {
    ...editedData,
    backgroundImage: proxyBackgroundUrl || editedData.backgroundImage,
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
                <input
                  type="text"
                  value={editedData.title || 'Visual Novel Lovers'}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Visual Novel Lovers"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Date
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="month"
                    value={getDateInputValue()}
                    onChange={handleDateChange}
                    className="w-full pl-9 pr-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm cursor-pointer hover:border-slate-400 dark:hover:border-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Background Selector & Controls */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3">
             <BackgroundSelector
                backgroundImage={editedData.backgroundImage}
                onImageChange={(url) => setEditedData({ ...editedData, backgroundImage: url })}
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
                    <button 
                       onClick={() => setEditedData({ ...editedData, backgroundScale: 1, backgroundPosition: { x: 0, y: 0 } })}
                       className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors"
                    >
                       <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 text-slate-400" />
                    <input 
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.01"
                      value={editedData.backgroundScale || 1}
                      onChange={(e) => setEditedData({ ...editedData, backgroundScale: parseFloat(e.target.value) })}
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
              {/* Aspect Ratio 4:5 (1080:1350) */}
              <div 
                ref={containerRef}
                className={`max-w-full w-full aspect-[4/5] relative overflow-hidden transition-cursor ${isDragging ? 'cursor-grabbing' : editedData.backgroundImage ? 'cursor-grab' : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                 {/* Scaled Content */}
                 {/* The inner container is locked to 1080x1350 but scaled down to fit */}
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
                      {/* We wrap Leaderboard in a div that handles the export ref */}
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
              <button
                onClick={handleDownload}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{exporting ? 'Exporting...' : 'Download'}</span>
              </button>
              <button
                onClick={handleCopy}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </button>
              <button
                onClick={onBack}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
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
                    <input
                      type="text"
                      value={contributor.name}
                      onChange={(e) => updateContributor(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={contributor.avatar_url}
                    onChange={(e) => updateContributor(index, 'avatar_url', e.target.value)}
                    placeholder="Avatar URL"
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <input
                      type="number"
                      value={contributor.posts}
                      onChange={(e) => updateContributor(index, 'posts', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Posts"
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                    <input
                      type="number"
                      value={contributor.comments}
                      onChange={(e) => updateContributor(index, 'comments', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Comments"
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                    <input
                      type="number"
                      value={contributor.reactions}
                      onChange={(e) => updateContributor(index, 'reactions', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Reactions"
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  
                  <select
                    value={contributor.badge || ''}
                    onChange={(e) => updateContributor(index, 'badge', e.target.value as BadgeType || null)}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
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

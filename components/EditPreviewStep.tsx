'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Download, Copy, Calendar } from 'lucide-react';
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
  });

  const updateContributor = (index: number, field: keyof Contributor, value: string | number | BadgeType) => {
    const updated = { ...editedData };
    updated.contributors[index] = {
      ...updated.contributors[index],
      [field]: value,
    };
    setEditedData(updated);
  };

  const badgeOptions: BadgeType[] = [null, 'all-star contributor', 'top contributor', 'rising contributor'];

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
    try {
      const dataUrl = await toPng(leaderboardRef.current, {
        width: 1080,
        height: 1350,
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'top-contributors.png';
      link.href = dataUrl;
      link.click();
      setToast({ message: 'Image downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setToast({ message: 'Failed to export image. Please try again.', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!leaderboardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(leaderboardRef.current, {
        width: 1080,
        height: 1350,
        quality: 1,
        pixelRatio: 2,
      });
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': fetch(dataUrl).then((r) => r.blob()),
        }),
      ]);
      setToast({ message: 'Image copied to clipboard!', type: 'success' });
    } catch (error) {
      console.error('Copy error:', error);
      setToast({ message: 'Failed to copy image. Please try again.', type: 'error' });
    } finally {
      setExporting(false);
    }
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
        {/* Left Column - 3 Rows: Header Settings, Background Selector, Preview */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* Row 1: Header Settings */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Header Settings
            </h4>
            
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
                Date (Month & Year)
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

          {/* Row 2: Background Selector */}
          <BackgroundSelector
            backgroundImage={editedData.backgroundImage}
            backgroundFit={editedData.backgroundFit || 'cover'}
            onImageChange={(url) => setEditedData({ ...editedData, backgroundImage: url })}
            onFitChange={(fit) => setEditedData({ ...editedData, backgroundFit: fit })}
          />

          {/* Row 3: Preview */}
          <div className="flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden">
              <div className="relative" style={{ width: '540px', height: '675px' }}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur opacity-50"></div>
                <div className="relative border border-slate-300/50 dark:border-slate-600/50 rounded-lg bg-white dark:bg-slate-800 backdrop-blur-sm shadow-xl overflow-hidden" style={{ width: '540px', height: '675px' }}>
                  <div className="scale-[0.5] origin-top-left" style={{ width: '1080px', height: '1350px' }}>
                    <div
                      ref={leaderboardRef}
                      style={{ width: '1080px', height: '1350px' }}
                      className="inline-block"
                    >
                      <Leaderboard data={editedData} />
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


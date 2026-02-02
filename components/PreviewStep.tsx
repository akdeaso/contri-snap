"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  Copy,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { toPng } from "html-to-image";
import { Leaderboard } from "./Leaderboard";
import type { ContributorData } from "@/types";

interface PreviewStepProps {
  data: ContributorData;
  onExport: () => void;
  onBack: () => void;
}

export function PreviewStep({ data, onExport, onBack }: PreviewStepProps) {
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [showFullSize, setShowFullSize] = useState(false);
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear().toString();

  const [editedData, setEditedData] = useState<ContributorData>({
    ...data,
    title: data.title || "Visual Novel Lovers",
    month: data.month || currentMonth,
    year: data.year || currentYear,
  });

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

      const link = document.createElement("a");
      link.download = "top-contributors.png";
      link.href = dataUrl;
      link.click();

      onExport();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export image. Please try again.");
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
          "image/png": fetch(dataUrl).then((r) => r.blob()),
        }),
      ]);

      alert("Image copied to clipboard!");
      onExport();
    } catch (error) {
      console.error("Copy error:", error);
      alert("Failed to copy image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenInNewTab = async () => {
    if (!leaderboardRef.current) return;

    setExporting(true);
    try {
      const dataUrl = await toPng(leaderboardRef.current, {
        width: 1080,
        height: 1350,
        quality: 1,
        pixelRatio: 2,
      });

      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<img src="${dataUrl}" style="max-width: 100%; height: auto;" />`
        );
      }
    } catch (error) {
      console.error("Open error:", error);
      alert("Failed to open image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          Preview & Export
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Review your leaderboard (1080×1350px, optimized for Facebook)
        </p>
      </div>

      {/* Edit Fields */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Group Name
          </label>
          <input
            type="text"
            value={editedData.title || "Visual Novel Lovers"}
            onChange={(e) =>
              setEditedData({ ...editedData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Visual Novel Lovers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Month (3 letters)
          </label>
          <input
            type="text"
            value={editedData.month || currentMonth}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                month: e.target.value.substring(0, 3),
              })
            }
            maxLength={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder={currentMonth}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Year
          </label>
          <input
            type="text"
            value={editedData.year || currentYear}
            onChange={(e) =>
              setEditedData({ ...editedData, year: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={currentYear}
          />
        </div>
      </div>

      {/* Main Content - Centered Preview */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
        {/* Preview Container - Centered */}
        <div className="shrink-0">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative border-2 border-slate-300/50 dark:border-slate-600/50 rounded-xl p-3 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm shadow-2xl">
              <div className="scale-[0.4] origin-top-left inline-block">
                <div
                  ref={leaderboardRef}
                  style={{ width: "1080px", height: "1350px" }}
                >
                  <Leaderboard data={editedData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Compact Grid */}
        <div className="shrink-0 w-full max-w-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={handleDownload}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4" />
              <span>{exporting ? "Exporting..." : "Download"}</span>
            </button>
            <button
              onClick={handleCopy}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleOpenInNewTab}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open</span>
            </button>
            <button
              onClick={() => setShowFullSize(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Full Size</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium col-span-2 md:col-span-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {showFullSize && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullSize(false)}
        >
          <div
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ width: "1080px", height: "1350px" }}
              className="scale-75"
            >
              <Leaderboard data={editedData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

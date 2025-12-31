'use client';

import { CheckCircle, RotateCcw } from 'lucide-react';
import type { ContributorData } from '@/types';

interface ExportStepProps {
  data: ContributorData;
  onReset: () => void;
}

export function ExportStep({ onReset }: ExportStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Export Complete!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your leaderboard image has been exported successfully.
        </p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          The image is optimized for Facebook feed (square format).
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Size: 1200 x 1200 px (1:1 aspect ratio)
        </p>
      </div>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Create New Leaderboard
      </button>
    </div>
  );
}

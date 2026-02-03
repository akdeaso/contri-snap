'use client';

import { CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContributorData } from '@/types';

interface ExportStepProps {
  data: ContributorData;
  onReset: () => void;
}

export function ExportStep({ onReset }: ExportStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          All Done!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md">
          Your contributor leaderboard has been successfully generated and is ready to share.
        </p>
      </div>

      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="gap-2 font-semibold"
      >
        <RotateCcw className="h-5 w-5" />
        Create Another One
      </Button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PasteStep } from '@/components/features/PasteStep';
import { ParseStep } from '@/components/features/ParseStep';
import { EditPreviewStep } from '@/components/features/EditPreviewStep';
import { ExportStep } from '@/components/features/ExportStep';
import type { Step, ContributorData } from '@/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('paste');
  const [html, setHtml] = useState<string>('');
  const [data, setData] = useState<ContributorData | null>(null);

  const handlePaste = (htmlString: string) => {
    setHtml(htmlString);
    setCurrentStep('parse');
  };

  const handleParseComplete = (parsedData: ContributorData) => {
    setData(parsedData);
    setCurrentStep('edit');
  };

  const handleExportComplete = () => {
    setCurrentStep('export');
  };

  const handleReset = () => {
    setCurrentStep('paste');
    setHtml('');
    setData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            contri-canvas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Turn raw Facebook Top Contributors HTML into a clean, modern, share-ready image.
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          {currentStep === 'paste' && (
            <PasteStep onParse={handlePaste} />
          )}
          {currentStep === 'parse' && html && (
            <ParseStep
              html={html}
              onComplete={handleParseComplete}
              onBack={() => setCurrentStep('paste')}
            />
          )}
          {currentStep === 'edit' && data && (
            <EditPreviewStep
              data={data}
              onBack={() => setCurrentStep('parse')}
            />
          )}
          {currentStep === 'export' && data && (
            <ExportStep
              data={data}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

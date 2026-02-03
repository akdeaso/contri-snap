'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseHTML, parseDate } from '@/lib/htmlParser';
import type { ContributorData } from '@/types';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { DEFAULT_GROUP_NAME } from '@/constants';

interface ParseStepProps {
  html: string;
  onComplete: (data: ContributorData) => void;
  onBack: () => void;
}

export function ParseStep({ html, onComplete, onBack }: ParseStepProps) {
  const [parsing, setParsing] = useState(true);
  const [result, setResult] = useState<ContributorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parse = async () => {
      try {
        setParsing(true);
        const contributors = parseHTML(html);
        const dateInfo = parseDate(html);
        
        const data: ContributorData = {
          contributors,
          title: DEFAULT_GROUP_NAME,
          month: dateInfo?.month || getCurrentMonth(),
          year: dateInfo?.year || getCurrentYear(),
        };

        setResult(data);
        setError(null);
      } catch (err) {
        console.error('Parse error:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse HTML');
      } finally {
        setParsing(false);
      }
    };

    parse();
  }, [html]);

  const handleContinue = () => {
    if (result) {
      onComplete(result);
    }
  };

  const isValid = result && result.contributors.filter(c => c.name.trim() !== '').length >= 10;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Step 2: Parse HTML
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Extracting contributor data from HTML...
        </p>
      </div>

      {parsing && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Parsing HTML structure...</p>
        </div>
      )}

      {!parsing && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Parsing Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!parsing && result && (
        <div className="space-y-4">
          <div className={`bg-${isValid ? 'green' : 'yellow'}-50 dark:bg-${isValid ? 'green' : 'yellow'}-900/20 border border-${isValid ? 'green' : 'yellow'}-200 dark:border-${isValid ? 'green' : 'yellow'}-800 rounded-lg p-6`}>
            <div className="flex items-start gap-3">
              {isValid ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold text-${isValid ? 'green' : 'yellow'}-900 dark:text-${isValid ? 'green' : 'yellow'}-200 mb-1`}>
                  {isValid ? 'Parsing Successful' : 'Incomplete Data'}
                </h3>
                <p className={`text-sm text-${isValid ? 'green' : 'yellow'}-700 dark:text-${isValid ? 'green' : 'yellow'}-300`}>
                  Found {result.contributors.filter(c => c.name.trim() !== '').length} contributors with data.
                  {!isValid && ' Please edit manually to fill all 10 contributors.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleContinue}
              className="px-6"
            >
              Continue to Edit
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Clipboard, ArrowRight, HelpCircle, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSampleHtml } from '@/lib/actions';

interface PasteStepProps {
  onParse: (html: string) => void;
}

export function PasteStep({ onParse }: PasteStepProps) {
  const [html, setHtml] = useState('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (html.trim()) {
      onParse(html);
    }
  };

  const handleUseSample = async () => {
    setIsLoadingSample(true);
    try {
      const sample = await getSampleHtml();
      setHtml(sample);
    } catch (error) {
      console.error('Failed to load sample:', error);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Step 1: Paste HTML
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-0">
            Open your Facebook Group Top Contributors page, right-click and select "View Page Source" or use Inspect Element to copy the HTML of the contributor list.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseSample}
          disabled={isLoadingSample}
          className="flex-shrink-0"
        >
          <FileCode className="h-4 w-4 mr-2" />
          {isLoadingSample ? 'Loading...' : 'Use Sample'}
        </Button>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Quick Tip:</p>
          <p>Go to Group Settings &gt; Top Contributors. Scroll down until all 10 members are loaded, then copy the parent container HTML.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste the HTML here..."
            className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {!html && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <Clipboard className="h-20 w-20" />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!html.trim()}
          size="lg"
          className="w-full text-lg font-semibold shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          Parse Contributors
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </form>
    </div>
  );
}

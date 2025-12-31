'use client';

import { useState } from 'react';
import { FileText, ArrowRight } from 'lucide-react';

interface PasteStepProps {
  onParse: (html: string) => void;
}

export function PasteStep({ onParse }: PasteStepProps) {
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const handleParse = () => {
    if (!html.trim()) {
      setError('Please paste HTML content');
      return;
    }

    setError('');
    onParse(html.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Step 1: Paste HTML
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Copy the HTML outer element from Facebook Top Contributors and paste it here.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Tip: Right-click on the Top Contributors section → Inspect → Right-click the container element → Copy → Copy outerHTML
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            HTML Outer String
          </label>
          <textarea
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              setError('');
            }}
            placeholder="Paste HTML here..."
            className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <button
          onClick={handleParse}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FileText className="h-5 w-5" />
          Parse HTML
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}



'use client';

import { useState } from 'react';
import { ArrowLeft, Check, ArrowRight } from 'lucide-react';
import type { ContributorData, Contributor, BadgeType } from '@/types';

interface EditStepProps {
  data: ContributorData;
  onUpdate: (data: ContributorData) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function EditStep({ data, onUpdate, onComplete, onBack }: EditStepProps) {
  const [editedData, setEditedData] = useState<ContributorData>(data);

  const updateContributor = (index: number, field: keyof Contributor, value: string | number | BadgeType) => {
    const updated = { ...editedData };
    updated.contributors[index] = {
      ...updated.contributors[index],
      [field]: value,
    };
    setEditedData(updated);
    onUpdate(updated);
  };

  const isValid = editedData.contributors.every(
    (c) => c.name.trim() !== '' && 
           c.avatar_url.trim() !== '' &&
           c.posts >= 0 && 
           c.comments >= 0 &&
           c.reactions >= 0
  ) && editedData.contributors.length === 10;

  const badgeOptions: BadgeType[] = [null, 'all-star contributor', 'top contributor', 'rising contributor'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Step 3: Edit Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Review and edit the extracted data. All 10 contributors must be filled.
        </p>
        {!isValid && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            ⚠️ All 10 contributors must have name, avatar, and valid stats before generating image.
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-700">
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Rank
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Avatar
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Name *
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Posts *
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Comments *
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Reactions *
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Badge
              </th>
            </tr>
          </thead>
          <tbody>
            {editedData.contributors.map((contributor, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {contributor.rank}
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                  <div className="flex items-center gap-2">
                    {contributor.avatar_url ? (
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.name || `User ${contributor.rank}`}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                        No img
                      </div>
                    )}
                    <input
                      type="text"
                      value={contributor.avatar_url}
                      onChange={(e) => updateContributor(index, 'avatar_url', e.target.value)}
                      placeholder="Avatar URL (required)"
                      className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                      required
                    />
                  </div>
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                  <input
                    type="text"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, 'name', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    required
                  />
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                  <input
                    type="number"
                    value={contributor.posts}
                    onChange={(e) => updateContributor(index, 'posts', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    required
                  />
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                  <input
                    type="number"
                    value={contributor.comments}
                    onChange={(e) => updateContributor(index, 'comments', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    required
                  />
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                  <input
                    type="number"
                    value={contributor.reactions}
                    onChange={(e) => updateContributor(index, 'reactions', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    required
                  />
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                  <select
                    value={contributor.badge || ''}
                    onChange={(e) => updateContributor(index, 'badge', e.target.value as BadgeType || null)}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="">None</option>
                    <option value="all-star contributor">All-star Contributor</option>
                    <option value="top contributor">Top Contributor</option>
                    <option value="rising contributor">Rising Contributor</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onComplete}
          disabled={!isValid}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          Generate Image
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

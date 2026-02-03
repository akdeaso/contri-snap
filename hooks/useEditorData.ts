import { useState } from 'react';
import type { ContributorData, Contributor, BadgeType } from '@/types';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { DEFAULT_GROUP_NAME } from '@/constants';

export function useEditorData(initialData: ContributorData) {
  const [editedData, setEditedData] = useState<ContributorData>({
    ...initialData,
    title: initialData.title || DEFAULT_GROUP_NAME,
    month: initialData.month || getCurrentMonth(),
    year: initialData.year || getCurrentYear(),
    backgroundScale: initialData.backgroundScale || 1,
    backgroundPosition: initialData.backgroundPosition || { x: 0, y: 0 },
  });

  const updateField = (field: keyof ContributorData, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const updateContributor = (index: number, field: keyof Contributor, value: string | number | BadgeType) => {
    const updatedContributors = [...editedData.contributors];
    updatedContributors[index] = {
      ...updatedContributors[index],
      [field]: value,
    };
    setEditedData(prev => ({ ...prev, contributors: updatedContributors }));
  };

  return { editedData, updateField, updateContributor };
}

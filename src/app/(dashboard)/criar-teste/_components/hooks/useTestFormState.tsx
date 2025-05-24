'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from 'convex/react';
import { GenericQueryCtx } from 'convex/server';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { type TestFormData, testFormSchema } from '../schema';

// Map UI question modes to API question modes
export const mapQuestionMode = (
  mode: string,
): 'all' | 'unanswered' | 'incorrect' | 'bookmarked' => {
  switch (mode) {
    case 'marked': {
      return 'bookmarked';
    }
    case 'unused': {
      return 'unanswered';
    }
    case 'incorrect': {
      return 'incorrect';
    }
    default: {
      return 'all';
    }
  }
};

export function useTestFormState() {
  const [availableQuestionCount, setAvailableQuestionCount] = useState<
    number | undefined
  >();
  const [isCountLoading, setIsCountLoading] = useState(false);

  const form = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: 'Personalizado',
      testMode: 'study',
      questionMode: 'all',
      numQuestions: 30,
      selectedThemes: [],
      selectedSubthemes: [],
      selectedGroups: [],
    },
  });

  // Extract values from form
  const { watch, handleSubmit } = form;
  const testMode = watch('testMode');
  const selectedThemes = watch('selectedThemes');
  const selectedSubthemes = watch('selectedSubthemes');
  const selectedGroups = watch('selectedGroups');
  const questionMode = watch('questionMode');
  const numQuestions = watch('numQuestions');

  // Query the count of available questions based on current selection
  const countQuestions = useQuery(
    api.questionAnalytics.countSelectedQuestions,
    {
      questionMode: mapQuestionMode(questionMode || 'all'),
      selectedThemes: selectedThemes as Id<'themes'>[],
      selectedSubthemes: selectedSubthemes as Id<'subthemes'>[],
      selectedGroups: selectedGroups as Id<'groups'>[],
    },
  );

  // Update available question count when Convex query result changes
  useEffect(() => {
    setAvailableQuestionCount(countQuestions?.count);
    setIsCountLoading(countQuestions === undefined);
  }, [countQuestions]);

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData);

  return {
    form,
    handleSubmit,
    testMode,
    questionMode,
    numQuestions,
    selectedThemes,
    selectedSubthemes,
    selectedGroups,
    availableQuestionCount,
    isCountLoading,
    hierarchicalData,
    mapQuestionMode,
  };
}

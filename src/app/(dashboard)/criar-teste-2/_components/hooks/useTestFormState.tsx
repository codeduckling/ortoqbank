'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { type TestFormData, testFormSchema } from '../schema';

// Map UI question modes to API question modes for the new filtering logic
export const mapQuestionMode = (
  mode: string,
): 'all' | 'unanswered' | 'incorrect' | 'bookmarked' => {
  switch (mode) {
    case 'bookmarked': {
      return 'bookmarked';
    }
    case 'unanswered': {
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

  // Query the count of available questions using the NEW filtering logic
  const countQuestions = useQuery(api.questionFiltering.getLiveQuestionCount, {
    questionMode: mapQuestionMode(questionMode || 'all'),
    selectedThemes: selectedThemes || [],
    selectedSubthemes: selectedSubthemes || [],
    selectedGroups: selectedGroups || [],
  });

  // Update available question count when Convex query result changes
  useEffect(() => {
    setAvailableQuestionCount(countQuestions);
    setIsCountLoading(countQuestions === undefined);
  }, [countQuestions]);

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData, {});

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

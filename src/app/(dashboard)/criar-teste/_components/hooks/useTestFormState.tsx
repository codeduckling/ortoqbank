'use client';

import { useUser } from '@clerk/nextjs';
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
  const { isLoaded, isSignedIn } = useUser();
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

  // Only query when user is authenticated
  const isAuthenticated = isLoaded && isSignedIn;

  // Query the count of available questions based on current selection
  const countQuestions = 1; /* useQuery(
    api.questionAnalytics.countSelectedQuestions,
    isAuthenticated
      ? {
          questionMode: mapQuestionMode(questionMode || 'all'),
          selectedThemes: selectedThemes as Id<'themes'>[],
          selectedSubthemes: selectedSubthemes as Id<'subthemes'>[],
          selectedGroups: selectedGroups as Id<'groups'>[],
        }
      : 'skip',
  ); */

  // Fetch hierarchical data only when authenticated
  const hierarchicalData = useQuery(
    api.themes.getHierarchicalData,
    isAuthenticated ? {} : 'skip',
  );

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
    isAuthenticated,
  };
}

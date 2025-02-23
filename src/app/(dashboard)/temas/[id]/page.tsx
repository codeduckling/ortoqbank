'use client';

import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';

import Quiz from '@/components/quiz/Quiz';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

export default function QuizPage() {
  const { id } = useParams() as { id: string };

  const quiz = useQuery(api.presetQuizzes.getWithQuestions, {
    id: id as Id<'presetQuizzes'>,
  });

  // Filter out any null questions to avoid runtime errors
  const validQuestions =
    quiz?.questions.filter((q): q is NonNullable<typeof q> => q !== null) || [];

  if (!quiz) return <div>Loading...</div>;

  return <Quiz quizId={id as Id<'presetQuizzes'>} />;
}

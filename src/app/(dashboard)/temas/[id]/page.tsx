'use client';

import { useParams } from 'next/navigation';

import Quiz from '@/components/quiz/Quiz';

import { Id } from '../../../../../convex/_generated/dataModel';

export default function QuizPage() {
  const { id } = useParams() as {
    id: Id<'presetQuizzes'> | Id<'customQuizzes'>;
  };

  return <Quiz quizId={id} mode="study" />;
}

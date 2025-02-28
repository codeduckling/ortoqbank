'use client';

import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';

import Quiz from '@/components/quiz/Quiz';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

export default function QuizPage() {
  const { id } = useParams() as {
    id: Id<'presetQuizzes'> | Id<'customQuizzes'>;
  };

  // Fetch the quiz data from the database to get the secure mode
  const quizSession = useQuery(api.quizSessions.getCurrentSession, {
    quizId: id,
  });

  // Show loading state while fetching quiz data
  if (!quizSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando quiz...
      </div>
    );
  }

  // Get the mode from the database instead of URL parameters
  const mode = quizSession.mode || 'study';

  return <Quiz quizId={id} mode={mode} />;
}

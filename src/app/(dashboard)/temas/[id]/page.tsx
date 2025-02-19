'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';

import { QuizWrapper } from '@/components/quiz/quiz-wrapper';
import { QuizMode } from '@/components/quiz/types';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const quiz = useQuery(api.presetQuizzes.getWithQuestions, {
    id: id as Id<'presetQuizzes'>,
  });
  const activeSession = useQuery(api.quizSessions.getActiveSessionForQuiz, {
    presetQuizId: resolvedParams.id as Id<'presetQuizzes'>,
    status: 'in_progress',
  });

  if (activeSession) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">
          Existe um teste em aberto deseja finalizar?
        </div>
      </div>
    );
  }

  if (!quiz || !user || activeSession === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const mode: QuizMode = 'study';

  return (
    <QuizWrapper
      questions={quiz.questions}
      name={quiz.name}
      mode={mode}
      sessionId={activeSession?._id}
    />
  );
}
